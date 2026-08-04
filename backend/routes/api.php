<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DonorController;
use App\Http\Controllers\Api\DonorAuthController;
use App\Http\Controllers\Api\DonationController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\OtpController;
use App\Http\Controllers\Api\BloodRequestController;
use App\Http\Controllers\Api\AdminPasswordResetController;
use App\Http\Controllers\Api\DonorPasswordResetController;
use App\Http\Controllers\Api\MatchResponseController;
use App\Http\Controllers\Api\HospitalAuthController;
use App\Http\Controllers\Api\HospitalPortalController;
use App\Http\Controllers\Api\AdminHospitalController;
use App\Http\Controllers\Api\ContactController;

Route::post('/otp/send', [OtpController::class, 'send']);
Route::post('/otp/verify', [OtpController::class, 'verify']);

Route::post('/contact', [ContactController::class, 'send']);

Route::post('/admin/forgot-password', [AdminPasswordResetController::class, 'forgotPassword']);
Route::post('/admin/reset-password', [AdminPasswordResetController::class, 'resetPassword']);

Route::post('/donor/forgot-password', [DonorPasswordResetController::class, 'forgotPassword']);
Route::post('/donor/reset-password', [DonorPasswordResetController::class, 'resetPassword']);

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

Route::post('/hospital/register', [HospitalAuthController::class, 'register']);
Route::post('/hospital/login', [HospitalAuthController::class, 'login']);

// No-login magic-link match response (token is the auth)
Route::get('/matches/{token}/respond', [MatchResponseController::class, 'showByToken']);
Route::post('/matches/{token}/respond', [MatchResponseController::class, 'respondByToken']);

// Protected donor routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/donor/logout', [DonorAuthController::class, 'logout']);
    Route::get('/donor/me', [DonorAuthController::class, 'me']);
    Route::put('/donor/profile', [DonorController::class, 'completeProfile']);
    Route::get('/donations', [DonationController::class, 'index']);
    Route::post('/donations', [DonationController::class, 'store']);
    Route::get('/donor/blood-requests', [BloodRequestController::class, 'myRequests']);

    Route::get('/donor/matches/pending', [MatchResponseController::class, 'pendingForDonor']);
    Route::post('/donor/matches/{match}/respond', [MatchResponseController::class, 'respondInApp']);
});

// Protected hospital routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/hospital/logout', [HospitalAuthController::class, 'logout']);
    Route::get('/hospital/me', [HospitalAuthController::class, 'me']);
    Route::get('/hospital/lookup', [HospitalPortalController::class, 'lookup']);
    Route::get('/hospital/history', [HospitalPortalController::class, 'history']);
    Route::put('/hospital/donations/{donation}/confirm', [HospitalPortalController::class, 'confirmDonation']);
    Route::put('/hospital/blood-requests/{bloodRequest}/confirm', [HospitalPortalController::class, 'confirmRequest']);
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
    Route::get('/admin/blood-requests/{bloodRequest}/suggested-donors', [BloodRequestController::class, 'suggestedDonors']);
    Route::put('/admin/blood-requests/{bloodRequest}/match', [BloodRequestController::class, 'matchDonor']);
    Route::get('/admin/blood-requests/{bloodRequest}/matches', [BloodRequestController::class, 'matchHistory']);
    Route::post('/admin/blood-request-matches/{match}/resend', [BloodRequestController::class, 'resendMatchNotification']);
    Route::put('/admin/blood-request-matches/{match}/acknowledge', [MatchResponseController::class, 'acknowledge']);
    Route::get('/admin/blood-request-matches/unacknowledged-count', [MatchResponseController::class, 'unacknowledgedCount']);
    Route::get('/admin/blood-request-matches/unacknowledged', [MatchResponseController::class, 'unacknowledged']);

    Route::get('/admin/hospitals', [AdminHospitalController::class, 'index']);
    Route::get('/admin/hospital-confirmations', [AdminHospitalController::class, 'confirmations']);
    Route::put('/admin/hospitals/{hospital}/approve', [AdminHospitalController::class, 'approve']);
    Route::put('/admin/hospitals/{hospital}/reject', [AdminHospitalController::class, 'reject']);
    Route::delete('/admin/hospitals/{hospital}', [AdminHospitalController::class, 'destroy']);
});