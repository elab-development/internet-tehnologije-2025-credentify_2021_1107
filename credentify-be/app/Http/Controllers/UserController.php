<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use App\Http\Resources\CredentialResource;
use App\Models\Credential;
use App\Models\UserCredential;
use Carbon\Carbon;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;


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

    private function requireUserRole(Request $request): bool
    {
        $u = $request->user();
        return $u && $u->role === User::ROLE_USER;
    }

    //vracanje korisnikovog profila
    public function me(Request $request)
    {
        return response()->json([
            'success' => true,
            'message' => 'Moj profil.',
            'data' => [
                'user' => new UserResource($request->user()),
            ],
        ]);
    }

    //azuriranje profile info
    public function updateProfileInfo(Request $request)
    {
        if (!$this->requireUserRole($request)) {
            return response()->json([
                'success' => false,
                'message' => 'Nemate dozvolu za ovu akciju.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'profile_info' => ['nullable', 'string', 'max:1000'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validacija nije prošla.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $user->profile_info = $request->input('profile_info');
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profil je uspešno ažuriran.',
            'data' => [
                'user' => new UserResource($user),
            ],
        ]);
    }

    public function availableCredentials(Request $request)
    {
        if (!$this->requireUserRole($request)) {
            return response()->json([
                'success' => false,
                'message' => 'Nemate dozvolu za ovu akciju.',
            ], 403);
        }

        $userId = $request->user()->id;

        //dostupni novi kredencijali za izbor
        $credentials = Credential::query()
            ->where('is_active', true)
            ->whereDoesntHave('userCredentials', function ($q) use ($userId) {
                $q->where('user_id', $userId);
            })
            ->with(['issuer', 'skills'])
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Dostupni kredencijali.',
            'data' => [
                'credentials' => CredentialResource::collection($credentials),
            ],
        ]);
    }

    //rijava za kredencijal, biramo po user id i prijavljujemo se
    public function applyForCredential(Request $request)
    {
        if (!$this->requireUserRole($request)) {
            return response()->json([
                'success' => false,
                'message' => 'Nemate dozvolu za ovu akciju.',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'credential_id' => ['required', 'integer', 'exists:credentials,id'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validacija nije prošla.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = $request->user();
        $credentialId = (int) $request->input('credential_id');

        $credential = Credential::where('id', $credentialId)
            ->where('is_active', true)
            ->first();

        if (!$credential) {
            return response()->json([
                'success' => false,
                'message' => 'Kredencijal nije dostupan.',
            ], 422);
        }

        //provera da li vec postoji veza
        $exists = UserCredential::query()
            ->where('user_id', $user->id)
            ->where('credential_id', $credentialId)
            ->exists();

        if ($exists) {
            return response()->json([
                'success' => false,
                'message' => 'Već ste prijavljeni na ovaj kredencijal.',
            ], 409);
        }

        //ako ne postoji u pivot tabeli pravimo red
        $uc = UserCredential::create([
            'user_id' => $user->id,
            'credential_id' => $credentialId,
            'status' => 'Pending',
            'applied_date' => Carbon::today()->toDateString(), //danas se prijavljujemo
            'issued_date' => null, //nemamo datume i slike dok moderator ne odobri
            'expiry_date' => null,
            'image' => null,
        ]);

        $uc->load(['credential.issuer', 'credential.skills']);

        return response()->json([
            'success' => true,
            'message' => 'Prijava je uspešno kreirana.',
            'data' => [
                'user_credential' => new \App\Http\Resources\UserCredentialResource($uc),
            ],
        ], 201);
    }

public function adminMetrics(Request $request)
    {
        if (!$this->requireAdmin($request)) {
            return response()->json([
                'success' => false,
                'message' => 'Nemate dozvolu za ovu akciju.',
            ], 403);
        }

        $totals = [
            'users' => User::count(),
            'credentials' => Credential::count(),
            'skills' => DB::table('skills')->count(),
            'applications' => UserCredential::count(),
        ];

        // Pie 1: korisnici po ulozi.
        $usersByRole = User::query()
            ->pluck('role')
            ->countBy()
            ->map(fn ($count, $role) => ['role' => (string)$role, 'count' => (int)$count])
            ->values();

        // Pie 2: prijave po statusu.
        $applicationsByStatus = UserCredential::query()
            ->pluck('status')
            ->countBy()
            ->map(fn ($count, $status) => ['status' => (string)$status, 'count' => (int)$count])
            ->values();

        // Bar: top kredencijali po broju prijava.
        $credCounts = UserCredential::query()
            ->pluck('credential_id')
            ->countBy(); // key=credential_id, value=count

        $credIds = $credCounts->keys()->map(fn ($x) => (int)$x)->values()->all();

        $credNames = Credential::query()
            ->whereIn('id', $credIds)
            ->pluck('name', 'id'); 

        $topCredentials = $credCounts
            ->map(function ($count, $credId) use ($credNames) {
                $id = (int)$credId;
                return [
                    'id' => $id,
                    'name' => (string)($credNames->get($id) ?? 'N/A'),
                    'count' => (int)$count,
                ];
            })
            ->sortByDesc('count')
            ->values()
            ->take(5)
            ->values();

        // Line: prijave po mesecu (poslednjih 12 meseci).
        $since = Carbon::now()->subMonths(12);

        $applicationsByMonth = UserCredential::query()
            ->where('applied_date', '>=', $since)
            ->get(['applied_date'])
            ->countBy(fn ($row) => Carbon::parse($row->applied_date)->format('Y-m'))
            ->sortKeys()
            ->map(fn ($count, $month) => ['month' => (string)$month, 'count' => (int)$count])
            ->values();

        // Top skill-ovi po broju prijava (računanje preko pivot tabele, bez raw).
        $pivot = DB::table('credential_skill')->select('credential_id', 'skill_id')->get();

        $skillCounts = [];
        foreach ($pivot as $row) {
            $credId = (string)$row->credential_id;
            $c = (int)($credCounts->get($credId, 0));
            if ($c <= 0) {
                continue;
            }
            $sid = (int)$row->skill_id;
            $skillCounts[$sid] = ($skillCounts[$sid] ?? 0) + $c;
        }

        arsort($skillCounts);
        $topSkillIds = array_slice(array_keys($skillCounts), 0, 5);

        $skillNames = DB::table('skills')
            ->whereIn('id', $topSkillIds)
            ->pluck('name', 'id');

        $topSkills = collect($topSkillIds)
            ->map(fn ($id) => [
                'id' => (int)$id,
                'name' => (string)($skillNames->get((int)$id) ?? 'N/A'),
                'count' => (int)($skillCounts[(int)$id] ?? 0),
            ])
            ->values();

        return response()->json([
            'success' => true,
            'message' => 'Admin metrike.',
            'data' => [
                'totals' => $totals,
                'usersByRole' => $usersByRole,
                'applicationsByStatus' => $applicationsByStatus,
                'topCredentials' => $topCredentials,
                'applicationsByMonth' => $applicationsByMonth,
                'topSkills' => $topSkills,
            ],
        ]);
    }


}
