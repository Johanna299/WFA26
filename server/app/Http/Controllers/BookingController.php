<?php

namespace App\Http\Controllers;

use App\Models\Appointment;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BookingController extends Controller
{
    /**
     * Return all bookings with related data as JSON.
     */
    public function index(): JsonResponse
    {
        // Eager load related models because relationships are not included automatically.
        $bookings = Booking::with([
            'user',
            'appointment',
        ])->get();

        return response()->json($bookings, 200);
    }

    /**
     * Return one booking with related data as JSON.
     */
    public function show(Booking $booking): JsonResponse
    {
        // Eager load related models because relationships are not included automatically.
        $booking->load([
            'user',
            'appointment',
        ]);

        return response()->json($booking, 200);
    }

    /**
     * Create a new booking for an appointment.
     */
    public function save(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'appointment_id' => 'required|exists:appointments,id',
        ]);

        // Use a transaction because booking data, appointment and user belong together.
        DB::beginTransaction();

        try {
            // Load the selected appointment with its existing bookings for availability checks.
            $appointment = Appointment::with(['bookings', 'course'])->find($request->appointment_id);

            // Only appointments with status "scheduled" can be booked.
            if ($appointment->status !== 'scheduled') {
                return response()->json('booking failed: appointment is not available', 422);
            }

            // Check whether the user already has an active booking for this appointment.
            $alreadyBooked = Booking::where('user_id', $request->user_id)
                ->where('appointment_id', $request->appointment_id)
                ->where('status', 'booked')
                ->exists();

            // Prevent duplicate bookings for the same user and appointment.
            if ($alreadyBooked) {
                return response()->json('booking failed: user already booked this appointment', 422);
            }

            // Count how many active bookings already exist for the selected appointment.
            $activeBookingsCount = Booking::where('appointment_id', $request->appointment_id)
                ->where('status', 'booked')
                ->count();

            // Load the maximum number of participants allowed for this course
            $participantLimit = $appointment->course->participant_limit;

            // Reject the booking if the appointment has already reached its participant limit.
            if ($activeBookingsCount >= $participantLimit) {
                return response()->json('booking failed: appointment is fully booked', 422);
            }

            // Create a new booking record and mark it as an active booking.
            $booking = new Booking();
            $booking->status = 'booked';

            // Assign the participant and appointment to the booking via their belongsTo relations.
            $booking->user()->associate($request->user_id);
            $booking->appointment()->associate($appointment);
            // Save the new booking to the database.
            $booking->save();

            DB::commit();

            $booking->load([
                'user',
                'appointment',
            ]);

            return response()->json($booking, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json('saving booking failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Cancel an existing booking.
     */
    public function cancel(Booking $booking): JsonResponse
    {
        // Start a transaction so the booking status change is only stored if the whole operation succeeds.
        DB::beginTransaction();

        try {
            // Reject the request if the booking has already been cancelled.
            if ($booking->status === 'cancelled') {
                return response()->json('booking is already cancelled', 422);
            }

            // Prevent cancelling a booking if the appointment has already started or is in the past.
            if ($booking->appointment->starts_at <= now()) {
                return response()->json(
                    'booking cannot be cancelled because the appointment has already started or is in the past',
                    422
                );
            }

            // cancel the booking and save the updated booking status to the database.
            $booking->status = 'cancelled';
            $booking->save();

            DB::commit();

            // Eager load related models before returning the updated booking as JSON.
            $booking->load([
                'user',
                'appointment',
            ]);

            return response()->json($booking, 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json('cancelling booking failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete a booking.
     */
    public function delete(Booking $booking): JsonResponse
    {
        // No transaction is needed here because only a single booking record is deleted.
        $booking->delete();

        return response()->json('booking successfully deleted', 200);
    }
}
