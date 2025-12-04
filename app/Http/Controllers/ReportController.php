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

        $query = Attendance::with(['member', 'dailyPackage'])
            ->whereBetween('date', [$dateFrom, $dateTo]);

        if ($request->member_id) {
            $query->where('member_id', $request->member_id);
        }

        if ($request->status && $request->status !== 'all') {
            $query->where('is_member', $request->status === 'member');
        }

        // Summary stats
        $totalAttendances = (clone $query)->count();
        $memberAttendances = (clone $query)->where('is_member', true)->count();
        $nonMemberAttendances = (clone $query)->where('is_member', false)->count();
        
        $days = max(1, now()->parse($dateFrom)->diffInDays(now()->parse($dateTo)) + 1);
        $avgPerDay = round($totalAttendances / $days, 1);

        // Per member stats (hanya member) - tampilkan jika status = all atau member
        $memberStats = collect();
        if (!$request->status || $request->status === 'all' || $request->status === 'member') {
            $memberStats = Attendance::with('member')
                ->whereBetween('date', [$dateFrom, $dateTo])
                ->where('is_member', true)
                ->whereNotNull('member_id')
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
        }

        // Non-member stats - tampilkan jika status = all atau non-member
        $nonMemberStats = collect();
        if (!$request->status || $request->status === 'all' || $request->status === 'non-member') {
            $nonMemberStats = Attendance::with('dailyPackage')
                ->whereBetween('date', [$dateFrom, $dateTo])
                ->where('is_member', false)
                ->selectRaw('guest_name, daily_package_id, COUNT(*) as total_attendance')
                ->groupBy('guest_name', 'daily_package_id')
                ->get()
                ->map(function ($item) use ($days) {
                    return [
                        'guest_name' => $item->guest_name,
                        'daily_package' => $item->dailyPackage,
                        'total' => $item->total_attendance,
                        'percentage' => round(($item->total_attendance / $days) * 100, 1),
                    ];
                });
        }

        $members = Member::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Reports/Index', [
            'stats' => [
                'totalAttendances' => $totalAttendances,
                'memberAttendances' => $memberAttendances,
                'nonMemberAttendances' => $nonMemberAttendances,
                'avgPerDay' => $avgPerDay,
            ],
            'memberStats' => $memberStats,
            'nonMemberStats' => $nonMemberStats,
            'members' => $members,
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'member_id' => $request->member_id,
                'status' => $request->status ?? 'all',
            ],
        ]);
    }

    public function export(Request $request)
    {
        $dateFrom = $request->date_from ?? today()->subDays(30)->format('Y-m-d');
        $dateTo = $request->date_to ?? today()->format('Y-m-d');
        $memberId = $request->member_id;
        $status = $request->status ?? 'all';

        $filename = 'rekap-absensi-' . $dateFrom . '-' . $dateTo . '.xlsx';

        return Excel::download(new AttendanceExport($dateFrom, $dateTo, $memberId, $status), $filename);
    }
}
