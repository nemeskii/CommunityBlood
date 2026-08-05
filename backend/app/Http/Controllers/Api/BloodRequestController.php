<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\SendMatchNotifications;
use App\Models\BloodRequest;
use App\Models\BloodRequestMatch;
use App\Models\Donation;
use App\Models\Donor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class BloodRequestController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'requester_name' => 'required|string|max:255',
            'requester_phone' => 'required|string|max:20',
            'requester_email' => 'nullable|email|max:255',
            'blood_group' => ['required', Rule::in(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])],
            'city' => 'nullable|string|max:255',
            'reason' => 'nullable|string|max:1000',
        ]);

        $donor = $request->user('sanctum');
        if ($donor instanceof Donor) {
            $validated['donor_id'] = $donor->id;
        }

        $bloodRequest = BloodRequest::create($validated);

        return response()->json([
            'message' => 'Your request has been received. Our team will reach out to a matching donor shortly.',
            'request' => $bloodRequest,
        ], 201);
    }

    public function myRequests(Request $request)
    {
        $requests = $request->user()
            ->bloodRequests()
            ->with('activeMatch.donor:id,full_name,phone')
            ->latest()
            ->get();

        return response()->json($requests);
    }

    public function index(Request $request)
    {
        $query = BloodRequest::with([
            'matchedDonor:id,full_name,phone,email,city,blood_group',
            'activeMatch.donor:id,full_name,phone,email,city,blood_group',
        ]);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return response()->json(
            $query->latest()->get()
        );
    }

    public function matchHistory(BloodRequest $bloodRequest)
    {
        $matches = $bloodRequest->matches()
            ->with('donor:id,full_name,phone,email,city,blood_group')
            ->latest()
            ->get();

        return response()->json($matches);
    }

    public function suggestedDonors(BloodRequest $bloodRequest)
    {
        $query = Donor::where('blood_group', $bloodRequest->blood_group)
            ->where('available', true);

        if ($bloodRequest->requester_email) {
            $query->where('email', '!=', $bloodRequest->requester_email);
        }

        $donors = $query->get(['id', 'full_name', 'phone', 'email', 'city', 'blood_group']);

        if ($bloodRequest->city) {
            $donors = $donors->sortByDesc(function ($donor) use ($bloodRequest) {
                return strcasecmp($donor->city, $bloodRequest->city) === 0;
            })->values();
        }

        return response()->json($donors);
    }

    public function matchDonor(Request $request, BloodRequest $bloodRequest)
    {
        $validated = $request->validate([
            'donor_id' => 'nullable|exists:donors,id',
        ]);

        $newDonorId = $validated['donor_id'] ?? null;

        $result = DB::transaction(function () use ($bloodRequest, $newDonorId) {
            $previousMatch = $bloodRequest->activeMatch;
            if ($previousMatch && $previousMatch->isRespondable()) {
                $previousMatch->update(['status' => 'cancelled']);
            }

            if (! $newDonorId) {
                $bloodRequest->update([
                    'matched_donor_id' => null,
                    'active_match_id' => null,
                ]);

                return null;
            }

            $match = BloodRequestMatch::create([
                'blood_request_id' => $bloodRequest->id,
                'donor_id' => $newDonorId,
                'status' => 'proposed',
                'confirm_token' => Str::random(48),
                'expires_at' => now()->addHours(48),
            ]);

            $bloodRequest->update([
                'matched_donor_id' => $newDonorId,
                'active_match_id' => $match->id,
            ]);

            return $match;
        });

        if ($result) {
            dispatch(new SendMatchNotifications($result->id))->afterResponse();
        }

        return response()->json([
            'message' => $newDonorId ? 'Donor matched to request — awaiting confirmation' : 'Donor unmatched',
            'request' => $bloodRequest->fresh()->load('activeMatch.donor'),
        ]);
    }
    
    public function resendMatchNotification(BloodRequestMatch $match)
    {
        if (! $match->isRespondable()) {
            return response()->json(['message' => 'This match is no longer awaiting a response.'], 409);
        }

        dispatch(new SendMatchNotifications($match->id))->afterResponse();

        return response()->json([
            'message' => 'Notification re-sending…',
            'match' => $match->fresh(),
        ]);
    }

    public function updateStatus(Request $request, BloodRequest $bloodRequest)
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['pending', 'contacted', 'closed'])],
            'outcome' => ['nullable', Rule::in(['fulfilled', 'no_show', 'requester_cancelled', 'other'])],
        ]);

        $bloodRequest->update($validated);

        if (($validated['outcome'] ?? null) === 'fulfilled') {
            $donorId = optional($bloodRequest->activeMatch)->donor_id ?? $bloodRequest->matched_donor_id;

            if ($donorId) {
                $alreadyLogged = Donation::where('blood_request_id', $bloodRequest->id)->exists();

                if (! $alreadyLogged) {
                    Donation::create([
                        'donor_id' => $donorId,
                        'blood_request_id' => $bloodRequest->id,
                        'blood_group' => $bloodRequest->blood_group,
                        'units' => 1,
                        'donation_date' => now()->toDateString(),
                        'location' => $bloodRequest->city,
                        'status' => 'completed',
                    ]);
                }
            }
        }

        return response()->json([
            'message' => 'Request updated',
            'request' => $bloodRequest->fresh()->load('activeMatch.donor'),
        ]);
    }
}
