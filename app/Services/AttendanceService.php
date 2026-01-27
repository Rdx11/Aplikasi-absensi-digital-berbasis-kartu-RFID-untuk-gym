<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\AttendanceArchive;
use App\Models\AttendanceSummary;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AttendanceService
{
    /**
     * Query attendance dari semua sumber (main, archive, summary)
     * untuk laporan historis
     */
    public function getAttendanceHistory($memberId, $startDate, $endDate)
    {
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);
        $twoYearsAgo = Carbon::now()->subYears(2);
        $fiveYearsAgo = Carbon::now()->subYears(5);

        $results = [];

        // Data dari tabel utama (< 2 tahun)
        if ($end->gte($twoYearsAgo)) {
            $mainData = Attendance::where('member_id', $memberId)
                ->whereBetween('date', [
                    $start->gte($twoYearsAgo) ? $start : $twoYearsAgo,
                    $end
                ])
                ->orderBy('date', 'desc')
                ->get();
            
            $results['detail'] = $mainData;
        }

        // Data dari archive (2-5 tahun)
        if ($start->lt($twoYearsAgo) && $end->gte($fiveYearsAgo)) {
            $archiveData = AttendanceArchive::where('member_id', $memberId)
                ->whereBetween('date', [
                    $start->gte($fiveYearsAgo) ? $start : $fiveYearsAgo,
                    $end->lte($twoYearsAgo) ? $end : $twoYearsAgo
                ])
                ->orderBy('date', 'desc')
                ->get();
            
            $results['archive'] = $archiveData;
        }

        // Data dari summary (> 5 tahun)
        if ($start->lt($fiveYearsAgo)) {
            $summaryData = AttendanceSummary::where('member_id', $memberId)
                ->where(function($query) use ($start, $end) {
                    $query->where(function($q) use ($start, $end) {
                        $q->where('year', '>=', $start->year)
                          ->where('year', '<=', $end->year);
                    });
                })
                ->orderBy('year', 'desc')
                ->orderBy('month', 'desc')
                ->get();
            
            $results['summary'] = $summaryData;
        }

        return $results;
    }

    /**
     * Hitung total kehadiran member (dari semua sumber)
     */
    public function getTotalAttendance($memberId, $year = null)
    {
        $year = $year ?? Carbon::now()->year;
        $twoYearsAgo = Carbon::now()->subYears(2)->year;
        $fiveYearsAgo = Carbon::now()->subYears(5)->year;

        $total = 0;

        // Dari tabel utama
        if ($year >= $twoYearsAgo) {
            $total += Attendance::where('member_id', $memberId)
                ->whereYear('date', $year)
                ->count();
        }

        // Dari archive
        if ($year < $twoYearsAgo && $year >= $fiveYearsAgo) {
            $total += AttendanceArchive::where('member_id', $memberId)
                ->whereYear('date', $year)
                ->count();
        }

        // Dari summary
        if ($year < $fiveYearsAgo) {
            $total += AttendanceSummary::where('member_id', $memberId)
                ->where('year', $year)
                ->sum('total_days');
        }

        return $total;
    }

    /**
     * Get statistik database untuk monitoring
     */
    public function getDatabaseStats()
    {
        return [
            'main_table' => [
                'count' => Attendance::count(),
                'oldest' => Attendance::min('date'),
                'newest' => Attendance::max('date'),
                'size_estimate' => $this->estimateTableSize('attendances'),
            ],
            'archive_table' => [
                'count' => AttendanceArchive::count(),
                'oldest' => AttendanceArchive::min('date'),
                'newest' => AttendanceArchive::max('date'),
                'size_estimate' => $this->estimateTableSize('attendance_archives'),
            ],
            'summary_table' => [
                'count' => AttendanceSummary::count(),
                'years_covered' => AttendanceSummary::distinct('year')->count(),
                'size_estimate' => $this->estimateTableSize('attendance_summaries'),
            ],
        ];
    }

    private function estimateTableSize($tableName)
    {
        $result = DB::select("
            SELECT 
                ROUND((data_length + index_length) / 1024 / 1024, 2) AS size_mb
            FROM information_schema.TABLES 
            WHERE table_schema = DATABASE()
            AND table_name = ?
        ", [$tableName]);

        return $result[0]->size_mb ?? 0;
    }
}
