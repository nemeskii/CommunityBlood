<?php

namespace App\Mail;

use App\Models\BloodRequest;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class RequesterMatchMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public BloodRequest $bloodRequest,
    ) {
    }

    public function build(): self
    {
        // Deliberately no donor identity here — the requester only learns
        // who the donor is once they've confirmed (see
        // RequesterMatchConfirmedMail), sent from MatchResponseController.
        $pdf = Pdf::loadView('pdf.match-confirmation', [
            'audience' => 'requester',
            'bloodRequest' => $this->bloodRequest,
        ])->setPaper('a4');

        return $this
            ->subject('A donor has been found for your blood request')
            ->view('emails.requester-match', [
                'bloodRequest' => $this->bloodRequest,
            ])
            ->attachData(
                $pdf->output(),
                'communityblood-request-' . $this->bloodRequest->reference_code . '.pdf',
                ['mime' => 'application/pdf']
            );
    }
}
