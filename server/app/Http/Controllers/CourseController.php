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
        // Only trainers are allowed to create courses.
        if (!$this->isTrainer()) {
            return response()->json('only trainers can create courses', 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'required|string|max:255',
            'participant_limit' => 'required|integer|min:1',
            'difficulty_id' => 'required|exists:difficulties,id',
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
            // Assign the currently authenticated trainer to the new course.
            $course->trainer()->associate(auth()->user());
            $course->save();

            // Sync the course categories in the pivot table so the course
            // is linked to exactly these category IDs.
            $course->categories()->sync($request->category_ids);

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
        // Only trainers are allowed to update courses.
        if (!$this->isTrainer()) {
            return response()->json('only trainers can update courses', 403);
        }

        // Trainers may only update their own courses.
        if (!$this->ownsCourse($course)) {
            return response()->json('you are not allowed to update this course', 403);
        }

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'sometimes|required|string|max:255',
            'participant_limit' => 'sometimes|required|integer|min:1',
            'difficulty_id' => 'sometimes|required|exists:difficulties,id',
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
        // Only trainers are allowed to delete courses.
        if (!auth()->user()->is_trainer) {
            return response()->json('only trainers can delete courses', 403);
        }

        // Trainers may only delete their own courses.
        if ($course->trainer_id !== auth()->id()) {
            return response()->json('you are not allowed to delete this course', 403);
        }

        // Prevent deleting a course that still has appointments assigned to it.
        if ($course->appointments()->exists()) {
            return response()->json(
                'course cannot be deleted because appointments still exist',
                422
            );
        }

        $course->delete();

        return response()->json('course successfully deleted', 200);
    }

    private function isTrainer(): bool
    {
        return auth()->user()->is_trainer;
    }

    private function ownsCourse(Course $course): bool
    {
        return $course->trainer_id === auth()->id();
    }
}
