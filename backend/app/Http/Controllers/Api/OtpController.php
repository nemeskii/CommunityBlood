<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Donor;
use App\Models\OtpVerification;
use App\Services\ResendMailer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class OtpController extends Controller
{
    public function __construct(private ResendMailer $mailer)
    {
    }

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

        $expiresAt = now()->addMinutes(10)->format('h:i A');

        $html = view('emails.otp', [
            'code' => $code,
            'time' => $expiresAt,
        ])->render();

        $sent = $this->mailer->send(
            $request->email,
            'Your CommunityBlood verification code',
            $html,
        );

        if (! $sent) {
            Log::error('Resend OTP email failed', ['email' => $request->email]);

            return response()->json(['message' => 'Failed to send verification code.'], 500);
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