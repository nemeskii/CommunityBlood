<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Resend\Laravel\Facades\Resend;
use Throwable;

class ResendMailer
{

    public function send(
        string $toEmail,
        string $subject,
        string $htmlContent,
        ?string $pdfBinary = null,
        ?string $pdfFilename = null,
        ?string $textContent = null,
    ): bool {
        $payload = [
            'from' => config('mail.from.name') . ' <' . config('mail.from.address') . '>',
            'to' => [$toEmail],
            'subject' => $subject,
            'html' => $htmlContent,
            'text' => $textContent ?? trim(preg_replace('/\n{3,}/', "\n\n", strip_tags($htmlContent))),
        ];

        $attachments = [];

        $logoPath = public_path('images/community-blood-logo.png');
        if (is_file($logoPath)) {
            $attachments[] = [
                'filename' => 'community-blood-logo.png',
                'content' => base64_encode(file_get_contents($logoPath)),
                'content_id' => 'community-blood-logo',
            ];
        }

        if ($pdfBinary !== null) {
            $attachments[] = [
                'filename' => $pdfFilename ?? 'attachment.pdf',
                'content' => base64_encode($pdfBinary),
            ];
        }

        if (! empty($attachments)) {
            $payload['attachments'] = $attachments;
        }

        try {
            Resend::emails()->send($payload);

            return true;
        } catch (Throwable $e) {
            Log::error('Resend transactional send failed', [
                'to' => $toEmail,
                'subject' => $subject,
                'error' => $e->getMessage(),
            ]);

            return false;
        }
    }
}