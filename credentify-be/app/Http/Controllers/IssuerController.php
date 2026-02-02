<?php

namespace App\Http\Controllers;

use App\Http\Resources\IssuerResource;
use App\Models\Issuer;
use Illuminate\Http\Request;

class IssuerController extends Controller
{
    public function index(Request $request)
    {
        $issuers = Issuer::query()->orderBy('name')->get();

        return response()->json([
            'success' => true,
            'message' => 'Lista izdavača.',
            'data' => [
                'issuers' => IssuerResource::collection($issuers),
            ],
        ]);
    }
}
