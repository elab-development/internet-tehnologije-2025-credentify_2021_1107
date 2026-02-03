<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    /**
     * Registracija novog korisnika.
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validacija nije prošla.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::create([
            'name' => $request->string('name'),
            'email' => $request->string('email'),
            'password' => $request->string('password'),
            'role' => User::ROLE_USER,
            'profile_info' => 'Standardni korisnik Credentify aplikacije. Prati svoje kredencijale i veštine.',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Registracija uspešna.',
            'data' => [
                'user' => new UserResource($user),
            ],
        ], 201);
    }

    /**
     *  Prijavljivanje na platformu.
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validacija nije prošla.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::where('email', $request->string('email'))->first();

        if (!$user || !Hash::check($request->string('password'), $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Neispravni kredencijali.',
                'errors' => ['auth' => ['Email ili lozinka nisu tačni.']],
            ], 401);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Prijava uspešna.',
            'data' => [
                'user' => new UserResource($user),
                'token' => $token,
            ],
        ], 200);
    }

    /**
     * Odjavljivanje sa platforme. ručno čitamo Bearer token i brišemo ga.
     */
    public function logout(Request $request)
    {
        $bearer = $request->bearerToken();

        if (!$bearer) {
            return response()->json([
                'success' => false,
                'message' => 'Nedostaje Bearer token.',
            ], 401);
        }

        $accessToken = PersonalAccessToken::findToken($bearer);

        if (!$accessToken) {
            return response()->json([
                'success' => false,
                'message' => 'Token nije validan.',
            ], 401);
        }

        $accessToken->delete();

        return response()->json([
            'success' => true,
            'message' => 'Odjava uspešna.',
        ], 200);
    }
}
