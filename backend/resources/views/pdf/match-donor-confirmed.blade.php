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
        font-size: 15pt;
        font-weight: bold;
        margin-bottom: 18px;
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

    <div class="heading">Donor confirmed</div>
    <div class="code-box">
        <div class="code-label">REFERENCE CODE</div>
        <div class="code-value">{{ $bloodRequest->reference_code ?? '—' }}</div>
    </div>
    <table class="rows">
        <tr><td class="label">Blood group</td><td class="value">{{ $bloodRequest->blood_group }}</td></tr>
        <tr><td class="label">City</td><td class="value">{{ $bloodRequest->city ?? 'Not specified' }}</td></tr>
        <tr><td class="label">Donor name</td><td class="value">{{ $donor->full_name }}</td></tr>
        <tr><td class="label">Donor phone</td><td class="value">{{ $donor->phone }}</td></tr>
        <tr><td class="label">Donor age</td><td class="value">{{ $donor->age ?? 'Not specified' }}</td></tr>
    </table>
    <div class="note">
        This donor has confirmed and their contact details are above so you can coordinate directly. Please
        keep the reference code handy — you'll need to show it at the hospital when you go to receive blood.
    </div>

    <div class="footer">Generated {{ now()->format('M j, Y, g:i A') }}</div>
</body>
</html>
