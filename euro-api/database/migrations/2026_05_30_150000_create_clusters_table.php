<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clusters', function (Blueprint $table) {
            $table->unsignedTinyInteger('id')->autoIncrement();
            $table->string('name', 128);
            $table->text('description');
            $table->unsignedTinyInteger('sort_order')->unique();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clusters');
    }
};
