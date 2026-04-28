<?php

namespace App\Http\Controllers;

use App\Models\Difficulty;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DifficultyController extends Controller
{
    /**
     * Return all difficulty levels with related courses as JSON.
     */
    public function index(): JsonResponse
    {
        // Eager load related models because relationships are not included automatically.
        $difficulties = Difficulty::with([
            'courses',
        ])->get();

        return response()->json($difficulties, 200);
    }

    /**
     * Return one difficulty level with related courses as JSON.
     */
    public function show(Difficulty $difficulty): JsonResponse
    {
        // Eager load related models because relationships are not included automatically.
        $difficulty->load([
            'courses',
        ]);

        return response()->json($difficulty, 200);
    }

    /**
     * Create a new difficulty level.
     */
    public function save(Request $request): JsonResponse
    {
        // No transaction is needed here because only a single difficulty record is written.
        $request->validate([
            'name' => 'required|string|max:255|unique:difficulties,name',
        ]);

        $difficulty = new Difficulty();
        $difficulty->name = $request->name;
        $difficulty->save();

        // Eager load related models because relationships are not included automatically.
        $difficulty->load([
            'courses',
        ]);

        return response()->json($difficulty, 201);
    }

    /**
     * Update an existing difficulty level.
     */
    public function update(Request $request, Difficulty $difficulty): JsonResponse
    {
        // No transaction is needed here because only a single difficulty record is updated.

        // Validate the name as unique, but ignore the current difficulty so
        // updating without changing the name is allowed.
        $request->validate([
            'name' => 'sometimes|required|string|max:255|unique:difficulties,name,' . $difficulty->id,
        ]);

        if ($request->has('name')) {
            $difficulty->name = $request->name;
        }

        $difficulty->save();

        // Eager load related models because relationships are not included automatically.
        $difficulty->load([
            'courses',
        ]);

        return response()->json($difficulty, 200);
    }

    /**
     * Delete a difficulty level.
     */
    public function delete(Difficulty $difficulty): JsonResponse
    {
        // No transaction is needed here because only a single difficulty record is deleted.
        $difficulty->delete();

        return response()->json('difficulty successfully deleted', 200);
    }
}
