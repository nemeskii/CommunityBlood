CommunityBlood

Your donor has confirmed

Hi {{ $bloodRequest->requester_name }}, your matched {{ $bloodRequest->blood_group }} donor has confirmed. Here are their details so you can coordinate directly:

{{ $donor->full_name }}
{{ $donor->phone }}{{ $donor->age ? ' · Age ' . $donor->age : '' }}

We've attached a PDF with these details and your reference code — keep it handy, you'll need to show it at the hospital when you go to receive blood.

Reference code: {{ $bloodRequest->reference_code }}

— CommunityBlood
