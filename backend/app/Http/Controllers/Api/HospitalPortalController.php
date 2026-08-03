<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BloodRequest;
use App\Models\Donation;
use App\Models\Hospital;
use Illuminate\Http\Request;

class HospitalPortalController extends Controller
{
    private function requireHospital(Request $request): Hospital
    {
        $hospital = $request->user();

        abort_unless($hospital instanceof Hospital, 403, 'Not authorized');
        abort_unless($hospital->approved, 403, 'This hospital account is awaiting admin approval.');

        return $hospital;
    }

    // Hospital: list everything this hospital has confirmed, most recent first —
    // donations and blood requests interleaved into one feed.
    public function history(Request $request)
    {
        $hospital = $this->requireHospital($request);

        $donations = $hospital->donations()
            ->with('donor:id,full_name,phone')
            ->get()
            ->map(function ($donation) {
                return [
                    'kind' => 'donation',
                    'id' => $donation->id,
                    'reference_code' => $donation->reference_code,
                    'name' => $donation->donor?->full_name,
                    'phone' => $donation->donor?->phone,
                    'blood_group' => $donation->blood_group,
                    'units' => $donation->units,
                    'confirmed_at' => $donation->verified_at,
                ];
            });

        $bloodRequests = $hospital->bloodRequests()
            ->get()
            ->map(function ($bloodRequest) {
                return [
                    'kind' => 'blood_request',
                    'id' => $bloodRequest->id,
                    'reference_code' => $bloodRequest->reference_code,
                    'name' => $bloodRequest->requester_name,
                    'phone' => $bloodRequest->requester_phone,
                    'blood_group' => $bloodRequest->blood_group,
                    'units' => null,
                    'confirmed_at' => $bloodRequest->hospital_confirmed_at,
                ];
            });

        $history = $donations->concat($bloodRequests)
            ->sortByDesc('confirmed_at')
            ->values();

        return response()->json($history);
    }

    // A hospital desk types/scans whatever code the donor or requester
    // shows them — "RQ-" is a blood request, "DN-" is a donation. One box,
    // one lookup, so front-desk staff don't need to know which is which.
    public function lookup(Request $request)
    {
        $this->requireHospital($request);

        $validated = $request->validate([
            'code' => 'required|string',
        ]);

        $code = strtoupper(trim($validated['code']));

        if (str_starts_with($code, 'DN-')) {
            $donation = Donation::with('donor:id,full_name,phone,email,blood_group')
                ->where('reference_code', $code)
                ->first();

            if (! $donation) {
                return response()->json(['message' => 'No donation found for that code.'], 404);
            }

            return response()->json(['type' => 'donation', 'record' => $donation]);
        }

        if (str_starts_with($code, 'RQ-')) {
            $bloodRequest = BloodRequest::with('activeMatch.donor:id,full_name,phone,email')
                ->where('reference_code', $code)
                ->first();

            if (! $bloodRequest) {
                return response()->json(['message' => 'No blood request found for that code.'], 404);
            }

            return response()->json(['type' => 'blood_request', 'record' => $bloodRequest]);
        }

        return response()->json(['message' => 'Unrecognized code format.'], 422);
    }

    // Hospital confirms a donor actually donated at their facility.
    public function confirmDonation(Request $request, Donation $donation)
    {
        $hospital = $this->requireHospital($request);

        $donation->update([
            'status' => 'completed',
            'hospital_id' => $hospital->id,
            'verified_at' => now(),
        ]);

        $donation->donor->update([
            'last_donation_date' => $donation->donation_date,
            'available' => false,
        ]);

        return response()->json([
            'message' => 'Donation confirmed',
            'donation' => $donation->fresh(),
        ]);
    }

    // Hospital confirms the requester actually received blood. Mirrors the
    // admin "close as fulfilled" path (BloodRequestController@updateStatus)
    // but the confirmation now comes from the facility, not admin say-so —
    // and logs a matching Donation record for whichever donor was matched,
    // same dedupe guard as the admin path.
    public function confirmRequest(Request $request, BloodRequest $bloodRequest)
    {
        $hospital = $this->requireHospital($request);

        $bloodRequest->update([
            'status' => 'closed',
            'outcome' => 'fulfilled',
            'hospital_id' => $hospital->id,
            'hospital_confirmed_at' => now(),
        ]);

        $donorId = optional($bloodRequest->activeMatch)->donor_id ?? $bloodRequest->matched_donor_id;

        if ($donorId) {
            $donation = Donation::where('blood_request_id', $bloodRequest->id)->first();

            if ($donation) {
                $donation->update([
                    'status' => 'completed',
                    'hospital_id' => $hospital->id,
                    'verified_at' => now(),
                ]);
            } else {
                $donation = Donation::create([
                    'donor_id' => $donorId,
                    'blood_request_id' => $bloodRequest->id,
                    'blood_group' => $bloodRequest->blood_group,
                    'units' => 1,
                    'donation_date' => now()->toDateString(),
                    'location' => $bloodRequest->city,
                    'status' => 'completed',
                    'hospital_id' => $hospital->id,
                    'verified_at' => now(),
                ]);
            }

            $donation->donor->update([
                'last_donation_date' => $donation->donation_date,
                'available' => false,
            ]);
        }

        return response()->json([
            'message' => 'Request confirmed as fulfilled',
            'request' => $bloodRequest->fresh()->load('activeMatch.donor'),
        ]);
    }
}
