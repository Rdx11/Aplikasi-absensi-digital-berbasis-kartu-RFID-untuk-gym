<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            MembershipTypeSeeder::class,
        ]);

        User::create([
            'name' => 'Administrator',
            'email' => 'admin@bricksgym.com',
            'password' => bcrypt('Angeline@123'),
            'role' => 'admin',
        ]);
    }
}
