<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BloodRequest;
use App\Models\Donation;
use App\Models\Hospital;
use Illuminate\Http\Request;

class AdminHospitalController extends Controller
{
    public function index(Request $request)
    {
        $query = Hospital::query()->latest();

        if ($request->filled('approved')) {
            $query->where('approved', $request->boolean('approved'));
        }

        return response()->json($query->get());
    }

    public function approve(Hospital $hospital)
    {
        $hospital->update(['approved' => true]);

        return response()->json(['message' => 'Hospital approved', 'hospital' => $hospital]);
    }

    public function reject(Hospital $hospital)
    {
        $hospital->tokens()->delete();
        $hospital->update(['approved' => false]);

        return response()->json(['message' => 'Hospital access revoked', 'hospital' => $hospital]);
    }

    public function destroy(Hospital $hospital)
    {
        $hospital->delete();

        return response()->json(['message' => 'Hospital removed']);
    }

    public function confirmations(Request $request)
    {
        $donations = Donation::whereNotNull('hospital_id')
            ->with(['donor:id,full_name,phone', 'hospital:id,name'])
            ->get()
            ->map(function ($donation) {
                return [
                    'kind' => 'donation',
                    'id' => $donation->id,
                    'reference_code' => $donation->reference_code,
                    'name' => $donation->donor?->full_name,
                    'phone' => $donation->donor?->phone,
                    'blood_group' => $donation->blood_group,
                    'hospital' => $donation->hospital?->name,
                    'confirmed_at' => $donation->verified_at,
                ];
            });

        $bloodRequests = BloodRequest::whereNotNull('hospital_id')
            ->with('hospital:id,name')
            ->get()
            ->map(function ($bloodRequest) {
                return [
                    'kind' => 'blood_request',
                    'id' => $bloodRequest->id,
                    'reference_code' => $bloodRequest->reference_code,
                    'name' => $bloodRequest->requester_name,
                    'phone' => $bloodRequest->requester_phone,
                    'blood_group' => $bloodRequest->blood_group,
                    'hospital' => $bloodRequest->hospital?->name,
                    'confirmed_at' => $bloodRequest->hospital_confirmed_at,
                ];
            });

        $confirmations = $donations->concat($bloodRequests)
            ->sortByDesc('confirmed_at')
            ->values();

        return response()->json($confirmations);
    }
}
