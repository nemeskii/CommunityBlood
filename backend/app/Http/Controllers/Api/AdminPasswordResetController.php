<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class AdminPasswordResetController extends Controller
{
    // POST /api/admin/forgot-password
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)
            ->where('is_admin', true)
            ->first();

        // Always return a generic success message, whether or not the
        // email matches an admin account, so we don't leak which emails
        // are registered as admins.
        if (! $user) {
            return response()->json([
                'message' => 'If that email is registered, a reset link has been sent.',
            ]);
        }

        $token = Str::random(64);

        DB::table('password_reset_tokens')->where('email', $user->email)->delete();

        DB::table('password_reset_tokens')->insert([
            'email' => $user->email,
            'token' => Hash::make($token),
            'created_at' => now(),
        ]);

        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/');
        $resetUrl = "{$frontendUrl}/admin/reset-password?token={$token}&email=" . urlencode($user->email);

        $response = Http::post('https://api.emailjs.com/api/v1.0/email/send', [
            'service_id' => env('EMAILJS_RESET_SERVICE_ID'),
            'template_id' => env('EMAILJS_RESET_TEMPLATE_ID'),
            'user_id' => env('EMAILJS_PUBLIC_KEY'),
            'accessToken' => env('EMAILJS_PRIVATE_KEY'),
            'template_params' => [
                'email' => $user->email,
                'link' => $resetUrl,
                'time' => now()->addMinutes(60)->format('h:i A'),
            ],
        ]);

        if ($response->failed()) {
            \Log::error('EmailJS reset email failed', ['response' => $response->body()]);
            return response()->json(['message' => 'Failed to send reset email.', 'debug' => $response->body()], 500);
        }

        return response()->json([
            'message' => 'If that email is registered, a reset link has been sent.',
        ]);
    }

    // POST /api/admin/reset-password
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

        // Token expires after 60 minutes
        if (now()->diffInMinutes($record->created_at) > 60) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();

            return response()->json(['message' => 'This reset link has expired. Please request a new one.'], 422);
        }

        if (! Hash::check($request->token, $record->token)) {
            return response()->json(['message' => 'Invalid or expired reset link.'], 422);
        }

        $user = User::where('email', $request->email)
            ->where('is_admin', true)
            ->first();

        if (! $user) {
            return response()->json(['message' => 'Invalid or expired reset link.'], 422);
        }

        $user->update(['password' => Hash::make($request->password)]);

        // Reset link is single-use
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        // Revoke all existing admin tokens for this user as a safety measure
        $user->tokens()->delete();

        return response()->json(['message' => 'Password has been reset. You can now log in.']);
    }
}