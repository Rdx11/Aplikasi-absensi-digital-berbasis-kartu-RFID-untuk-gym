<?php

use App\Http\Controllers\Api\RfidController;
use Illuminate\Support\Facades\Route;

// ESP32 RFID Scan Endpoint
Route::post('/rfid/scan', [RfidController::class, 'scan']);
