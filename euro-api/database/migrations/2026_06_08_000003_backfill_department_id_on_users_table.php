<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('users')
            ->whereNull('department_id')
            ->update(['department_id' => 1]);
    }

    public function down(): void
    {
        // No reversible: no sabemos qué registros eran null originalmente.
    }
};
