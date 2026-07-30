<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Donor;
use App\Models\OtpVerification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class OtpController extends Controller
{
    // POST /api/otp/send
    public function send(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:donors,email',
        ]);

        $code = (string) random_int(100000, 999999);

        OtpVerification::where('email', $request->email)->delete();

        OtpVerification::create([
            'email' => $request->email,
            'code' => $code,
            'expires_at' => now()->addMinutes(10),
        ]);

        $response = Http::post('https://api.emailjs.com/api/v1.0/email/send', [
            'service_id' => env('EMAILJS_SERVICE_ID'),
            'template_id' => env('EMAILJS_TEMPLATE_ID'),
            'user_id' => env('EMAILJS_PUBLIC_KEY'),
            'accessToken' => env('EMAILJS_PRIVATE_KEY'),
            'template_params' => [
                'email' => $request->email,
                'passcode' => $code,
                'time' => now()->addMinutes(10)->format('h:i A'),
            ],
        ]);

        if ($response->failed()) {
    \Log::error('EmailJS failed', ['response' => $response->body()]);
    return response()->json(['message' => 'Failed to send verification code.', 'debug' => $response->body()], 500);
}

        return response()->json(['message' => 'Verification code sent.']);
    }

    // POST /api/otp/verify
    public function verify(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code' => 'required|digits:6',
        ]);

        $otp = OtpVerification::where('email', $request->email)
            ->where('code', $request->code)
            ->where('expires_at', '>=', now())
            ->latest()
            ->first();

        if (!$otp) {
            return response()->json(['message' => 'Invalid or expired code.'], 422);
        }

        $otp->update(['verified' => true]);

        return response()->json(['message' => 'Email verified.']);
    }
}