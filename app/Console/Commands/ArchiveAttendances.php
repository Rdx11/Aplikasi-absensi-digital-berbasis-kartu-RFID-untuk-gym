<?php

namespace App\Console\Commands;

use App\Models\Attendance;
use App\Models\AttendanceArchive;
use App\Models\AttendanceSummary;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ArchiveAttendances extends Command
{
    protected $signature = 'attendance:archive {--dry-run : Lihat preview tanpa eksekusi}';
    protected $description = 'Archive data absensi lama untuk optimasi database';

    public function handle()
    {
        $isDryRun = $this->option('dry-run');
        
        if ($isDryRun) {
            $this->info('🔍 DRY RUN MODE - Tidak ada data yang akan diubah');
        }

        $this->info('📊 Memulai proses archiving...');
        
        // Step 1: Archive data 2-5 tahun ke attendance_archives
        $this->archiveOldData($isDryRun);
        
        // Step 2: Summarize data >5 tahun ke attendance_summaries
        $this->summarizeVeryOldData($isDryRun);
        
        // Step 3: Hapus data >10 tahun
        $this->deleteAncientData($isDryRun);
        
        $this->info('✅ Proses archiving selesai!');
    }

    private function archiveOldData($isDryRun)
    {
        $twoYearsAgo = Carbon::now()->subYears(2);
        $fiveYearsAgo = Carbon::now()->subYears(5);

        $count = Attendance::whereBetween('date', [$fiveYearsAgo, $twoYearsAgo])->count();
        
        $this->info("📦 Data untuk di-archive (2-5 tahun): {$count} records");

        if ($count > 0 && !$isDryRun) {
            DB::transaction(function () use ($twoYearsAgo, $fiveYearsAgo) {
                // Copy ke archive
                $attendances = Attendance::whereBetween('date', [$fiveYearsAgo, $twoYearsAgo])
                    ->orderBy('id')
                    ->chunk(1000, function ($records) {
                        foreach ($records as $record) {
                            AttendanceArchive::create($record->toArray());
                        }
                    });

                // Hapus dari tabel utama
                $deleted = Attendance::whereBetween('date', [$fiveYearsAgo, $twoYearsAgo])->delete();
                $this->info("✓ Berhasil archive {$deleted} records");
            });
        }
    }

    private function summarizeVeryOldData($isDryRun)
    {
        $fiveYearsAgo = Carbon::now()->subYears(5);
        $tenYearsAgo = Carbon::now()->subYears(10);

        $count = AttendanceArchive::whereBetween('date', [$tenYearsAgo, $fiveYearsAgo])->count();
        
        $this->info("📊 Data untuk di-summarize (5-10 tahun): {$count} records");

        if ($count > 0 && !$isDryRun) {
            DB::transaction(function () use ($fiveYearsAgo, $tenYearsAgo) {
                // Group by member, year, month
                $summaries = AttendanceArchive::whereBetween('date', [$tenYearsAgo, $fiveYearsAgo])
                    ->select(
                        'member_id',
                        DB::raw('YEAR(date) as year'),
                        DB::raw('MONTH(date) as month'),
                        DB::raw('COUNT(*) as total_days'),
                        DB::raw('SUM(TIMESTAMPDIFF(HOUR, check_in_time, check_out_time)) as total_hours'),
                        DB::raw('MIN(date) as first_attendance'),
                        DB::raw('MAX(date) as last_attendance')
                    )
                    ->groupBy('member_id', 'year', 'month')
                    ->get();

                foreach ($summaries as $summary) {
                    AttendanceSummary::updateOrCreate(
                        [
                            'member_id' => $summary->member_id,
                            'year' => $summary->year,
                            'month' => $summary->month,
                        ],
                        [
                            'total_days' => $summary->total_days,
                            'total_hours' => $summary->total_hours ?? 0,
                            'first_attendance' => $summary->first_attendance,
                            'last_attendance' => $summary->last_attendance,
                        ]
                    );
                }

                // Hapus dari archive setelah di-summarize
                $deleted = AttendanceArchive::whereBetween('date', [$tenYearsAgo, $fiveYearsAgo])->delete();
                $this->info("✓ Berhasil summarize dan hapus {$deleted} records dari archive");
            });
        }
    }

    private function deleteAncientData($isDryRun)
    {
        $tenYearsAgo = Carbon::now()->subYears(10);

        $countArchive = AttendanceArchive::where('date', '<', $tenYearsAgo)->count();
        $countSummary = AttendanceSummary::where(function($query) use ($tenYearsAgo) {
            $query->where('year', '<', $tenYearsAgo->year)
                  ->orWhere(function($q) use ($tenYearsAgo) {
                      $q->where('year', '=', $tenYearsAgo->year)
                        ->where('month', '<', $tenYearsAgo->month);
                  });
        })->count();
        
        $this->info("🗑️  Data untuk dihapus (>10 tahun): Archive={$countArchive}, Summary={$countSummary}");

        if (($countArchive > 0 || $countSummary > 0) && !$isDryRun) {
            $deletedArchive = AttendanceArchive::where('date', '<', $tenYearsAgo)->delete();
            $deletedSummary = AttendanceSummary::where(function($query) use ($tenYearsAgo) {
                $query->where('year', '<', $tenYearsAgo->year)
                      ->orWhere(function($q) use ($tenYearsAgo) {
                          $q->where('year', '=', $tenYearsAgo->year)
                            ->where('month', '<', $tenYearsAgo->month);
                      });
            })->delete();
            
            $this->info("✓ Berhasil hapus {$deletedArchive} archive + {$deletedSummary} summary");
        }
    }
}
