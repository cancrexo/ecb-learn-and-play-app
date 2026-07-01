<?php

use App\Http\Controllers\Api\Admin\AuthController as AdminAuthController;
use App\Http\Controllers\Api\Admin\ScoreController as AdminScoreController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClusterController;
use App\Http\Controllers\Api\GameController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/verify-email', [AuthController::class, 'verifyEmail'])->middleware('throttle:5,1');
Route::post('/resend-verification-code', [AuthController::class, 'resendVerificationCode'])->middleware('throttle:3,1');

Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:5,1');
Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:5,1');

Route::get('/version', function () {
    $composer = json_decode(file_get_contents(base_path('composer.json')), true);

    return response()->json([
        'version' => $composer['version'] ?? '0.0.0',
    ]);
});

Route::prefix('admin')->group(function () {
    Route::post('/login', [AdminAuthController::class, 'login'])->middleware('throttle:5,1');

    Route::middleware(['admin.auth', 'throttle:60,1'])->group(function () {
        Route::post('/logout', [AdminAuthController::class, 'logout']);
        Route::get('/scores', [AdminScoreController::class, 'index']);
        Route::get('/scores/export', [AdminScoreController::class, 'export']);
    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    Route::get('/clusters', [ClusterController::class, 'index']);

    Route::post('/game/start', [GameController::class, 'start']);
    Route::get('/game/current', [GameController::class, 'current']);
    Route::post('/game/answer', [GameController::class, 'answer']);
    Route::post('/game/advance', [GameController::class, 'advance']);
    Route::post('/game/pause', [GameController::class, 'pause']);
    Route::post('/game/restart', [GameController::class, 'restart']);
    Route::post('/game/abandon', [GameController::class, 'abandon']);
    Route::get('/game/ranking', [GameController::class, 'ranking']);
});
