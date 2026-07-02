<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GameSession extends Model
{
    public const TOTAL_QUESTIONS = 16;

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

    /** Valores 1/0 por orden de respuesta (hasta TOTAL_QUESTIONS); null si no respondida. */
    /** @return list<int|null> */
    public function answerFlagsByOrder(): array
    {
        $flags = array_fill(0, self::TOTAL_QUESTIONS, null);

        foreach ($this->answers as $index => $answer) {
            if ($index >= self::TOTAL_QUESTIONS) {
                break;
            }
            $flags[$index] = $answer->is_correct ? 1 : 0;
        }

        return $flags;
    }

    /** Resumen compacto para el listado admin: q1:1, q2:0, … */
    public function answersSummary(): string
    {
        $parts = [];

        foreach ($this->answers as $index => $answer) {
            if ($index >= self::TOTAL_QUESTIONS) {
                break;
            }
            $parts[] = 'q'.($index + 1).':'.($answer->is_correct ? '1' : '0');
        }

        return implode(', ', $parts);
    }
}
