<?php

namespace App\Mail;

use App\Models\BloodRequest;
use App\Models\Donor;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class RequesterMatchConfirmedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public BloodRequest $bloodRequest,
        public Donor $donor,
    ) {
    }

    public function build(): self
    {
        $pdf = Pdf::loadView('pdf.match-donor-confirmed', [
            'bloodRequest' => $this->bloodRequest,
            'donor' => $this->donor,
        ])->setPaper('a4');

        return $this
            ->subject('Your donor has confirmed — contact details attached')
            ->view('emails.requester-match-confirmed', [
                'bloodRequest' => $this->bloodRequest,
                'donor' => $this->donor,
            ])
            ->attachData(
                $pdf->output(),
                'communityblood-request-' . $this->bloodRequest->reference_code . '.pdf',
                ['mime' => 'application/pdf']
            );
    }
}
