<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['username', 'department_id', 'email', 'email_verified_at', 'password', 'registered_at', 'last_access', 'best_score', 'best_score_at'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected function casts(): array
    {
        return [
            'registered_at' => 'datetime',
            'last_access' => 'datetime',
            'email_verified_at' => 'datetime',
            'best_score_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function gameSessions(): HasMany
    {
        return $this->hasMany(GameSession::class);
    }

    public function activeGameSession(): ?GameSession
    {
        return $this->gameSessions()
            ->whereIn('status', ['in_progress', 'paused'])
            ->latest('id')
            ->first();
    }

    public function completedGameSession(): ?GameSession
    {
        return $this->gameSessions()
            ->where('status', 'completed')
            ->latest('id')
            ->first();
    }

    public function isEmailVerified(): bool
    {
        return $this->email_verified_at !== null;
    }
}
