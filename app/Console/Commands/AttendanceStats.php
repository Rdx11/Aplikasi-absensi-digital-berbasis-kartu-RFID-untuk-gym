<?php

namespace App\Console\Commands;

use App\Services\AttendanceService;
use Illuminate\Console\Command;

class AttendanceStats extends Command
{
    protected $signature = 'attendance:stats';
    protected $description = 'Tampilkan statistik database absensi';

    public function handle(AttendanceService $service)
    {
        $this->info('📊 Statistik Database Absensi');
        $this->newLine();

        $stats = $service->getDatabaseStats();

        // Main Table
        $this->info('🗄️  Tabel Utama (attendances) - Data 2 tahun terakhir');
        $this->table(
            ['Metric', 'Value'],
            [
                ['Total Records', number_format($stats['main_table']['count'])],
                ['Oldest Date', $stats['main_table']['oldest'] ?? 'N/A'],
                ['Newest Date', $stats['main_table']['newest'] ?? 'N/A'],
                ['Size (MB)', $stats['main_table']['size_estimate']],
            ]
        );

        // Archive Table
        $this->info('📦 Tabel Archive (attendance_archives) - Data 2-5 tahun');
        $this->table(
            ['Metric', 'Value'],
            [
                ['Total Records', number_format($stats['archive_table']['count'])],
                ['Oldest Date', $stats['archive_table']['oldest'] ?? 'N/A'],
                ['Newest Date', $stats['archive_table']['newest'] ?? 'N/A'],
                ['Size (MB)', $stats['archive_table']['size_estimate']],
            ]
        );

        // Summary Table
        $this->info('📊 Tabel Summary (attendance_summaries) - Data >5 tahun');
        $this->table(
            ['Metric', 'Value'],
            [
                ['Total Records', number_format($stats['summary_table']['count'])],
                ['Years Covered', $stats['summary_table']['years_covered']],
                ['Size (MB)', $stats['summary_table']['size_estimate']],
            ]
        );

        $totalSize = $stats['main_table']['size_estimate'] + 
                     $stats['archive_table']['size_estimate'] + 
                     $stats['summary_table']['size_estimate'];

        $this->newLine();
        $this->info("💾 Total Size: {$totalSize} MB");
    }
}
