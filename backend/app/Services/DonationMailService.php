<?php

namespace App\Services;

use App\Mail\DonationCompletedMail;
use App\Models\Donation;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class DonationMailService
{
    // A donation can be marked completed from three different places
    // (admin approval, hospital confirmation, or admin closing a blood
    // request as fulfilled) — this is called from the Donation model's
    // observer so all three go through one path instead of three copies
    // of the same mail-sending code.
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
            Mail::to($donor->email)->send(new DonationCompletedMail($donation, $donor));
        } catch (\Throwable $e) {
            Log::error('Donation completion email failed', [
                'donation_id' => $donation->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
