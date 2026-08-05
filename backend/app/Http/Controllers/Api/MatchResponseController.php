<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BloodRequestMatch;
use App\Models\Donor;
use App\Services\ResendMailer;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

class MatchResponseController extends Controller
{
    public function showByToken(string $token)
    {
        $match = BloodRequestMatch::with(['bloodRequest', 'donor:id,full_name'])
            ->where('confirm_token', $token)
            ->firstOrFail();

        return response()->json([
            'status' => $match->status,
            'respondable' => $match->isRespondable(),
            'donor_name' => optional($match->donor)->full_name,
            'blood_group' => $match->bloodRequest->blood_group,
            'city' => $match->bloodRequest->city,
            'requester_name' => $match->bloodRequest->requester_name,
            'reason' => $match->bloodRequest->reason,
        ]);
    }

    public function respondByToken(Request $request, string $token)
    {
        $match = BloodRequestMatch::where('confirm_token', $token)->firstOrFail();

        return $this->applyResponse($request, $match, 'link');
    }

    public function pendingForDonor(Request $request)
    {
        $donor = $request->user();

        if (! $donor instanceof Donor) {
            return response()->json(['message' => 'Not authorized'], 403);
        }

        $matches = BloodRequestMatch::with('bloodRequest')
            ->where('donor_id', $donor->id)
            ->whereIn('status', BloodRequestMatch::RESPONDABLE)
            ->latest()
            ->get();

        return response()->json($matches);
    }

    public function respondInApp(Request $request, BloodRequestMatch $match)
    {
        $donor = $request->user();

        if (! $donor instanceof Donor || $donor->id !== $match->donor_id) {
            return response()->json(['message' => 'Not authorized'], 403);
        }

        return $this->applyResponse($request, $match, 'in_app');
    }

    private function applyResponse(Request $request, BloodRequestMatch $match, string $via)
    {
        $validated = $request->validate([
            'action' => ['required', Rule::in(['confirm', 'decline'])],
        ]);

        $updated = DB::table('blood_request_matches')
            ->where('id', $match->id)
            ->whereIn('status', BloodRequestMatch::RESPONDABLE)
            ->where(function ($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', now());
            })
            ->update([
                'status' => $validated['action'] === 'confirm' ? 'confirmed' : 'declined',
                'responded_at' => now(),
                'responded_via' => $via,
                'updated_at' => now(),
            ]);

        $match = $match->fresh(['bloodRequest', 'donor']);

        if ($updated > 0 && $validated['action'] === 'confirm' && $match->donor && $match->bloodRequest?->requester_email) {
            try {
                $pdf = Pdf::loadView('pdf.match-donor-confirmed', [
                    'bloodRequest' => $match->bloodRequest,
                    'donor' => $match->donor,
                ])->setPaper('a4');

                $html = view('emails.requester-match-confirmed', [
                    'bloodRequest' => $match->bloodRequest,
                    'donor' => $match->donor,
                ])->render();

                $text = view('emails.requester-match-confirmed-text', [
                    'bloodRequest' => $match->bloodRequest,
                    'donor' => $match->donor,
                ])->render();

                $sent = app(ResendMailer::class)->send(
                    $match->bloodRequest->requester_email,
                    'Your donor has confirmed — contact details attached',
                    $html,
                    $pdf->output(),
                    'communityblood-request-' . $match->bloodRequest->reference_code . '.pdf',
                    $text,
                );

                if (! $sent) {
                    throw new \RuntimeException('Resend reported failure — see previous log entry for details');
                }
            } catch (\Throwable $e) {
                Log::error('Requester match-confirmed email failed', [
                    'blood_request_match_id' => $match->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return response()->json([
            'message' => $updated > 0
                ? 'Response recorded'
                : 'This match was already resolved — showing its current status.',
            'match' => $match,
        ]);
    }

    public function unacknowledgedCount()
    {
        $count = BloodRequestMatch::whereIn('status', ['confirmed', 'declined'])
            ->whereNotNull('responded_at')
            ->whereNull('acknowledged_at')
            ->count();

        return response()->json(['count' => $count]);
    }
    
    public function unacknowledged()
    {
        $matches = BloodRequestMatch::whereIn('status', ['confirmed', 'declined'])
            ->whereNotNull('responded_at')
            ->whereNull('acknowledged_at')
            ->with([
                'donor:id,full_name,phone,email',
                'bloodRequest:id,requester_name,blood_group,city,status',
            ])
            ->latest('responded_at')
            ->get();

        return response()->json($matches);
    }

    public function acknowledge(BloodRequestMatch $match)
    {
        $match->update(['acknowledged_at' => now()]);

        return response()->json(['message' => 'Acknowledged']);
    }
}
