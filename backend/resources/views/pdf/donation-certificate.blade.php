<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
    @page { margin: 56px 56px; }
    body {
        font-family: Helvetica, Arial, sans-serif;
        color: #22201B;
        font-size: 11pt;
    }
    .brand {
        font-size: 20pt;
        font-weight: bold;
    }
    .brand .red { color: #AB1D2E; }
    .tagline {
        font-size: 10pt;
        color: #5A5344;
        margin-top: 6px;
    }
    .hr {
        border-top: 1px solid #E4DCC8;
        margin: 20px 0;
    }
    .heading {
        font-size: 16pt;
        font-weight: bold;
        margin-bottom: 6px;
    }
    .subheading {
        font-size: 11pt;
        color: #5A5344;
        margin-bottom: 20px;
    }
    .code-box {
        border: 1px solid #AB1D2E;
        border-radius: 6px;
        padding: 14px 18px;
        margin-bottom: 24px;
    }
    .code-label {
        font-size: 9pt;
        color: #5A5344;
        letter-spacing: 1px;
        margin-bottom: 4px;
    }
    .code-value {
        font-size: 22pt;
        font-weight: bold;
        color: #AB1D2E;
    }
    table.rows { width: 100%; margin-bottom: 10px; }
    table.rows td {
        padding: 5px 0;
        font-size: 11pt;
        vertical-align: top;
    }
    table.rows td.label {
        font-weight: bold;
        width: 170px;
        color: #22201B;
    }
    table.rows td.value {
        color: #5A5344;
    }
    .note {
        font-style: italic;
        font-size: 10pt;
        color: #5A5344;
        margin-top: 18px;
        line-height: 1.5;
    }
    .footer {
        font-size: 9pt;
        color: #9A9280;
        margin-top: 20px;
    }
</style>
</head>
<body>
    <div class="brand"><span>COMMUNITY</span><span class="red">BLOOD</span></div>
    <div class="tagline">Kohima, Nagaland &middot; communityblood.org</div>
    <div class="hr"></div>

    <div class="heading">Certificate of donation</div>
    <div class="subheading">Thank you, {{ $donor->full_name }} — your donation makes a real difference.</div>

    <div class="code-box">
        <div class="code-label">REFERENCE CODE</div>
        <div class="code-value">{{ $donation->reference_code ?? '—' }}</div>
    </div>

    <table class="rows">
        <tr><td class="label">Donor</td><td class="value">{{ $donor->full_name }}</td></tr>
        <tr><td class="label">Blood group</td><td class="value">{{ $donation->blood_group }}</td></tr>
        <tr><td class="label">Units donated</td><td class="value">{{ $donation->units }}</td></tr>
        <tr><td class="label">Donation date</td><td class="value">{{ optional($donation->donation_date)->format('M j, Y') ?? '—' }}</td></tr>
        <tr><td class="label">Location</td><td class="value">{{ $donation->location ?? 'Not specified' }}</td></tr>
    </table>

    <div class="note">
        This certificate confirms your completed blood donation with Community Blood. Keep it for your own
        records — you're welcome to present it at the hospital or to your employer as proof of donation.
    </div>

    <div class="footer">Generated {{ now()->format('M j, Y, g:i A') }}</div>
</body>
</html>
