<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * Return all categories with related courses as JSON.
     */
    public function index(): JsonResponse
    {
        // Eager load related models because relationships are not included automatically.
        $categories = Category::with([
            'courses',
        ])->get();

        return response()->json($categories, 200);
    }

    /**
     * Return one category with related courses as JSON.
     */
    public function show(Category $category): JsonResponse
    {
        // Eager load related models because relationships are not included automatically.
        $category->load([
            'courses',
        ]);

        return response()->json($category, 200);
    }

    /**
     * Create a new category.
     */
    public function save(Request $request): JsonResponse
    {
        // No transaction is needed here because only a single category record is written.
        $request->validate([
            'name' => 'required|string|max:255|unique:categories,name',
        ]);

        $category = new Category();
        $category->name = $request->name;
        $category->save();

        // Eager load related models because relationships are not included automatically.
        $category->load([
            'courses',
        ]);

        return response()->json($category, 201);
    }

    /**
     * Update an existing category.
     */
    public function update(Request $request, Category $category): JsonResponse
    {
        // No transaction is needed here because only a single category record is updated.

        // Validate the name as unique, but ignore the current category so
        // updating without changing the name is allowed.
        $request->validate([
            'name' => 'sometimes|required|string|max:255|unique:categories,name,' . $category->id,
        ]);

        if ($request->has('name')) {
            $category->name = $request->name;
        }

        $category->save();

        // Eager load related models because relationships are not included automatically.
        $category->load([
            'courses',
        ]);

        return response()->json($category, 200);
    }

    /**
     * Delete a category.
     */
    public function delete(Category $category): JsonResponse
    {
        // No transaction is needed here because only a single category record is deleted.
        $category->delete();

        return response()->json('category successfully deleted', 200);
    }
}
