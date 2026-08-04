<?php

namespace App\Jobs;

use App\Mail\DonorMatchMail;
use App\Mail\RequesterMatchMail;
use App\Models\BloodRequestMatch;
use Illuminate\Bus\Queueable;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

// Deliberately NOT queued onto a worker — this app has no background worker
// service. Callers dispatch this with ->afterResponse(), which runs it in
// the same PHP process right after the HTTP response has already been sent
// to the browser. That way, if PDF generation or the mail send crashes hard
// (e.g. an out-of-memory kill on a constrained host), the admin still gets
// their success response for the match itself — only the notification step
// is at risk, and it's retryable via the "resend" button either way.
class SendMatchNotifications
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public int $matchId)
    {
    }

    public function handle(): void
    {
        $match = BloodRequestMatch::with(['donor', 'bloodRequest'])->find($this->matchId);

        if (! $match) {
            Log::warning('SendMatchNotifications: match no longer exists', ['match_id' => $this->matchId]);

            return;
        }

        $donor = $match->donor;
        $bloodRequest = $match->bloodRequest;
        $confirmUrl = rtrim(env('FRONTEND_URL'), '/') . '/matches/' . $match->confirm_token . '/respond';

        $donorSendOk = true;

        if ($donor && $donor->email) {
            try {
                Mail::to($donor->email)->send(new DonorMatchMail($bloodRequest, $donor, $confirmUrl));
            } catch (\Throwable $e) {
                $donorSendOk = false;

                Log::error('Donor match email failed', [
                    'blood_request_match_id' => $match->id,
                    'error' => $e->getMessage(),
                ]);
            }
        } else {
            Log::info('Skipped donor match email — no donor or no donor email', [
                'blood_request_match_id' => $match->id,
                'donor_exists' => (bool) $donor,
            ]);
        }

        if ($bloodRequest->requester_email) {
            try {
                Mail::to($bloodRequest->requester_email)->send(new RequesterMatchMail($bloodRequest));
            } catch (\Throwable $e) {
                Log::error('Requester match email failed', [
                    'blood_request_match_id' => $match->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        if ($donorSendOk) {
            $match->update(['status' => 'notified', 'notified_at' => now(), 'notify_failed' => false]);
        } else {
            $match->update(['notify_failed' => true]);
        }
    }

    // If even this job dies with a fatal (non-catchable) error, mark the
    // match as failed rather than leaving it stuck on "proposed" forever
    // with no resend option visible in the admin UI.
    public function failed(?\Throwable $exception): void
    {
        BloodRequestMatch::where('id', $this->matchId)->update(['notify_failed' => true]);

        Log::error('SendMatchNotifications job failed', [
            'match_id' => $this->matchId,
            'error' => $exception?->getMessage(),
        ]);
    }
}
