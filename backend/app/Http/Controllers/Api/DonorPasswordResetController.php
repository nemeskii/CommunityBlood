<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Donor;
use App\Services\ResendMailer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class DonorPasswordResetController extends Controller
{
    public function __construct(private ResendMailer $mailer)
    {
    }

    // POST /api/donor/forgot-password
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $donor = Donor::where('email', $request->email)->first();

        if (! $donor) {
            return response()->json([
                'message' => 'If that email is registered, a reset link has been sent.',
            ]);
        }

        $token = Str::random(64);

        DB::table('password_reset_tokens')->where('email', $donor->email)->delete();

        DB::table('password_reset_tokens')->insert([
            'email' => $donor->email,
            'token' => Hash::make($token),
            'created_at' => now(),
        ]);

        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/');
        $resetUrl = "{$frontendUrl}/donor/reset-password?token={$token}&email=" . urlencode($donor->email);

        $html = view('emails.donor-password-reset', [
            'resetUrl' => $resetUrl,
        ])->render();

        $sent = $this->mailer->send(
            $donor->email,
            'Reset your CommunityBlood password',
            $html,
        );

        if (! $sent) {
            Log::error('Resend donor reset email failed', ['email' => $donor->email]);

            return response()->json(['message' => 'Failed to send reset email.'], 500);
        }

        return response()->json([
            'message' => 'If that email is registered, a reset link has been sent.',
        ]);
    }

    // POST /api/donor/reset-password
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (! $record) {
            return response()->json(['message' => 'Invalid or expired reset link.'], 422);
        }

        if (now()->diffInMinutes($record->created_at) > 10) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();

            return response()->json(['message' => 'This reset link has expired. Please request a new one.'], 422);
        }

        if (! Hash::check($request->token, $record->token)) {
            return response()->json(['message' => 'Invalid or expired reset link.'], 422);
        }

        $donor = Donor::where('email', $request->email)->first();

        if (! $donor) {
            return response()->json(['message' => 'Invalid or expired reset link.'], 422);
        }

        $donor->update(['password' => Hash::make($request->password)]);

        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        $donor->tokens()->delete();

        return response()->json(['message' => 'Password has been reset. You can now log in.']);
    }
}