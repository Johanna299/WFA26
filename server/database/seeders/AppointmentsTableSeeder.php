<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\Course;
use Illuminate\Database\Seeder;

class AppointmentsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $course1 = Course::where('title', 'Morning Yoga Basics')->first();
        $course2 = Course::where('title', 'Functional Strength Training')->first();
        $course3 = Course::where('title', 'Evening Mobility Flow')->first();

        if ($course1) {
            $appointment1 = Appointment::where('course_id', $course1->id)
                ->where('starts_at', '2026-06-05 09:00:00')
                ->first();

            if (!$appointment1) {
                $appointment1 = new Appointment();
                $appointment1->starts_at = '2026-06-05 09:00:00';
                $appointment1->duration = 60;
                $appointment1->status = 'scheduled';

                // Inverse relation -> use associate for the course relation.
                $appointment1->course()->associate($course1);

                $appointment1->save();
            }

            $appointment2 = Appointment::where('course_id', $course1->id)
                ->where('starts_at', '2026-06-12 09:00:00')
                ->first();

            if (!$appointment2) {
                $appointment2 = new Appointment();
                $appointment2->starts_at = '2026-06-12 09:00:00';
                $appointment2->duration = 60;
                $appointment2->status = 'scheduled';

                // Inverse relation -> use associate for the course relation.
                $appointment2->course()->associate($course1);

                $appointment2->save();
            }
        }

        if ($course2) {
            $appointment3 = Appointment::where('course_id', $course2->id)
                ->where('starts_at', '2026-06-06 18:00:00')
                ->first();

            if (!$appointment3) {
                $appointment3 = new Appointment();
                $appointment3->starts_at = '2026-06-06 18:00:00';
                $appointment3->duration = 75;
                $appointment3->status = 'scheduled';

                // Inverse relation -> use associate for the course relation.
                $appointment3->course()->associate($course2);

                $appointment3->save();
            }

            $appointment4 = Appointment::where('course_id', $course2->id)
                ->where('starts_at', '2026-06-13 18:00:00')
                ->first();

            if (!$appointment4) {
                $appointment4 = new Appointment();
                $appointment4->starts_at = '2026-06-13 18:00:00';
                $appointment4->duration = 75;
                $appointment4->status = 'scheduled';

                // Inverse relation -> use associate for the course relation.
                $appointment4->course()->associate($course2);

                $appointment4->save();
            }
        }

        if ($course3) {
            $appointment5 = Appointment::where('course_id', $course3->id)
                ->where('starts_at', '2026-06-07 17:30:00')
                ->first();

            if (!$appointment5) {
                $appointment5 = new Appointment();
                $appointment5->starts_at = '2026-06-07 17:30:00';
                $appointment5->duration = 50;
                $appointment5->status = 'scheduled';

                // Inverse relation -> use associate for the course relation.
                $appointment5->course()->associate($course3);

                $appointment5->save();
            }

            $appointment6 = Appointment::where('course_id', $course3->id)
                ->where('starts_at', '2026-06-14 17:30:00')
                ->first();

            if (!$appointment6) {
                $appointment6 = new Appointment();
                $appointment6->starts_at = '2026-06-14 17:30:00';
                $appointment6->duration = 50;
                $appointment6->status = 'scheduled';

                // Inverse relation -> use associate for the course relation.
                $appointment6->course()->associate($course3);

                $appointment6->save();
            }
        }
    }
}
