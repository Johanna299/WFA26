<?php

use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\DifficultyController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

//--------------------------------------------------------------------------
// Routes for courses
//--------------------------------------------------------------------------
//get all courses (slug .../api/courses)
Route::get('courses', [CourseController::class, 'index']);
//get one course
Route::get('courses/{course}', [CourseController::class, 'show']);
Route::post('courses', [CourseController::class, 'save']);
Route::put('courses/{course}', [CourseController::class, 'update']);
Route::delete('courses/{course}', [CourseController::class, 'delete']);

//--------------------------------------------------------------------------
// Routes for appointments
//--------------------------------------------------------------------------
//get all courses (slug .../api/appointments)
Route::get('appointments', [AppointmentController::class, 'index']);
//get one appointment
Route::get('appointments/{appointment}', [AppointmentController::class, 'show']);
//new appointment
Route::post('appointments', [AppointmentController::class, 'save']);
//update appointment
Route::put('appointments/{appointment}', [AppointmentController::class, 'update']);
//delete appointment
Route::delete('appointments/{appointment}', [AppointmentController::class, 'delete']);

//--------------------------------------------------------------------------
// Routes for bookings
//--------------------------------------------------------------------------
//get all courses (slug .../api/bookings)
Route::get('bookings', [BookingController::class, 'index']);
Route::get('bookings/{booking}', [BookingController::class, 'show']);
Route::post('bookings', [BookingController::class, 'save']);
Route::put('bookings/{booking}/cancel', [BookingController::class, 'cancel']);
Route::delete('bookings/{booking}', [BookingController::class, 'delete']);

//--------------------------------------------------------------------------
// Routes for categories
//--------------------------------------------------------------------------
//get all courses (slug .../api/categories)
Route::get('categories', [CategoryController::class, 'index']);
Route::get('categories/{category}', [CategoryController::class, 'show']);
Route::post('categories', [CategoryController::class, 'save']);
Route::put('categories/{category}', [CategoryController::class, 'update']);
Route::delete('categories/{category}', [CategoryController::class, 'delete']);

//--------------------------------------------------------------------------
// Routes for difficulties
//--------------------------------------------------------------------------
//get all courses (slug .../api/difficulties)
Route::get('difficulties', [DifficultyController::class, 'index']);
Route::get('difficulties/{difficulty}', [DifficultyController::class, 'show']);
Route::post('difficulties', [DifficultyController::class, 'save']);
Route::put('difficulties/{difficulty}', [DifficultyController::class, 'update']);
Route::delete('difficulties/{difficulty}', [DifficultyController::class, 'delete']);
