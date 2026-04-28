<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    /**
     * Return all courses with related data as JSON.
     */
    public function index(): JsonResponse
    {
        // Eager load related models because relationships are not included automatically.
        $courses = Course::with([
            'trainer',
            'difficulty',
            'categories',
            'appointments',
        ])->get();

        return response()->json($courses, 200);
    }

    /**
     * Return one course with all related data as JSON.
     */
    public function show(Course $course): JsonResponse
    {
        // Eager load related models because relationships are not included automatically.
        $course->load([
            'trainer',
            'difficulty',
            'categories',
            'appointments',
        ]);

        return response()->json($course, 200);
    }

    //TODO store(), update(), destroy()
}
