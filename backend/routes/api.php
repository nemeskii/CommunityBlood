<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DonorController;
use App\Http\Controllers\Api\DonorAuthController;
use App\Http\Controllers\Api\DonationController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\OtpController;
use App\Http\Controllers\Api\BloodRequestController;

Route::post('/otp/send', [OtpController::class, 'send']);
Route::post('/otp/verify', [OtpController::class, 'verify']);

\DB::listen(function ($query) {
    \Log::info($query->sql . ' — ' . $query->time . 'ms');
});

// Public routes
Route::post('/register', [DonorController::class, 'store']);
Route::post('/donor/login', [DonorAuthController::class, 'login']);
Route::post('/admin/login', [AuthController::class, 'login']);
Route::get('/blood-inventory', [DonorController::class, 'inventory']);
Route::get('/blood-search', [DonorController::class, 'search']);
Route::post('/blood-requests', [BloodRequestController::class, 'store']);

// Protected donor routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/donor/logout', [DonorAuthController::class, 'logout']);
    Route::get('/donor/me', [DonorAuthController::class, 'me']);
    Route::put('/donor/profile', [DonorController::class, 'completeProfile']);
    Route::get('/donations', [DonationController::class, 'index']);
    Route::post('/donations', [DonationController::class, 'store']);
});

// Protected admin routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/admin/logout', [AuthController::class, 'logout']);
    Route::get('/admin/me', [AuthController::class, 'me']);

    Route::get('/admin/donors', [DonorController::class, 'index']);
    Route::get('/admin/donors/{donor}', [DonorController::class, 'show']);
    Route::put('/admin/donors/{donor}', [DonorController::class, 'update']);
    Route::delete('/admin/donors/{donor}', [DonorController::class, 'destroy']);

    Route::get('/admin/donations', [DonationController::class, 'adminIndex']);
    Route::put('/admin/donations/{donation}', [DonationController::class, 'updateStatus']);
    Route::get('/admin/donors/{donor}/government-id', [DonorController::class, 'governmentId']);

    Route::get('/admin/blood-requests', [BloodRequestController::class, 'index']);
    Route::put('/admin/blood-requests/{bloodRequest}', [BloodRequestController::class, 'updateStatus']);
});