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
            $table->unsignedInteger('best_score')->default(0)->after('last_access');
            $table->dateTime('best_score_at')->nullable()->after('best_score');
        });

        $userIds = DB::table('game_sessions')
            ->where('status', 'completed')
            ->distinct()
            ->pluck('user_id');

        foreach ($userIds as $userId) {
            $best = DB::table('game_sessions')
                ->where('user_id', $userId)
                ->where('status', 'completed')
                ->orderByDesc('total_score')
                ->orderBy('completed_at')
                ->first();

            if ($best) {
                DB::table('users')->where('id', $userId)->update([
                    'best_score' => $best->total_score,
                    'best_score_at' => $best->completed_at,
                ]);
            }
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['best_score', 'best_score_at']);
        });
    }
};
