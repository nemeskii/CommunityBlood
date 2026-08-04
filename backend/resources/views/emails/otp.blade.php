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
                            <h2 style="margin:0 0 16px; color:#1a1a1a;">Verify your email</h2>
                            <p style="font-size:15px; line-height:1.6; color:#444; margin:0 0 28px;">
                                Use the code below to verify your email address. This code expires at {{ $time }}.
                            </p>
                            <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
                                <tr>
                                    <td style="background:#f4f1ec; border:1px solid #e0dcd3; border-radius:4px; padding:16px 28px;">
                                        <span style="font-size:28px; font-weight:bold; letter-spacing:0.2em; color:#ab1d2e;">
                                            {{ $code }}
                                        </span>
                                    </td>
                                </tr>
                            </table>
                            <p style="font-size:13px; color:#888; margin:0;">
                                If you didn't request this, you can safely ignore this email. Don't share this code with anyone.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
