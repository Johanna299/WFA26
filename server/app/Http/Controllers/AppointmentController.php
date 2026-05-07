<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
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
        // No transaction needed because only a single appointment record is written.
        $request->validate([
            //course_id is required and must reference an existing course
            'course_id' => 'required|exists:courses,id',
            'starts_at' => 'required|date',
            'duration' => 'required|integer|min:1',
        ]);

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
        // No transaction needed because only a single appointment record is updated.
        $request->validate([
            //'sometimes' means the field is only validated if it is present in the request
            'course_id' => 'sometimes|required|exists:courses,id',
            'starts_at' => 'sometimes|required|date',
            'duration' => 'sometimes|required|integer|min:1',
            'status' => 'sometimes|required|in:scheduled,cancelled,finished',
        ]);

        // Prevent editing appointments that have already started or are in the past.
        if ($appointment->starts_at <= now()) {
            return response()->json(
                'appointment cannot be updated because it has already started or is in the past',
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
}
