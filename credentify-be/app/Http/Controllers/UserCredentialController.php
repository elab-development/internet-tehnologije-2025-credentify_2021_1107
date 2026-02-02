<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserCredentialResource;
use App\Http\Resources\UserResource;
use App\Models\Credential;
use App\Models\User;
use App\Models\UserCredential;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class UserCredentialController extends Controller
{
    private function requireModerator(Request $request): bool
    {
        $user = $request->user();
        return $user && $user->role === User::ROLE_MODERATOR;
    }

    /**
     *  Pregled svih kredencijala prijavljenog korisnika.
     * GET /api/me/credentials
     */
    public function myCredentials(Request $request)
    {
        $user = $request->user();

        $items = UserCredential::query()
            ->where('user_id', $user->id)
            ->with(['credential.issuer', 'credential.skills'])
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Moji kredencijali.',
            'data' => [
                'user_credentials' => UserCredentialResource::collection($items),
            ],
        ]);
    }

    /**
     * Moderator pregled - lista svih user_credentials (po potrebi filtriranje).
     * GET /api/moderator/user-credentials?status=Pending&user_id=...
     */
    public function index(Request $request)
    {
        if (!$this->requireModerator($request)) {
            return response()->json([
                'success' => false,
                'message' => 'Nemate dozvolu za ovu akciju.',
            ], 403);
        }

        $query = UserCredential::query()
            ->with(['user', 'credential.issuer', 'credential.skills'])
            ->orderByDesc('id');

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', (int) $request->input('user_id'));
        }

        $items = $query->get();

        return response()->json([
            'success' => true,
            'message' => 'Prijave za kredencijale.',
            'data' => [
                'user_credentials' => $items->map(function ($uc) {
                    return [
                        'id' => $uc->id,
                        'status' => $uc->status,
                        'applied_date' => optional($uc->applied_date)->toDateString(),
                        'issued_date' => optional($uc->issued_date)->toDateString(),
                        'expiry_date' => optional($uc->expiry_date)->toDateString(),
                        'image' => $uc->image,

                        'user' => new UserResource($uc->user),
                        'credential' => new \App\Http\Resources\CredentialResource($uc->credential),
                    ];
                }),
            ],
        ]);
    }

    /**
     * Moderator pregled po korisniku: "šta sve korisnik ima"
     * GET /api/moderator/users/{id}/credentials
     */
    public function userCredentials(Request $request, int $id)
    {
        if (!$this->requireModerator($request)) {
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

        $items = UserCredential::query()
            ->where('user_id', $user->id)
            ->with(['credential.issuer', 'credential.skills'])
            ->orderByDesc('id')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Kredencijali korisnika.',
            'data' => [
                'user' => new UserResource($user),
                'user_credentials' => UserCredentialResource::collection($items),
            ],
        ]);
    }

    /**
     * Odobravanje/odbijanje prijave kredencijala (moderator only).
     * PATCH /api/moderator/user-credentials/{id}
     *
     * Body:
     * - status:
     * - image: (opciono) url ili string
     */
    public function updateStatus(Request $request, int $id)
    {
        if (!$this->requireModerator($request)) {
            return response()->json([
                'success' => false,
                'message' => 'Nemate dozvolu za ovu akciju.',
            ], 403);
        }

        $uc = UserCredential::with('credential')->find($id);

        if (!$uc) {
            return response()->json([
                'success' => false,
                'message' => 'Prijava nije pronađena.',
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => ['required', Rule::in(['Pending', 'Approved', 'Rejected', 'Expired'])],
            'image' => ['nullable', 'string', 'max:2048'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validacija nije prošla.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $newStatus = $request->string('status');

        if ($newStatus === 'Approved') {
            $issued = Carbon::today();
            $validity = (int) ($uc->credential->validity_months ?? 24);
            if ($validity <= 0) $validity = 24;

            $uc->status = 'Approved';
            $uc->issued_date = $issued;
            $uc->expiry_date = $issued->copy()->addMonths($validity);

            // Slika je opcionalna (može moderator da doda ili da ostane iz seed-a).
            if ($request->filled('image')) {
                $uc->image = $request->string('image');
            }
        }

        if ($newStatus === 'Rejected') {
            $uc->status = 'Rejected';

            // kad odbijemo, nema issued/expiry i nema slike.
            $uc->issued_date = null;
            $uc->expiry_date = null;
            $uc->image = null;
        }

        if ($newStatus === 'Pending') {
            $uc->status = 'Pending';
            $uc->issued_date = null;
            $uc->expiry_date = null;
            $uc->image = null;
        }

        if ($newStatus === 'Expired') {
            $uc->status = 'Expired';
        }

        $uc->save();

        $uc->load(['credential.issuer', 'credential.skills']);

        return response()->json([
            'success' => true,
            'message' => 'Status je uspešno ažuriran.',
            'data' => [
                'user_credential' => new UserCredentialResource($uc),
            ],
        ]);
    }
}
