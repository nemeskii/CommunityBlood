<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Donation;
use Illuminate\Http\Request;

class DonationController extends Controller
{
    // Donor: view their own donation history
    public function index(Request $request)
    {
        $donations = $request->user()->donations()->latest()->get();

        return response()->json($donations);
    }

    // Donor: log/request a new donation
    public function store(Request $request)
    {
        $validated = $request->validate([
            'blood_group' => 'required|string',
            'units' => 'required|integer|min:1',
            'donation_date' => 'required|date',
            'location' => 'nullable|string|max:255',
        ]);

        $donation = $request->user()->donations()->create($validated);

        return response()->json([
            'message' => 'Donation logged. An admin will verify it shortly.',
            'donation' => $donation,
        ], 201);
    }

    // Admin: view all donations (optionally filtered by status)
    public function adminIndex(Request $request)
    {
        $query = Donation::with('donor:id,full_name,phone')->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return response()->json($query->get());
    }

    // Admin: approve or reject a donation
    public function updateStatus(Request $request, Donation $donation)
    {
        $validated = $request->validate([
            'status' => 'required|in:completed,cancelled',
        ]);

        $donation->update(['status' => $validated['status']]);

        // On approval, update the donor's record: mark last donation date,
        // and set them unavailable while they recover
        if ($validated['status'] === 'completed') {
            $donation->donor->update([
                'last_donation_date' => $donation->donation_date,
                'available' => false,
            ]);
        }

        return response()->json([
            'message' => 'Donation ' . $validated['status'],
            'donation' => $donation,
        ]);
    }
}