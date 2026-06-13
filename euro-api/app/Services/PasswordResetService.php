<?php

namespace App\Services;

use App\Mail\PasswordResetLinkMail;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

class PasswordResetService
{
    public function sendResetLink(string $email): void
    {
        $user = User::where('email', $email)->first();

        if (! $user || ! $user->isEmailVerified()) {
            return;
        }

        $token = Password::broker('users')->createToken($user);
        $resetUrl = rtrim(config('app.frontend_url'), '/').'/reset-password?'.http_build_query([
            'token' => $token,
            'email' => $user->email,
        ]);

        Mail::to($user->email)->send(new PasswordResetLinkMail($resetUrl));
    }

    public function resetPassword(string $email, string $token, string $password): User
    {
        $status = Password::broker('users')->reset(
            [
                'email' => $email,
                'password' => $password,
                'password_confirmation' => $password,
                'token' => $token,
            ],
            function (User $user, string $newPassword): void {
                $user->forceFill(['password' => $newPassword])->save();
                $user->tokens()->delete();
            },
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'token' => ['Invalid or expired reset link.'],
            ]);
        }

        $user = User::where('email', $email)->firstOrFail();
        $user->last_access = now();
        $user->save();

        return $user;
    }
}
