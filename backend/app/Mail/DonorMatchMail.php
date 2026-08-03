<?php

namespace App\Mail;

use App\Models\BloodRequest;
use App\Models\Donor;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class DonorMatchMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public BloodRequest $bloodRequest,
        public Donor $donor,
        public string $confirmUrl,
    ) {
    }

    public function build(): self
    {
        $pdf = Pdf::loadView('pdf.match-confirmation', [
            'audience' => 'donor',
            'bloodRequest' => $this->bloodRequest,
            'donor' => $this->donor,
        ])->setPaper('a4');

        return $this
            ->subject("You've been matched to a blood request ({$this->bloodRequest->blood_group})")
            ->view('emails.donor-match', [
                'bloodRequest' => $this->bloodRequest,
                'donor' => $this->donor,
                'confirmUrl' => $this->confirmUrl,
            ])
            ->attachData(
                $pdf->output(),
                'communityblood-match-' . $this->bloodRequest->reference_code . '.pdf',
                ['mime' => 'application/pdf']
            );
    }
}
