<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        if (! app()->environment('local')) {
            $this->command?->warn('UserSeeder omitido: solo disponible en APP_ENV=local.');

            return;
        }

        $players = [
            [
                'username' => 'testuser',
                'email' => 'testuser@elp.local',
                'password' => 'secret1',
            ],
            [
                'username' => 'test2',
                'email' => 'test2@elp.local',
                'password' => 'secret1',
            ],
        ];

        $now = now();

        foreach ($players as $player) {
            User::updateOrCreate(
                ['email' => $player['email']],
                [
                    'username' => $player['username'],
                    'department_id' => 1,
                    'email_verified_at' => $now,
                    'password' => $player['password'],
                    'registered_at' => $now,
                    'last_access' => $now,
                ],
            );
        }

        $this->command?->info('Jugadores de prueba creados/actualizados.');
    }
}
