<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class EmailJsMailer
{
    /**
     * Send a transactional email (optionally with a PDF attached) through
     * EmailJS's REST API — the same endpoint OtpController already uses
     * successfully, so this reuses whatever sending reputation that
     * already has with Gmail instead of going through Laravel's own
     * mailer (see SendMatchNotifications / DonationMailService).
     *
     * All callers share ONE EmailJS template (EMAILJS_PDF_TEMPLATE_ID).
     * That template just needs:
     *   - "To Email" set to the dynamic variable {{to_email}}
     *   - Subject set to {{subject}}
     *   - Body content set to {{{html_content}}}  — TRIPLE braces, so
     *     EmailJS renders it as raw HTML instead of escaping it
     *   - One "Variable Attachment" with parameter name "pdf_attachment"
     *     and filename set to the dynamic variable {{pdf_filename}}
     */
    public function send(
        string $toEmail,
        string $subject,
        string $htmlContent,
        ?string $pdfBinary = null,
        ?string $pdfFilename = null,
    ): bool {
        $templateParams = [
            'to_email' => $toEmail,
            'subject' => $subject,
            'html_content' => $htmlContent,
        ];

        if ($pdfBinary !== null) {
            $templateParams['pdf_attachment'] = base64_encode($pdfBinary);
            $templateParams['pdf_filename'] = $pdfFilename ?? 'attachment.pdf';
        }

        $response = Http::post('https://api.emailjs.com/api/v1.0/email/send', [
            'service_id' => env('EMAILJS_SERVICE_ID'),
            'template_id' => env('EMAILJS_PDF_TEMPLATE_ID'),
            'user_id' => env('EMAILJS_PUBLIC_KEY'),
            'accessToken' => env('EMAILJS_PRIVATE_KEY'),
            'template_params' => $templateParams,
        ]);

        if ($response->failed()) {
            Log::error('EmailJS transactional send failed', [
                'to' => $toEmail,
                'subject' => $subject,
                'response' => $response->body(),
            ]);

            return false;
        }

        return true;
    }
}
