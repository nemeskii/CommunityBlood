<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ContactController extends Controller
{
    // POST /api/contact
    public function send(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'message' => 'required|string|max:5000',
        ]);

        $response = Http::post('https://api.emailjs.com/api/v1.0/email/send', [
            'service_id' => env('EMAILJS_CONTACT_SERVICE_ID'),
            'template_id' => env('EMAILJS_CONTACT_TEMPLATE_ID'),
            'user_id' => env('EMAILJS_PUBLIC_KEY'),
            'accessToken' => env('EMAILJS_PRIVATE_KEY'),
            'template_params' => [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'message' => $validated['message'],
            ],
        ]);

        if ($response->failed()) {
            Log::error('EmailJS contact message failed', ['response' => $response->body()]);

            return response()->json([
                'message' => 'Failed to send your message.',
                'debug' => $response->body(),
            ], 500);
        }

        return response()->json(['message' => 'Message sent.']);
    }
}
