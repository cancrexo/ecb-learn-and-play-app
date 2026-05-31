<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Question extends Model
{
    protected $primaryKey = 'id_question';

    protected $fillable = [
        'cluster_id',
        'question',
        'answer1',
        'answer2',
        'answer3',
        'answer4',
        'explanation',
        'answerOK',
        'points',
    ];

    protected $hidden = ['answerOK'];

    public function cluster(): BelongsTo
    {
        return $this->belongsTo(Cluster::class, 'cluster_id');
    }

    public function gameAnswers(): HasMany
    {
        return $this->hasMany(GameAnswer::class, 'question_id', 'id_question');
    }

    /** Opciones de respuesta no vacías para enviar al cliente (sin revelar cuál es correcta). */
    public function getAnswersForClient(): array
    {
        $answers = [];
        foreach (['answer1', 'answer2', 'answer3', 'answer4'] as $index => $field) {
            if (! empty($this->{$field})) {
                $answers[] = [
                    'index' => $index + 1,
                    'text' => $this->{$field},
                ];
            }
        }

        return $answers;
    }
}
