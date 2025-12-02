<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MembershipTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            [
                'name' => 'Harian - Alat Saja',
                'duration_type' => 'daily',
                'duration_days' => 1,
                'price' => 0,
                'description' => 'Akses harian untuk alat fitness saja',
            ],
            [
                'name' => 'Harian - Alat + Treadmill dst',
                'duration_type' => 'daily',
                'duration_days' => 1,
                'price' => 0,
                'description' => 'Akses harian untuk alat fitness dan treadmill',
            ],
            [
                'name' => 'Bulanan - Silver',
                'duration_type' => 'monthly',
                'duration_days' => 30,
                'price' => 0,
                'description' => 'Paket bulanan Silver',
            ],
            [
                'name' => 'Bulanan - Gold dst',
                'duration_type' => 'monthly',
                'duration_days' => 30,
                'price' => 0,
                'description' => 'Paket bulanan Gold',
            ],
            [
                'name' => '6 Bulan - Free 1 bulan',
                'duration_type' => '6_months',
                'duration_days' => 210,
                'price' => 0,
                'description' => 'Paket 6 bulan gratis 1 bulan (total 7 bulan)',
            ],
        ];

        foreach ($types as $type) {
            DB::table('membership_types')->insert(array_merge($type, [
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]));
        }
    }
}
