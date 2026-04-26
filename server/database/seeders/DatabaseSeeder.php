<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            DifficultiesTableSeeder::class,
            CategoriesTableSeeder::class,
            UsersTableSeeder::class,
            CoursesTableSeeder::class,
            AppointmentsTableSeeder::class,
            BookingsTableSeeder::class,
        ]);
    }
}
