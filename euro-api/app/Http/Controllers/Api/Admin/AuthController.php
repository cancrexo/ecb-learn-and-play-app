<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'username' => 'required|string|max:255',
            'password' => 'required|string|max:255',
        ]);

        $configuredUser = config('admin.username');
        $configuredPass = config('admin.password');

        if ($configuredUser === null || $configuredUser === '' || $configuredPass === null || $configuredPass === '') {
            return response()->json(['message' => 'Admin access is not configured.'], 503);
        }

        $userOk = hash_equals((string) $configuredUser, (string) $data['username']);
        $passOk = hash_equals((string) $configuredPass, (string) $data['password']);

        if (! $userOk || ! $passOk) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        $token = Str::random(64);
        $ttlHours = config('admin.token_ttl_hours', 8);
        $expiresIn = $ttlHours * 3600;

        Cache::put("admin_token:{$token}", true, now()->addHours($ttlHours));

        return response()->json([
            'token' => $token,
            'expires_in' => $expiresIn,
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $header = $request->header('Authorization', '');

        if (str_starts_with($header, 'Bearer ')) {
            $token = substr($header, 7);
            if ($token !== '') {
                Cache::forget("admin_token:{$token}");
            }
        }

        return response()->json(['message' => 'Logged out.']);
    }
}
