<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Resend\Laravel\Facades\Resend;
use Throwable;

class ResendMailer
{
    /**
     * Drop-in replacement for EmailJsMailer with the exact same signature,
     * so every call site (SendMatchNotifications, DonationMailService,
     * MatchResponseController) only needed a one-line swap. Sends through
     * Resend's HTTPS API instead of SMTP, which is why this keeps working
     * on hosts (like Render's free tier) that block outbound SMTP ports.
     *
     * $textContent is optional and appended at the end (rather than
     * inserted earlier) so existing positional calls don't need to change.
     * Sending a text/plain part alongside html is one of several signals
     * mailbox providers use to distinguish real transactional mail from
     * spam — an HTML-only, image-plus-button email is a common spam shape.
     */
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
            // Falls back to a stripped version of the HTML if no dedicated
            // plain-text view was passed in, so every send still carries a
            // text/plain part even for call sites that don't bother.
            'text' => $textContent ?? trim(preg_replace('/\n{3,}/', "\n\n", strip_tags($htmlContent))),
        ];

        $attachments = [];

        // Embed the logo as an inline CID attachment instead of letting the
        // templates link to it over HTTP. When the <img> src pointed at the
        // Render API host (communityblood-api.onrender.com) — a different
        // domain from the verified sending domain (communityblood.dpdns.org)
        // — Gmail treated that sender/image-host mismatch as a phishing
        // signal and sent the mail to spam. Templates reference this via
        // <img src="cid:community-blood-logo">.
        $logoPath = public_path('images/community-blood-logo.png');
        if (is_file($logoPath)) {
            $attachments[] = [
                'filename' => 'community-blood-logo.png',
                'content' => base64_encode(file_get_contents($logoPath)),
                'content_id' => 'community-blood-logo',
            ];
        }

        if ($pdfBinary !== null) {
            // Must be base64-encoded: passing the raw binary string directly
            // makes Resend's PHP SDK fail JSON-encoding it ("Malformed UTF-8
            // characters"), since raw PDF bytes aren't valid UTF-8.
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