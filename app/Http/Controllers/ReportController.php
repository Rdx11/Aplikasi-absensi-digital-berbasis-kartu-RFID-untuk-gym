<?php

namespace App\Http\Controllers;

use App\Exports\AttendanceExport;
use App\Models\Attendance;
use App\Models\Member;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $dateFrom = $request->date_from ?? today()->subDays(30)->format('Y-m-d');
        $dateTo = $request->date_to ?? today()->format('Y-m-d');

        $query = Attendance::with('member')
            ->whereBetween('date', [$dateFrom, $dateTo]);

        if ($request->member_id) {
            $query->where('member_id', $request->member_id);
        }

        // Summary stats
        $totalAttendances = (clone $query)->count();
        $uniqueMembers = (clone $query)->distinct('member_id')->count('member_id');
        
        $days = max(1, now()->parse($dateFrom)->diffInDays(now()->parse($dateTo)) + 1);
        $avgPerDay = round($totalAttendances / $days, 1);

        // Per member stats
        $memberStats = Attendance::with('member')
            ->whereBetween('date', [$dateFrom, $dateTo])
            ->when($request->member_id, fn($q) => $q->where('member_id', $request->member_id))
            ->selectRaw('member_id, COUNT(*) as total_attendance')
            ->groupBy('member_id')
            ->get()
            ->map(function ($item) use ($days) {
                return [
                    'member' => $item->member,
                    'total' => $item->total_attendance,
                    'percentage' => round(($item->total_attendance / $days) * 100, 1),
                ];
            });

        $members = Member::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Reports/Index', [
            'stats' => [
                'totalAttendances' => $totalAttendances,
                'uniqueMembers' => $uniqueMembers,
                'avgPerDay' => $avgPerDay,
            ],
            'memberStats' => $memberStats,
            'members' => $members,
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'member_id' => $request->member_id,
            ],
        ]);
    }

    public function export(Request $request)
    {
        $dateFrom = $request->date_from ?? today()->subDays(30)->format('Y-m-d');
        $dateTo = $request->date_to ?? today()->format('Y-m-d');
        $memberId = $request->member_id;

        $filename = 'rekap-absensi-' . $dateFrom . '-' . $dateTo . '.xlsx';

        return Excel::download(new AttendanceExport($dateFrom, $dateTo, $memberId), $filename);
    }
}
