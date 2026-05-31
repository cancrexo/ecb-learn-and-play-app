<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GameSession extends Model
{
    protected $fillable = [
        'user_id',
        'status',
        'current_cluster_id',
        'current_question_id',
        'total_score',
        'started_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function currentCluster(): BelongsTo
    {
        return $this->belongsTo(Cluster::class, 'current_cluster_id');
    }

    public function currentQuestion(): BelongsTo
    {
        return $this->belongsTo(Question::class, 'current_question_id', 'id_question');
    }

    public function answers(): HasMany
    {
        return $this->hasMany(GameAnswer::class, 'session_id')->orderBy('answered_at');
    }
}
