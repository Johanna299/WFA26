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
            ['email' => 'trainer1@example.com'],
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
            ['email' => 'participant1@example.com'],
            [
                'firstname' => 'Paul',
                'lastname' => 'Participant',
                'password' => bcrypt('secret123'),
                'is_trainer' => false,
                'info' => null,
                'phone' => null,
            ]
        );

        User::firstOrCreate(
            ['email' => 'trainer2@example.com'],
            [
                'firstname' => 'Tim',
                'lastname' => 'Trainer',
                'password' => bcrypt('secret123'),
                'is_trainer' => true,
                'info' => 'Certified fitness trainer',
                'phone' => '+43123456789',
            ]
        );

        User::firstOrCreate(
            ['email' => 'participant2@example.com'],
            [
                'firstname' => 'Petra',
                'lastname' => 'Participant',
                'password' => bcrypt('secret123'),
                'is_trainer' => false,
                'info' => null,
                'phone' => null,
            ]
        );

        User::firstOrCreate(
            ['email' => 'participant3@example.com'],
            [
                'firstname' => 'Lena',
                'lastname' => 'Participant',
                'password' => bcrypt('secret123'),
                'is_trainer' => false,
                'info' => null,
                'phone' => null,
            ]
        );

        User::firstOrCreate(
            ['email' => 'participant4@example.com'],
            [
                'firstname' => 'Max',
                'lastname' => 'Participant',
                'password' => bcrypt('secret123'),
                'is_trainer' => false,
                'info' => null,
                'phone' => null,
            ]
        );
    }
}
