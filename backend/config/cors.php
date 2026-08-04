<?php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => [
        'https://kuotsu.vercel.app',
        'http://localhost:5173',
        'https://communityblood.tech',
        'https://communityblood.tech',
        'https://communityblood.dpdns.org'
    ],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true,
];