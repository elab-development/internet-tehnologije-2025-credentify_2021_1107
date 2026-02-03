<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserCredentialController;
use App\Http\Controllers\CredentialController;
use App\Http\Controllers\SkillController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/issuers', [IssuerController::class, 'index']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    //admin rute za korisnike
    Route::get('/users', [UserController::class, 'index']);
    Route::delete('/users/{id}', [UserController::class, 'destroy']);

    //moderator rute
    Route::get('/skills', [SkillController::class, 'index']);
    Route::post('/skills', [SkillController::class, 'store']);
    Route::put('/skills/{id}', [SkillController::class, 'update']);
    Route::delete('/skills/{id}', [SkillController::class, 'destroy']);

    Route::get('/credentials', [CredentialController::class, 'index']);
    Route::get('/credentials/{id}', [CredentialController::class, 'show']);
    Route::post('/credentials', [CredentialController::class, 'store']);
    Route::put('/credentials/{id}', [CredentialController::class, 'update']);

    Route::get('/moderator/user-credentials', [UserCredentialController::class, 'index']);
    Route::get('/moderator/users/{id}/credentials', [UserCredentialController::class, 'userCredentials']);
    Route::patch('/moderator/user-credentials/{id}', [UserCredentialController::class, 'updateStatus']);

    //klasican logovani korisnik rute
    Route::get('/me/credentials', [UserCredentialController::class, 'myCredentials']);
    Route::get('/me', [UserController::class, 'me']);
    Route::put('/me/profile-info', [UserController::class, 'updateProfileInfo']);
    Route::get('/me/available-credentials', [UserController::class, 'availableCredentials']);
    Route::post('/me/apply', [UserController::class, 'applyForCredential']);

});
