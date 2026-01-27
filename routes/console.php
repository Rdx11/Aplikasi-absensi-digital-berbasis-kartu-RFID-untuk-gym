<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Cek member expired setiap hari jam 00:01
Schedule::command('members:check-expired')->dailyAt('00:01');

// Archive data absensi setiap bulan tanggal 1 jam 02:00
Schedule::command('attendance:archive')->monthlyOn(1, '02:00');
