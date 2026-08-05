<?php

namespace App\Services;

use App\Models\Donation;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Log;

class DonationMailService
{
    public function __construct(private ResendMailer $mailer)
    {
    }

    public function sendCompletionEmail(Donation $donation): void
    {
        $donation->loadMissing('donor');
        $donor = $donation->donor;

        if (! $donor || ! $donor->email) {
            Log::info('Skipped donation completion email — no donor or no donor email', [
                'donation_id' => $donation->id,
            ]);

            return;
        }

        try {
            $pdf = Pdf::loadView('pdf.donation-certificate', [
                'donation' => $donation,
                'donor' => $donor,
            ])->setPaper('a4');

            $html = view('emails.donation-completed', [
                'donation' => $donation,
                'donor' => $donor,
            ])->render();

            $text = view('emails.donation-completed-text', [
                'donation' => $donation,
                'donor' => $donor,
            ])->render();

            $sent = $this->mailer->send(
                $donor->email,
                'Thank you for your donation, ' . $donor->full_name . '!',
                $html,
                $pdf->output(),
                'communityblood-donation-' . $donation->reference_code . '.pdf',
                $text,
            );

            if (! $sent) {
                throw new \RuntimeException('Resend reported failure — see previous log entry for details');
            }
        } catch (\Throwable $e) {
            Log::error('Donation completion email failed', [
                'donation_id' => $donation->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
