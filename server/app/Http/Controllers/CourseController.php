<?php

namespace App\Http\Controllers;

use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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

    /**
     * Create a new course.
     */
    public function save(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'required|string|max:255',
            'participant_limit' => 'required|integer|min:1',
            'difficulty_id' => 'required|exists:difficulties,id',
            'trainer_id' => 'required|exists:users,id',
            // A course must have at least one category so it can be filtered
            'category_ids' => 'required|array|min:1',
            'category_ids.*' => 'exists:categories,id',
        ]);

        // Use a transaction because course data and category assignments belong together.
        DB::beginTransaction();

        try {
            $course = new Course();
            $course->title = $request->title;
            $course->description = $request->description;
            $course->location = $request->location;
            $course->participant_limit = $request->participant_limit;
            $course->difficulty_id = $request->difficulty_id;

            // Inverse relation -> use associate for the trainer relation:
            // Assign the selected trainer to the course by setting the trainer_id foreign key.
            $course->trainer()->associate($request->trainer_id);
            $course->save();

            // Sync the course categories in the pivot table so the course
            // is linked to exactly these category IDs.
            if ($request->has('category_ids') && is_array($request->category_ids)) {
                $course->categories()->sync($request->category_ids);
            }

            DB::commit();

            // Eager load related models because relationships are not included automatically.
            $course->load([
                'trainer',
                'difficulty',
                'categories',
                'appointments',
            ]);

            return response()->json($course, 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json('saving course failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Update an existing course.
     */
    public function update(Request $request, Course $course): JsonResponse
    {
        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'sometimes|required|string|max:255',
            'participant_limit' => 'sometimes|required|integer|min:1',
            'difficulty_id' => 'sometimes|required|exists:difficulties,id',
            'trainer_id' => 'sometimes|required|exists:users,id',
            // If categories are updated, at least one category must remain assigned to the course.
            'category_ids' => 'sometimes|required|array|min:1',
            'category_ids.*' => 'exists:categories,id',
        ]);

        // Use a transaction because course data and category assignments belong together.
        DB::beginTransaction();

        try {
            if ($request->has('title')) {
                $course->title = $request->title;
            }

            if ($request->has('description')) {
                $course->description = $request->description;
            }

            if ($request->has('location')) {
                $course->location = $request->location;
            }

            if ($request->has('participant_limit')) {
                $course->participant_limit = $request->participant_limit;
            }

            if ($request->has('difficulty_id')) {
                $course->difficulty_id = $request->difficulty_id;
            }

            if ($request->has('trainer_id')) {
                // Inverse relation -> use associate for the trainer relation.
                $course->trainer()->associate($request->trainer_id);
            }

            $course->save();

            // Sync category assignments if category IDs are provided.
            if ($request->has('category_ids') && is_array($request->category_ids)) {
                $course->categories()->sync($request->category_ids);
            }

            DB::commit();

            $course->load([
                'trainer',
                'difficulty',
                'categories',
                'appointments',
            ]);

            return response()->json($course, 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json('updating course failed: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Delete a course.
     */
    public function delete(Course $course): JsonResponse
    {
        $course->delete();

        return response()->json('course successfully deleted', 200);
    }
}
