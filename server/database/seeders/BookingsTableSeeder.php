<?php

namespace Database\Seeders;

use App\Models\Appointment;
use App\Models\Booking;
use App\Models\Course;
use App\Models\User;
use Illuminate\Database\Seeder;

class BookingsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $participant = User::where('email', 'participant@example.com')
            ->where('is_trainer', false)
            ->first();

        $trainer = User::where('email', 'trainer@example.com')
            ->where('is_trainer', true)
            ->first();

        if (!$participant || !$trainer) {
            return;
        }

        $course1 = Course::where('title', 'Morning Yoga Basics')
            ->where('trainer_id', $trainer->id)
            ->first();

        $course2 = Course::where('title', 'Functional Strength Training')
            ->where('trainer_id', $trainer->id)
            ->first();

        if ($course1) {
            $appointment1 = Appointment::where('course_id', $course1->id)
                ->where('starts_at', '2026-06-05 09:00:00')
                ->first();

            if ($appointment1) {
                $booking1 = Booking::where('user_id', $participant->id)
                    ->where('appointment_id', $appointment1->id)
                    ->first();

                if (!$booking1) {
                    $booking1 = new Booking();
                    $booking1->status = 'booked';

                    // Inverse relations -> use associate for participant and appointment.
                    $booking1->user()->associate($participant);
                    $booking1->appointment()->associate($appointment1);

                    $booking1->save();
                }
            }
        }

        if ($course2) {
            $appointment2 = Appointment::where('course_id', $course2->id)
                ->where('starts_at', '2026-06-06 18:00:00')
                ->first();

            if ($appointment2) {
                $booking2 = Booking::where('user_id', $participant->id)
                    ->where('appointment_id', $appointment2->id)
                    ->first();

                if (!$booking2) {
                    $booking2 = new Booking();
                    $booking2->status = 'cancelled';

                    // Inverse relations -> use associate for participant and appointment.
                    $booking2->user()->associate($participant);
                    $booking2->appointment()->associate($appointment2);

                    $booking2->save();
                }
            }
        }
    }
}
