<?php

namespace App\Http\Controllers;

use App\Http\Resources\CredentialResource;
use App\Models\Credential;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class CredentialController extends Controller
{
    private function requireModerator(Request $request): bool
    {
        $user = $request->user();
        return $user && $user->role === User::ROLE_MODERATOR;
    }

    public function index(Request $request)
    {
        $credentials = Credential::query()
            ->with(['issuer', 'skills'])
            ->orderBy('id')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Lista kredencijala.',
            'data' => [
                'credentials' => CredentialResource::collection($credentials),
            ],
        ]);
    }

    public function show(Request $request, int $id)
    {
        $credential = Credential::with(['issuer', 'skills'])->find($id);

        if (!$credential) {
            return response()->json([
                'success' => false,
                'message' => 'Kredencijal nije pronađen.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detalji kredencijala.',
            'data' => [
                'credential' => new CredentialResource($credential),
            ],
        ]);
    }

    /**
     * Kreiranje novog kredencijala (moderator only)
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
            'name' => ['required', 'string', 'max:255', 'unique:credentials,name'],
            'category' => ['nullable', 'string', 'max:255'],
            'validity_months' => ['nullable', 'integer', 'min:1', 'max:120'],
            'issuer_id' => ['required', 'integer', 'exists:issuers,id'],
            'is_active' => ['nullable', 'boolean'],

            'skill_ids' => ['required', 'array', 'min:1', 'max:2'],
            'skill_ids.*' => ['integer', 'exists:skills,id'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validacija nije prošla.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $credential = Credential::create([
            'name' => $request->string('name'),
            'category' => $request->input('category'),
            'validity_months' => $request->input('validity_months'),
            'issuer_id' => $request->integer('issuer_id'),
            'is_active' => $request->boolean('is_active', true),
        ]);

        $credential->skills()->sync($request->input('skill_ids', []));

        $credential->load(['issuer', 'skills']);

        return response()->json([
            'success' => true,
            'message' => 'Kredencijal je uspešno kreiran.',
            'data' => [
                'credential' => new CredentialResource($credential),
            ],
        ], 201);
    }

    /**
     * Izmena kredencijala (moderator only)
     */
    public function update(Request $request, int $id)
    {
        if (!$this->requireModerator($request)) {
            return response()->json([
                'success' => false,
                'message' => 'Nemate dozvolu za ovu akciju.',
            ], 403);
        }

        $credential = Credential::find($id);

        if (!$credential) {
            return response()->json([
                'success' => false,
                'message' => 'Kredencijal nije pronađen.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => [
                'required', 'string', 'max:255',
                Rule::unique('credentials', 'name')->ignore($credential->id),
            ],
            'category' => ['nullable', 'string', 'max:255'],
            'validity_months' => ['nullable', 'integer', 'min:1', 'max:120'],
            'issuer_id' => ['required', 'integer', 'exists:issuers,id'],
            'is_active' => ['nullable', 'boolean'],

            'skill_ids' => ['required', 'array', 'min:1', 'max:2'],
            'skill_ids.*' => ['integer', 'exists:skills,id'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validacija nije prošla.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $credential->update([
            'name' => $request->string('name'),
            'category' => $request->input('category'),
            'validity_months' => $request->input('validity_months'),
            'issuer_id' => $request->integer('issuer_id'),
            'is_active' => $request->boolean('is_active', true),
        ]);

        $credential->skills()->sync($request->input('skill_ids', []));
        $credential->load(['issuer', 'skills']);

        return response()->json([
            'success' => true,
            'message' => 'Kredencijal je uspešno izmenjen.',
            'data' => [
                'credential' => new CredentialResource($credential),
            ],
        ]);
    }
}
