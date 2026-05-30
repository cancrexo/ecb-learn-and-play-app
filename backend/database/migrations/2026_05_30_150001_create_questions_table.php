<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->unsignedInteger('id_question')->autoIncrement();
            $table->unsignedTinyInteger('cluster_id');
            $table->string('question', 512);
            $table->text('answer1')->nullable();
            $table->text('answer2')->nullable();
            $table->text('answer3')->nullable();
            $table->text('answer4')->nullable();
            $table->text('explanation');
            $table->unsignedTinyInteger('answerOK');
            $table->unsignedInteger('points')->default(100);
            $table->timestamps();

            $table->foreign('cluster_id')->references('id')->on('clusters')->restrictOnDelete();
            $table->index(['cluster_id', 'id_question']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
