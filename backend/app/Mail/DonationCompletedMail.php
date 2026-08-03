<?php

namespace App\Mail;

use App\Models\Donation;
use App\Models\Donor;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class DonationCompletedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Donation $donation,
        public Donor $donor,
    ) {
    }

    public function build(): self
    {
        $pdf = Pdf::loadView('pdf.donation-certificate', [
            'donation' => $this->donation,
            'donor' => $this->donor,
        ])->setPaper('a4');

        return $this
            ->subject('Thank you for your donation, ' . $this->donor->full_name . '!')
            ->view('emails.donation-completed', [
                'donation' => $this->donation,
                'donor' => $this->donor,
            ])
            ->attachData(
                $pdf->output(),
                'communityblood-donation-' . $this->donation->reference_code . '.pdf',
                ['mime' => 'application/pdf']
            );
    }
}
