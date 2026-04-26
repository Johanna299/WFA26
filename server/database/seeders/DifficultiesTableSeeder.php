<?php

namespace Database\Seeders;

use App\Models\Difficulty;
use Illuminate\Database\Seeder;

class DifficultiesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $difficulties = ['beginner', 'intermediate', 'pro'];

        // Create each difficulty level only if it does not already exist
        foreach ($difficulties as $difficulty) {
            Difficulty::firstOrCreate([
                'name' => $difficulty,
            ]);
        }
    }
}
