<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Donor;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class DonorAuthController extends Controller
{
    // Donor login
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $donor = Donor::where('email', $request->email)->first();

        if (! $donor || ! Hash::check($request->password, $donor->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $donor->tokens()->delete();

        $token = $donor->createToken('donor-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'donor' => [
                'id' => $donor->id,
                'full_name' => $donor->full_name,
                'email' => $donor->email,
            ],
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}