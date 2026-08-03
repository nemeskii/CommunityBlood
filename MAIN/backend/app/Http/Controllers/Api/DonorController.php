<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Donor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Storage;
use App\Models\OtpVerification;
class DonorController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|unique:donors,email',
            'password' => 'required|string|min:8',
            'phone' => 'required|string|max:20',
            'date_of_birth' => 'required|date|before:-18 years|after:-100 years',
            'government_id' => 'required|digits:12|unique:donors,government_id_number',
            'government_id_document' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        $verified = OtpVerification::where('email', $validated['email'])
    ->where('verified', true)
    ->exists();
 
if (!$verified) {
    return response()->json([
        'message' => 'Please verify your email before registering.',
    ], 422);
}

        $validated['password'] = Hash::make($validated['password']);

        $path = $request->file('government_id_document')->store('government-ids', 'local');

        $donor = Donor::create([
            'full_name' => $validated['full_name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'phone' => $validated['phone'],
            'date_of_birth' => $validated['date_of_birth'],
            'government_id_number' => $validated['government_id'],
            'government_id_image' => $path,
        ]);

        $token = $donor->createToken('donor-token')->plainTextToken;

        return response()->json([
            'message' => 'Account created. Let\'s finish setting up your donor profile.',
            'token' => $token,
            'donor' => [
                'id' => $donor->id,
                'full_name' => $donor->full_name,
                'email' => $donor->email,
                'profile_complete' => $donor->profile_complete,
            ],
        ], 201);
    }

    // Protected: donor fills in blood group, gender, city, address (step 2)
    public function completeProfile(Request $request)
    {
        $validated = $request->validate([
            'blood_group' => ['required', Rule::in(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])],
            'gender' => ['required', Rule::in(['Male', 'Female', 'Other'])],
            'city' => 'required|string|max:255',
            'address' => 'nullable|string',
        ]);

        $donor = $request->user();
        $donor->update($validated);

        return response()->json([
            'message' => 'Profile completed. Thank you for becoming a donor!',
            'donor' => $donor,
        ]);
    }

    // Admin only: list all donors (with optional filters)
    public function index(Request $request)
    {
        $query = Donor::query();

        if ($request->filled('blood_group')) {
            $query->where('blood_group', $request->blood_group);
        }

        if ($request->filled('city')) {
            $query->where('city', 'like', '%' . $request->city . '%');
        }

        if ($request->filled('available')) {
            $query->where('available', $request->boolean('available'));
        }

        return response()->json(
            $query->latest()->paginate(15)
        );
    }

    /**
     * Public endpoint: available donor counts per blood type.
     */
    public function inventory()
    {
        $types = ['O-', 'O+', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

        $counts = Donor::where('available', true)
            ->selectRaw('blood_group, COUNT(*) as units')
            ->groupBy('blood_group')
            ->pluck('units', 'blood_group');

        $result = collect($types)->map(fn ($type) => [
            'type' => $type,
            'units' => $counts[$type] ?? 0,
        ]);

        return response()->json($result);
    }

    /**
     * Public endpoint: search available donor counts by blood group and/or city.
     * Returns aggregate counts only — no donor names, contact info, or IDs.
     */
    public function search(Request $request)
    {
        $request->validate([
            'blood_group' => ['nullable', Rule::in(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])],
            'city' => 'nullable|string|max:255',
        ]);

        $query = Donor::where('available', true);

        if ($request->filled('blood_group')) {
            $query->where('blood_group', $request->blood_group);
        }

        if ($request->filled('city')) {
            $query->where('city', 'like', '%' . $request->city . '%');
        }

        $total = (clone $query)->count();

        $byCity = (clone $query)
            ->whereNotNull('city')
            ->selectRaw('city, COUNT(*) as count')
            ->groupBy('city')
            ->orderByDesc('count')
            ->get();

        return response()->json([
            'blood_group' => $request->blood_group,
            'city' => $request->city,
            'total' => $total,
            'by_city' => $byCity,
        ]);
    }

    // Admin only: view single donor
    public function show(Donor $donor)
    {
        return response()->json($donor);
    }

    // Admin only: update donor
    public function update(Request $request, Donor $donor)
    {
        $validated = $request->validate([
            'available' => 'sometimes|boolean',
            'last_donation_date' => 'sometimes|nullable|date',
            'phone' => 'sometimes|string|max:20',
            'city' => 'sometimes|string|max:255',
        ]);

        $donor->update($validated);

        return response()->json(['message' => 'Donor updated', 'donor' => $donor]);
    }

    // Admin only: delete donor
    public function destroy(Donor $donor)
    {
        $donor->delete();

        return response()->json(['message' => 'Donor removed']);
    }
    // Admin only: securely view a donor's government ID image
    public function governmentId(Donor $donor)
    {
        if (!$donor->government_id_image || !Storage::disk('local')->exists($donor->government_id_image)) {
            abort(404, 'No government ID on file for this donor.');
        }

        return Storage::disk('local')->response($donor->government_id_image);
    }
}