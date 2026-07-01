<?php

return [

    'username' => env('ADMIN_USERNAME'),

    'password' => env('ADMIN_PASSWORD'),

    'token_ttl_hours' => (int) env('ADMIN_TOKEN_TTL_HOURS', 8),

    'export_max_rows' => (int) env('ADMIN_EXPORT_MAX_ROWS', 10000),

    'default_per_page' => 25,

];
