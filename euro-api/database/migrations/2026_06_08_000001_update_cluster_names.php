<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $names = [
            1 => 'Cluster 1',
            2 => 'Cluster 2',
            3 => 'Cluster 3',
            4 => 'Cluster 4',
        ];

        foreach ($names as $sortOrder => $name) {
            DB::table('clusters')->where('sort_order', $sortOrder)->update(['name' => $name]);
        }
    }

    public function down(): void
    {
        $names = [
            1 => 'Cluster 1 — History of the Euro',
            2 => 'Cluster 2 — European Central Bank',
            3 => 'Cluster 3 — Euro Banknotes & Coins',
            4 => 'Cluster 4 — Eurozone & Economy',
        ];

        foreach ($names as $sortOrder => $name) {
            DB::table('clusters')->where('sort_order', $sortOrder)->update(['name' => $name]);
        }
    }
};
