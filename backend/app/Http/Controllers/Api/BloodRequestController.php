<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BloodRequest;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BloodRequestController extends Controller
{
    /**
     * Public: submit a request to be connected with an available donor.
     * No donor contact info is exposed here — an admin reviews and
     * reaches out to a matching donor on the requester's behalf.
     */
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

    // Admin only: list requests, optionally filtered by status
    public function index(Request $request)
    {
        $query = BloodRequest::query();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return response()->json(
            $query->latest()->get()
        );
    }

    // Admin only: update a request's status (contacted / closed)
    public function updateStatus(Request $request, BloodRequest $bloodRequest)
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['pending', 'contacted', 'closed'])],
        ]);

        $bloodRequest->update($validated);

        return response()->json([
            'message' => 'Request updated',
            'request' => $bloodRequest,
        ]);
    }
}