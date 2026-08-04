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

        Log::info('SendMatchNotifications: starting', ['match_id' => $this->matchId]);

        $donor = $match->donor;
        $bloodRequest = $match->bloodRequest;
        $confirmUrl = rtrim(env('FRONTEND_URL'), '/') . '/matches/' . $match->confirm_token . '/respond';
        $donorSendOk = true;
        if ($donor && $donor->email) {
            try {
                Log::info('SendMatchNotifications: sending donor mail', ['match_id' => $match->id]);
                Mail::to($donor->email)->send(new DonorMatchMail($bloodRequest, $donor, $confirmUrl));
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
                Mail::to($bloodRequest->requester_email)->send(new RequesterMatchMail($bloodRequest));
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
