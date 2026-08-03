<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BloodRequest;
use App\Models\Donation;
use App\Models\Donor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
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

        $bloodRequest = BloodRequest::create($validated);

        return response()->json([
            'message' => 'Your request has been received. Our team will reach out to a matching donor shortly.',
            'request' => $bloodRequest,
        ], 201);
    }

    public function index(Request $request)
    {
        $query = BloodRequest::with('matchedDonor:id,full_name,phone,email,city,blood_group');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return response()->json(
            $query->latest()->get()
        );
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
        $isNewMatch = $newDonorId && $newDonorId !== $bloodRequest->matched_donor_id;

        \Log::info('matchDonor called', [
            'blood_request_id' => $bloodRequest->id,
            'new_donor_id' => $newDonorId,
            'previous_donor_id' => $bloodRequest->matched_donor_id,
            'is_new_match' => $isNewMatch,
        ]);

        $bloodRequest->update(['matched_donor_id' => $newDonorId]);

        if ($isNewMatch) {
            $this->notifyOfMatch($bloodRequest->fresh());
        }

        return response()->json([
            'message' => $validated['donor_id'] ? 'Donor matched to request' : 'Donor unmatched',
            'request' => $bloodRequest->load('matchedDonor:id,full_name,phone,email,city,blood_group'),
        ]);
    }

    private function notifyOfMatch(BloodRequest $bloodRequest)
    {
        \Log::info('notifyOfMatch started', ['blood_request_id' => $bloodRequest->id]);

        $donor = $bloodRequest->matchedDonor;

        if ($donor && $donor->email) {
            \Log::info('Sending donor match email', ['donor_email' => $donor->email]);

            $response = Http::post('https://api.emailjs.com/api/v1.0/email/send', [
                'service_id' => env('EMAILJS_MATCH_SERVICE_ID'),
                'template_id' => env('EMAILJS_DONOR_MATCH_TEMPLATE_ID'),
                'user_id' => env('EMAILJS_MATCH_PUBLIC_KEY'),
                'accessToken' => env('EMAILJS_MATCH_PRIVATE_KEY'),
                'template_params' => [
                    'email' => $donor->email,
                    'name' => $donor->full_name,
                    'blood_group' => $bloodRequest->blood_group,
                    'city' => $bloodRequest->city ?? 'unspecified location',
                ],
            ]);

            if ($response->failed()) {
                \Log::error('EmailJS donor match email failed', ['response' => $response->body()]);
            } else {
                \Log::info('EmailJS donor match email sent OK', ['response' => $response->body()]);
            }
        } else {
            \Log::info('Skipped donor match email — no donor or no donor email', [
                'donor_exists' => (bool) $donor,
                'donor_email' => $donor->email ?? null,
            ]);
        }

        if ($bloodRequest->requester_email) {
            \Log::info('Sending requester match email', ['requester_email' => $bloodRequest->requester_email]);

            $response = Http::post('https://api.emailjs.com/api/v1.0/email/send', [
                'service_id' => env('EMAILJS_MATCH_SERVICE_ID'),
                'template_id' => env('EMAILJS_REQUESTER_MATCH_TEMPLATE_ID'),
                'user_id' => env('EMAILJS_MATCH_PUBLIC_KEY'),
                'accessToken' => env('EMAILJS_MATCH_PRIVATE_KEY'),
                'template_params' => [
                    'email' => $bloodRequest->requester_email,
                    'name' => $bloodRequest->requester_name,
                    'blood_group' => $bloodRequest->blood_group,
                ],
            ]);

            if ($response->failed()) {
                \Log::error('EmailJS requester match email failed', ['response' => $response->body()]);
            } else {
                \Log::info('EmailJS requester match email sent OK', ['response' => $response->body()]);
            }
        } else {
            \Log::info('Skipped requester match email — no requester_email on file');
        }
    }

    public function updateStatus(Request $request, BloodRequest $bloodRequest)
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['pending', 'contacted', 'closed'])],
            'outcome' => ['nullable', Rule::in(['fulfilled', 'no_show', 'requester_cancelled', 'other'])],
        ]);

        $bloodRequest->update($validated);

        if (($validated['outcome'] ?? null) === 'fulfilled' && $bloodRequest->matched_donor_id) {
            $alreadyLogged = Donation::where('blood_request_id', $bloodRequest->id)->exists();

            if (! $alreadyLogged) {
                Donation::create([
                    'donor_id' => $bloodRequest->matched_donor_id,
                    'blood_request_id' => $bloodRequest->id,
                    'blood_group' => $bloodRequest->blood_group,
                    'units' => 1,
                    'donation_date' => now()->toDateString(),
                    'location' => $bloodRequest->city,
                    'status' => 'completed',
                ]);
            }
        }

        return response()->json([
            'message' => 'Request updated',
            'request' => $bloodRequest->fresh(),
        ]);
    }
}