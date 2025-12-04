<?php

use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\DailyPackageController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\MembershipTypeController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\UnregisteredRfidController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect('/login');
});

Route::middleware(['auth'])->group(function () {
    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Members
    Route::resource('members', MemberController::class);

    // Membership Types
    Route::resource('membership-types', MembershipTypeController::class)->except(['show']);

    // Attendances
    Route::get('/attendances', [AttendanceController::class, 'index'])->name('attendances.index');
    Route::post('/attendances/manual', [AttendanceController::class, 'storeManual'])->name('attendances.manual');
    Route::get('/attendances/history', [AttendanceController::class, 'history'])->name('attendances.history');

    // Daily Packages
    Route::resource('daily-packages', DailyPackageController::class)->except(['show']);

    // Unregistered RFIDs
    Route::get('/unregistered', [UnregisteredRfidController::class, 'index'])->name('unregistered.index');
    Route::delete('/unregistered/{unregisteredRfid}', [UnregisteredRfidController::class, 'destroy'])->name('unregistered.destroy');

    // Reports
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('/reports/export', [ReportController::class, 'export'])->name('reports.export');
});
