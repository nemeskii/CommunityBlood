<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
</head>
<body style="margin:0; padding:0; background:#f4f1ec; font-family: Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0;">
        <tr>
            <td align="center">
                <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff; border:1px solid #e0dcd3; border-radius:6px; padding:40px;">
                    <tr>
                        <td>
                            <table cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
                                <tr>
                                    <td style="vertical-align:middle;">
                                        <img src="{{ config('app.url') }}/images/community-blood-logo.png" width="36" height="36" alt="CommunityBlood" style="display:block; border-radius:8px;">
                                    </td>
                                    <td style="vertical-align:middle; padding-left:10px;">
                                        <p style="font-size:12px; letter-spacing:0.1em; text-transform:uppercase; color:#ab1d2e; margin:0;">
                                            CommunityBlood
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            <h2 style="margin:0 0 16px; color:#1a1a1a;">Your donor has confirmed</h2>
                            <p style="font-size:15px; line-height:1.6; color:#444; margin:0 0 16px;">
                                Hi {{ $bloodRequest->requester_name }}, your matched
                                <strong>{{ $bloodRequest->blood_group }}</strong> donor has confirmed. Here are
                                their details so you can coordinate directly:
                            </p>
                            <table cellpadding="0" cellspacing="0" width="100%" style="background:#f7f4ee; border-radius:4px; margin:0 0 16px;">
                                <tr>
                                    <td style="padding:16px 18px; font-size:14px; color:#444; line-height:1.6;">
                                        <strong>{{ $donor->full_name }}</strong><br>
                                        {{ $donor->phone }}
                                        @if($donor->age)
                                            &middot; Age {{ $donor->age }}
                                        @endif
                                    </td>
                                </tr>
                            </table>
                            <p style="font-size:15px; line-height:1.6; color:#444; margin:0 0 28px;">
                                We've attached a PDF with these details and your reference code — keep it
                                handy, you'll need to show it at the hospital when you go to receive blood.
                            </p>
                            <p style="font-size:13px; color:#888; margin:0;">
                                Reference code: <strong>{{ $bloodRequest->reference_code }}</strong>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
