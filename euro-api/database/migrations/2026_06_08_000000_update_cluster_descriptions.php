<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $descriptions = [
            1 => 'What is the digital euro?',
            2 => 'How would it work?',
            3 => 'Privacy, trust and safeguards',
            4 => 'Behind the digital euro',
        ];

        foreach ($descriptions as $sortOrder => $description) {
            DB::table('clusters')->where('sort_order', $sortOrder)->update(['description' => $description]);
        }
    }

    public function down(): void
    {
        $descriptions = [
            1 => 'Discover when and why the euro was created.',
            2 => 'Learn about the ECB and its main responsibilities.',
            3 => 'Explore the design and security features of euro cash.',
            4 => 'Understand how the eurozone works today.',
        ];

        foreach ($descriptions as $sortOrder => $description) {
            DB::table('clusters')->where('sort_order', $sortOrder)->update(['description' => $description]);
        }
    }
};
