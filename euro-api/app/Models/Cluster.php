<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Cluster extends Model
{
    public $timestamps = false;

    protected $fillable = ['name', 'description', 'sort_order'];

    public function questions(): HasMany
    {
        return $this->hasMany(Question::class, 'cluster_id')->orderBy('id_question');
    }
}
