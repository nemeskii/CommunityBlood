<?php

namespace App\Jobs;

use App\Models\BloodRequestMatch;
use App\Services\ResendMailer;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Bus\Queueable;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendMatchNotifications
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public int $matchId)
    {
    }

    public function handle(ResendMailer $mailer): void
    {
        $match = BloodRequestMatch::with(['donor', 'bloodRequest'])->find($this->matchId);
        if (! $match) {
            Log::warning('SendMatchNotifications: match no longer exists', ['match_id' => $this->matchId]);
            return;
        }

        Log::info('SendMatchNotifications: starting', ['match_id' => $this->matchId]);

        $donor = $match->donor;
        $bloodRequest = $match->bloodRequest;
        $confirmUrl = rtrim(env('FRONTEND_URL'), '/') . '/matches/' . $match->confirm_token . '/respond';
        $donorSendOk = true;

        if ($donor && $donor->email) {
            try {
                Log::info('SendMatchNotifications: sending donor mail', ['match_id' => $match->id]);

                $pdf = Pdf::loadView('pdf.match-confirmation', [
                    'audience' => 'donor',
                    'bloodRequest' => $bloodRequest,
                    'donor' => $donor,
                ])->setPaper('a4');

                $html = view('emails.donor-match', [
                    'bloodRequest' => $bloodRequest,
                    'donor' => $donor,
                    'confirmUrl' => $confirmUrl,
                ])->render();

                $text = view('emails.donor-match-text', [
                    'bloodRequest' => $bloodRequest,
                    'donor' => $donor,
                    'confirmUrl' => $confirmUrl,
                ])->render();

                $sent = $mailer->send(
                    $donor->email,
                    "You've been matched to a blood request ({$bloodRequest->blood_group})",
                    $html,
                    $pdf->output(),
                    'communityblood-match-' . $bloodRequest->reference_code . '.pdf',
                    $text,
                );

                if (! $sent) {
                    throw new \RuntimeException('Resend reported failure — see previous log entry for details');
                }

                Log::info('SendMatchNotifications: donor mail sent ok', ['match_id' => $match->id]);
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
                Log::info('SendMatchNotifications: sending requester mail', ['match_id' => $match->id]);

                $pdf = Pdf::loadView('pdf.match-confirmation', [
                    'audience' => 'requester',
                    'bloodRequest' => $bloodRequest,
                ])->setPaper('a4');

                $html = view('emails.requester-match', [
                    'bloodRequest' => $bloodRequest,
                ])->render();

                $text = view('emails.requester-match-text', [
                    'bloodRequest' => $bloodRequest,
                ])->render();

                $sent = $mailer->send(
                    $bloodRequest->requester_email,
                    'A donor has been found for your blood request',
                    $html,
                    $pdf->output(),
                    'communityblood-request-' . $bloodRequest->reference_code . '.pdf',
                    $text,
                );

                if (! $sent) {
                    throw new \RuntimeException('Resend reported failure — see previous log entry for details');
                }

                Log::info('SendMatchNotifications: requester mail sent ok', ['match_id' => $match->id]);
            } catch (\Throwable $e) {
                Log::error('Requester match email failed', [
                    'blood_request_match_id' => $match->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        Log::info('SendMatchNotifications: about to update match status', [
            'match_id' => $match->id,
            'donorSendOk' => $donorSendOk,
        ]);

        if ($donorSendOk) {
            $match->update(['status' => 'notified', 'notified_at' => now(), 'notify_failed' => false]);
        } else {
            $match->update(['notify_failed' => true]);
        }

        Log::info('SendMatchNotifications: finished', ['match_id' => $match->id]);
    }

    public function failed(?\Throwable $exception): void
    {
        BloodRequestMatch::where('id', $this->matchId)->update(['notify_failed' => true]);

        Log::error('SendMatchNotifications job failed', [
            'match_id' => $this->matchId,
            'error' => $exception?->getMessage(),
        ]);
    }
}
