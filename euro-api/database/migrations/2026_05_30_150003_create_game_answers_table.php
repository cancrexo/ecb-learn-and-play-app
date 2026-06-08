<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('game_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_id')->constrained('game_sessions')->cascadeOnDelete();
            $table->unsignedInteger('question_id');
            $table->unsignedTinyInteger('selected_answer');
            $table->boolean('is_correct');
            $table->unsignedInteger('points_earned')->default(0);
            $table->dateTime('answered_at');
            $table->timestamps();

            $table->foreign('question_id')->references('id_question')->on('questions')->restrictOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('game_answers');
    }
};
