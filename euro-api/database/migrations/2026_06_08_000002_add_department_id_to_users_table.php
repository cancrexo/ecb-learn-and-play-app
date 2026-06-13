<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedTinyInteger('department_id')->nullable()->after('username');
        });

        // Usuarios previos al campo: asignar Department 1 por defecto
        DB::table('users')
            ->whereNull('department_id')
            ->update(['department_id' => 1]);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('department_id');
        });
    }
};
