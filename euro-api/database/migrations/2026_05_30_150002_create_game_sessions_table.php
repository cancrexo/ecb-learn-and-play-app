<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('game_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->enum('status', ['in_progress', 'paused', 'completed'])->default('in_progress');
            $table->unsignedTinyInteger('current_cluster_id');
            $table->unsignedInteger('current_question_id')->nullable();
            $table->unsignedInteger('total_score')->default(0);
            $table->dateTime('started_at');
            $table->dateTime('completed_at')->nullable();
            $table->timestamps();

            $table->foreign('current_cluster_id')->references('id')->on('clusters')->restrictOnDelete();
            $table->foreign('current_question_id')->references('id_question')->on('questions')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('game_sessions');
    }
};
