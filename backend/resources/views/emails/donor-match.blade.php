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
                                        <img src="cid:community-blood-logo" width="36" height="36" alt="CommunityBlood" style="display:block; border-radius:8px;">
                                    </td>
                                    <td style="vertical-align:middle; padding-left:10px;">
                                        <p style="font-size:12px; letter-spacing:0.1em; text-transform:uppercase; color:#ab1d2e; margin:0;">
                                            CommunityBlood
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            <h2 style="margin:0 0 16px; color:#1a1a1a;">You've been matched to a blood request</h2>
                            <p style="font-size:15px; line-height:1.6; color:#444; margin:0 0 16px;">
                                Hi {{ $donor->full_name }}, someone nearby needs <strong>{{ $bloodRequest->blood_group }}</strong> blood
                                @if($bloodRequest->city)
                                    in {{ $bloodRequest->city }}
                                @endif
                                and you've been matched as a potential donor. We've attached a PDF with the full
                                details and your reference code.
                            </p>
                            <table cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="background:#ab1d2e; border-radius:4px;">
                                        <a href="{{ $confirmUrl }}" style="display:inline-block; padding:14px 28px; color:#ffffff; text-decoration:none; font-weight:bold; font-size:15px;">
                                            Confirm or decline
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <p style="font-size:13px; color:#888; margin:28px 0 0;">
                                Please respond as soon as you can so we can let the requester know either way.
                            </p>
                            <p style="font-size:12px; color:#aaa; margin:20px 0 0; word-break:break-all;">
                                Or copy this link: {{ $confirmUrl }}
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>