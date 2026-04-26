<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Course;
use App\Models\Difficulty;
use App\Models\User;
use Illuminate\Database\Seeder;

class CoursesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $trainer = User::where('email', 'trainer@example.com')->first();
        $beginner = Difficulty::where('name', 'beginner')->first();
        $intermediate = Difficulty::where('name', 'intermediate')->first();

        $yoga = Category::where('name', 'Yoga')->first();
        $mobility = Category::where('name', 'Mobility')->first();
        $strength = Category::where('name', 'Strength Training')->first();

        if (!$trainer || !$beginner || !$intermediate) {
            return;
        }

        $course1 = Course::where('title', 'Morning Yoga Basics')->first();

        if (!$course1) {
            $course1 = new Course();
            $course1->title = 'Morning Yoga Basics';
            $course1->description = 'A beginner-friendly yoga course focused on mobility and breathing.';
            $course1->location = 'Studio A';
            $course1->participant_limit = 12;
            $course1->difficulty_id = $beginner->id;

            // Inverse relation -> use associate for the trainer relation.
            $course1->trainer()->associate($trainer);

            $course1->save();
        }

        // Attach the given categories to the course without deleting existing category assignments.
        if ($yoga && $mobility) {
            $course1->categories()->syncWithoutDetaching([$yoga->id, $mobility->id]);
        }

        $course2 = Course::where('title', 'Functional Strength Training')->first();

        if (!$course2) {
            $course2 = new Course();
            $course2->title = 'Functional Strength Training';
            $course2->description = 'A strength-focused course with bodyweight and functional exercises.';
            $course2->location = 'Gym Hall 1';
            $course2->participant_limit = 10;
            $course2->difficulty_id = $intermediate->id;

            // Inverse relation -> use associate for the trainer relation.
            $course2->trainer()->associate($trainer);

            $course2->save();
        }

        // Attach the given categories to the course without deleting existing category assignments.
        if ($strength) {
            $course2->categories()->syncWithoutDetaching([$strength->id]);
        }
    }
}
