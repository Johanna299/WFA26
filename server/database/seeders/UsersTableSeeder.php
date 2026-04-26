<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class UsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'trainer@example.com'],
            [
                'firstname' => 'Tina',
                'lastname' => 'Trainer',
                'password' => bcrypt('secret123'),
                'is_trainer' => true,
                'info' => 'Certified fitness trainer',
                'phone' => '+43123456789',
            ]
        );

        User::firstOrCreate(
            ['email' => 'participant@example.com'],
            [
                'firstname' => 'Paul',
                'lastname' => 'Participant',
                'password' => bcrypt('secret123'),
                'is_trainer' => false,
                'info' => null,
                'phone' => null,
            ]
        );
    }
}
