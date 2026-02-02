<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

class UserController extends Controller
{
    /**
     * - uzmi Bearer token,
     * - pronađi Sanctum token,
     * - uzmi user-a,
     * - proveri role.
     */
    private function requireAdmin(Request $request): ?User
    {
        $bearer = $request->bearerToken();
        if (!$bearer) {
            return null;
        }

        $token = PersonalAccessToken::findToken($bearer);
        if (!$token) {
            return null;
        }

        $user = $token->tokenable; // User
        if (!$user instanceof User) {
            return null;
        }

        if ($user->role !== User::ROLE_ADMIN) {
            return null;
        }

        return $user;
    }

    /**
     * Pregled registrovanih korisnika (admin).
     * GET /api/users
     */
    public function index(Request $request)
    {
        if (!$this->requireAdmin($request)) {
            return response()->json([
                'success' => false,
                'message' => 'Nemate dozvolu za ovu akciju.',
            ], 403);
        }

        $users = User::query()
            ->orderBy('id')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Lista korisnika.',
            'data' => [
                'users' => UserResource::collection($users),
            ],
        ]);
    }

    /**
     * Uklanjanje korisničkog naloga (admin).
     * DELETE /api/users/{id}
     */
    public function destroy(Request $request, int $id)
    {
        if (!$this->requireAdmin($request)) {
            return response()->json([
                'success' => false,
                'message' => 'Nemate dozvolu za ovu akciju.',
            ], 403);
        }

        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Korisnik nije pronađen.',
            ], 404);
        }
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'Korisnik je uspešno obrisan.',
        ]);
    }
}
