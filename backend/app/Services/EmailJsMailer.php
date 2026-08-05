<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class EmailJsMailer
{
    
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
