<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppointmentController extends Controller
{
    /**
     * Return all appointments with their related data as JSON.
     */
    public function index(): JsonResponse
    {
        // Eager load related models because relationships are not included automatically.
        $appointments = Appointment::with([
            'course',
            'bookings',
        ])->get();

        return response()->json($appointments, 200);
    }

    /**
     * Return one appointment with related data as JSON.
     */
    public function show(Appointment $appointment): JsonResponse
    {
        // Eager load related models because relationships are not included automatically.
        $appointment->load([
            'course',
            'bookings',
        ]);

        return response()->json($appointment, 200);
    }

    /**
     * Create a new appointment.
     */
    public function save(Request $request): JsonResponse
    {
        // Only trainers are allowed to create appointments.
        if (!$this->isTrainer()) {
            return response()->json('only trainers can create appointments', 403);
        }
        // No transaction needed because only a single appointment record is written.
        $request->validate([
            //course_id is required and must reference an existing course
            'course_id' => 'required|exists:courses,id',
            'starts_at' => 'required|date',
            'duration' => 'required|integer|min:1',
        ]);

        $course = Course::find($request->course_id);

        // Trainers may only create appointments for their own courses.
        if (!$this->ownsCourse($course)) {
            return response()->json('you are not allowed to create appointments for this course', 403);
        }

        $appointment = new Appointment();
        $appointment->course_id = $request->course_id;
        $appointment->starts_at = $request->starts_at;
        $appointment->duration = $request->duration;
        $appointment->status = 'scheduled';
        $appointment->save();

        // Eager load related models because relationships are not included automatically.
        $appointment->load([
            'course',
            'bookings',
        ]);

        return response()->json($appointment, 201);
    }

    /**
     * Update an existing appointment.
     */
    public function update(Request $request, Appointment $appointment): JsonResponse
    {
        // Only trainers are allowed to update appointments.
        if (!$this->isTrainer()) {
            return response()->json('only trainers can update appointments', 403);
        }

        // Trainers may only update appointments of their own courses.
        if (!$this->ownsAppointment($appointment)) {
            return response()->json('you are not allowed to update this appointment', 403);
        }

        // No transaction needed because only a single appointment record is updated.
        $request->validate([
            //'sometimes' means the field is only validated if it is present in the request
            'course_id' => 'sometimes|required|exists:courses,id',
            'starts_at' => 'sometimes|required|date',
            'duration' => 'sometimes|required|integer|min:1',
            'status' => 'sometimes|required|in:scheduled,cancelled,finished',
        ]);

        // Check whether core appointment fields were changed.
        $courseChanged = $request->has('course_id') && (int) $request->course_id !== (int) $appointment->course_id;
        $durationChanged = $request->has('duration') && (int) $request->duration !== (int) $appointment->duration;

        // Compare both date values as timestamps so different string formats
        // still count as the same appointment time.
        $startsAtChanged =
            $request->has('starts_at') &&
            strtotime($request->starts_at) !== strtotime($appointment->starts_at);

        // For appointments that already started or are in the past,
        // only the status may still be changed.
        if ($appointment->starts_at <= now() && ($courseChanged || $durationChanged || $startsAtChanged)) {
            return response()->json(
                'past appointments can only be updated in their status',
                422
            );
        }

        // Prevent updating an appointment to a date or time in the past.
        if ($startsAtChanged && strtotime($request->starts_at) <= time()) {
            return response()->json(
                'appointment cannot be updated to a past date or time',
                422
            );
        }

        if ($request->has('course_id')) {
            $appointment->course_id = $request->course_id;
        }

        if ($request->has('starts_at')) {
            $appointment->starts_at = $request->starts_at;
        }

        if ($request->has('duration')) {
            $appointment->duration = $request->duration;
        }

        if ($request->has('status')) {
            $appointment->status = $request->status;
        }

        $appointment->save();

        $appointment->load([
            'course',
            'bookings',
        ]);

        return response()->json($appointment, 200);
    }

    /**
     * Delete an appointment.
     */
    public function delete(Appointment $appointment): JsonResponse
    {
        // Only trainers are allowed to delete appointments.
        if (!$this->isTrainer()) {
            return response()->json('only trainers can delete appointments', 403);
        }

        // Trainers may only delete appointments of their own courses.
        if (!$this->ownsAppointment($appointment)) {
            return response()->json('you are not allowed to delete this appointment', 403);
        }

        // Prevent deleting appointments that have already started or are in the past.
        if ($appointment->starts_at <= now()) {
            return response()->json(
                'appointment cannot be deleted because it has already started or is in the past',
                422
            );
        }

        // Prevent deleting a appointment that still has bookings assigned to it.
        if ($appointment->bookings()->exists()) {
            return response()->json(
                'appointment cannot be deleted because bookings still exist',
                422
            );
        }

        $appointment->delete();

        return response()->json('appointment successfully deleted', 200);
    }

    private function isTrainer(): bool
    {
        return auth()->user()->is_trainer;
    }

    private function ownsAppointment(Appointment $appointment): bool
    {
        return $appointment->course->trainer_id === auth()->id();
    }

    private function ownsCourse(Course $course): bool
    {
        return $course->trainer_id === auth()->id();
    }
}
