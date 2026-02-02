<?php

namespace App\Http\Controllers;

use App\Http\Resources\SkillResource;
use App\Models\Skill;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class SkillController extends Controller
{
    private function requireModerator(Request $request): bool
    {
        $user = $request->user();
        return $user && $user->role === User::ROLE_MODERATOR;
    }

    //vracanje svih vestina, trebace
    public function index(Request $request)
    {
        $skills = Skill::query()->orderBy('id')->get();

        return response()->json([
            'success' => true,
            'message' => 'Lista veština.',
            'data' => [
                'skills' => SkillResource::collection($skills),
            ],
        ]);
    }

    /**
     * Kreiranje nove veštine (moderator only)
     */
    public function store(Request $request)
    {
        if (!$this->requireModerator($request)) {
            return response()->json([
                'success' => false,
                'message' => 'Nemate dozvolu za ovu akciju.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255', 'unique:skills,name'],
            'category' => ['nullable', 'string', 'max:255'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validacija nije prošla.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $skill = Skill::create([
            'name' => $request->string('name'),
            'category' => $request->input('category'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Veština je uspešno kreirana.',
            'data' => [
                'skill' => new SkillResource($skill),
            ],
        ], 201);
    }

    /**
     * Izmena veštine (moderator only)
     */
    public function update(Request $request, int $id)
    {
        if (!$this->requireModerator($request)) {
            return response()->json([
                'success' => false,
                'message' => 'Nemate dozvolu za ovu akciju.',
            ], 403);
        }

        $skill = Skill::find($id);

        if (!$skill) {
            return response()->json([
                'success' => false,
                'message' => 'Veština nije pronađena.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => [
                'required', 'string', 'max:255',
                Rule::unique('skills', 'name')->ignore($skill->id),
            ],
            'category' => ['nullable', 'string', 'max:255'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validacija nije prošla.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $skill->update([
            'name' => $request->string('name'),
            'category' => $request->input('category'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Veština je uspešno izmenjena.',
            'data' => [
                'skill' => new SkillResource($skill),
            ],
        ]);
    }

    /**
     * Brisanje veštine (moderator only)
     */
    public function destroy(Request $request, int $id)
    {
        if (!$this->requireModerator($request)) {
            return response()->json([
                'success' => false,
                'message' => 'Nemate dozvolu za ovu akciju.',
            ], 403);
        }

        $skill = Skill::find($id);

        if (!$skill) {
            return response()->json([
                'success' => false,
                'message' => 'Veština nije pronađena.',
            ], 404);
        }

        $skill->delete();

        return response()->json([
            'success' => true,
            'message' => 'Veština je uspešno obrisana.',
        ]);
    }
}
