<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class CategoryManagementController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = Category::withCount('events')->orderBy('name')->get();
        return response()->json($categories);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255|unique:categories,name',
            'description' => 'nullable|string',
        ]);

        $data['slug'] = Str::slug($data['name']);

        $category = Category::create($data);
        return response()->json(['message' => 'Category created', 'category' => $category], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $category = Category::findOrFail($id);

        $data = $request->validate([
            'name'        => 'required|string|max:255|unique:categories,name,' . $id,
            'description' => 'nullable|string',
        ]);

        $data['slug'] = Str::slug($data['name']);
        $category->update($data);

        return response()->json(['message' => 'Category updated', 'category' => $category]);
    }

    public function destroy(string $id): JsonResponse
    {
        $category = Category::findOrFail($id);

        if ($category->events()->count() > 0) {
            return response()->json(['message' => 'Cannot delete: category has events attached.'], 422);
        }

        $category->delete();
        return response()->json(['message' => 'Category deleted']);
    }
}
