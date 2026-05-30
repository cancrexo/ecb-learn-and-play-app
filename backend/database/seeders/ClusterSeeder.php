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
                'name' => 'Cluster 1 — History of the Euro',
                'description' => 'Discover when and why the euro was created.',
                'sort_order' => 1,
            ],
            [
                'name' => 'Cluster 2 — European Central Bank',
                'description' => 'Learn about the ECB and its main responsibilities.',
                'sort_order' => 2,
            ],
            [
                'name' => 'Cluster 3 — Euro Banknotes & Coins',
                'description' => 'Explore the design and security features of euro cash.',
                'sort_order' => 3,
            ],
            [
                'name' => 'Cluster 4 — Eurozone & Economy',
                'description' => 'Understand how the eurozone works today.',
                'sort_order' => 4,
            ],
        ];

        foreach ($clusters as $cluster) {
            Cluster::updateOrCreate(['sort_order' => $cluster['sort_order']], $cluster);
        }
    }
}
