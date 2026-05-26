<?php

use App\Http\Controllers\AppointmentController;
use App\Http\Controllers\AuthController;
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

//--------------------------------------------------------------------------
// Public routes
//--------------------------------------------------------------------------
// Auth
Route::post('auth/login', [AuthController::class, 'login']);

// Courses
Route::get('courses', [CourseController::class, 'index']);
Route::get('courses/{course}', [CourseController::class, 'show']);

// Appointments
Route::get('appointments', [AppointmentController::class, 'index']);
//get one appointment
Route::get('appointments/{appointment}', [AppointmentController::class, 'show']);

// Categories
Route::get('categories', [CategoryController::class, 'index']);
Route::get('categories/{category}', [CategoryController::class, 'show']);

// Difficulties
Route::get('difficulties', [DifficultyController::class, 'index']);
Route::get('difficulties/{difficulty}', [DifficultyController::class, 'show']);

//--------------------------------------------------------------------------
// Protected routes (auth needed)
//--------------------------------------------------------------------------

Route::group(['middleware' => ['api','auth.jwt']], function () {
    // Auth
    Route::get('auth/me', [AuthController::class, 'me']);
    Route::post('auth/logout', [AuthController::class, 'logout']);
    Route::post('auth/refresh', [AuthController::class, 'refresh']);

    // Courses
    Route::post('courses', [CourseController::class, 'save']);
    Route::put('courses/{course}', [CourseController::class, 'update']);
    Route::delete('courses/{course}', [CourseController::class, 'delete']);

    // Appointments
    //new appointment
    Route::post('appointments', [AppointmentController::class, 'save']);
    //update appointment
    Route::put('appointments/{appointment}', [AppointmentController::class, 'update']);
    //delete appointment
    Route::delete('appointments/{appointment}', [AppointmentController::class, 'delete']);

    // Bookings
    Route::get('bookings', [BookingController::class, 'index']);
    Route::get('bookings/{booking}', [BookingController::class, 'show']);
    Route::post('bookings', [BookingController::class, 'save']);
    Route::put('bookings/{booking}/cancel', [BookingController::class, 'cancel']);
    Route::delete('bookings/{booking}', [BookingController::class, 'delete']);

    // Categories
    Route::post('categories', [CategoryController::class, 'save']);
    Route::put('categories/{category}', [CategoryController::class, 'update']);
    Route::delete('categories/{category}', [CategoryController::class, 'delete']);

    // Difficulties
    Route::post('difficulties', [DifficultyController::class, 'save']);
    Route::put('difficulties/{difficulty}', [DifficultyController::class, 'update']);
    Route::delete('difficulties/{difficulty}', [DifficultyController::class, 'delete']);
});


