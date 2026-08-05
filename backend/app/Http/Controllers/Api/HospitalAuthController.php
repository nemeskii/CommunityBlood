<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Hospital;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class HospitalAuthController extends Controller
{
    
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:hospitals,email',
            'password' => 'required|string|min:8',
            'phone' => 'required|string|max:20',
            'city' => 'nullable|string|max:255',
            'address' => 'nullable|string|max:255',
        ]);

        $validated['password'] = Hash::make($validated['password']);

        $hospital = Hospital::create($validated);

        return response()->json([
            'message' => 'Registration received. An admin will review and approve your hospital before you can log in.',
            'hospital' => [
                'id' => $hospital->id,
                'name' => $hospital->name,
                'email' => $hospital->email,
            ],
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $hospital = Hospital::where('email', $request->email)->first();

        if (! $hospital || ! Hash::check($request->password, $hospital->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        if (! $hospital->approved) {
            return response()->json([
                'message' => 'This hospital account is awaiting admin approval.',
            ], 403);
        }

        $hospital->tokens()->delete();

        $token = $hospital->createToken('hospital-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'token' => $token,
            'hospital' => [
                'id' => $hospital->id,
                'name' => $hospital->name,
                'email' => $hospital->email,
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
