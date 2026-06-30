<?php

namespace Database\Seeders;

use App\Models\Cluster;
use Illuminate\Database\Seeder;

class ClusterSeeder extends Seeder
{
    public function run(): void
    {
        $clusters = [
            [
                'name' => 'Level 1',
                'description' => 'What is the digital euro?',
                'sort_order' => 1,
            ],
            [
                'name' => 'Level 2',
                'description' => 'How would it work?',
                'sort_order' => 2,
            ],
            [
                'name' => 'Level 3',
                'description' => 'Privacy, trust and safeguards',
                'sort_order' => 3,
            ],
            [
                'name' => 'Level 4',
                'description' => 'Behind the digital euro',
                'sort_order' => 4,
            ],
        ];

        foreach ($clusters as $cluster) {
            Cluster::updateOrCreate(['sort_order' => $cluster['sort_order']], $cluster);
        }
    }
}
