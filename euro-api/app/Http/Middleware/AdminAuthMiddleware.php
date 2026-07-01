<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class AdminAuthMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $header = $request->header('Authorization', '');

        if (! str_starts_with($header, 'Bearer ')) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        $token = substr($header, 7);

        if ($token === '' || ! Cache::has("admin_token:{$token}")) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        return $next($request);
    }
}
