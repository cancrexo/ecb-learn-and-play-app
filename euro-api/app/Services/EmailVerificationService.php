<?php

namespace App\Services;

use App\Mail\EmailVerificationCodeMail;
use App\Models\EmailVerificationCode;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;

class EmailVerificationService
{
    public const CODE_TTL_MINUTES = 20;

    public function issueCode(User $user): void
    {
        $code = (string) random_int(100000, 999999);

        EmailVerificationCode::updateOrCreate(
            ['user_id' => $user->id],
            [
                'code_hash' => Hash::make($code),
                'expires_at' => now()->addMinutes(self::CODE_TTL_MINUTES),
            ],
        );

        Mail::to($user->email)->send(new EmailVerificationCodeMail($code));
    }

    public function verify(User $user, string $code): bool
    {
        $record = EmailVerificationCode::where('user_id', $user->id)->first();

        if (! $record || $record->expires_at->isPast()) {
            return false;
        }

        return Hash::check($code, $record->code_hash);
    }

    public function markVerified(User $user): void
    {
        $user->email_verified_at = now();
        $user->save();

        EmailVerificationCode::where('user_id', $user->id)->delete();
    }
}
