<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Member;
use App\Models\UnregisteredRfid;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Stats cards
        $stats = [
            'totalMembers' => Member::count(),
            'activeMembers' => Member::where('status', 'active')->count(),
            'todayAttendances' => Attendance::whereDate('date', today())->count(),
            'unregisteredCards' => UnregisteredRfid::where('is_registered', false)->count(),
        ];

        // Chart data: 7 hari terakhir
        $chartData = collect(range(6, 0))->map(function ($daysAgo) {
            $date = today()->subDays($daysAgo);
            return [
                'date' => $date->format('d/m'),
                'count' => Attendance::whereDate('date', $date)->count(),
            ];
        });

        // Recent attendances
        $recentAttendances = Attendance::with('member')
            ->whereDate('date', today())
            ->latest('check_in_time')
            ->take(5)
            ->get()
            ->map(fn($a) => [
                'id' => $a->id,
                'member_name' => $a->member->name,
                'member_photo' => $a->member->photo,
                'check_in_time' => $a->check_in_time->timezone('Asia/Jakarta')->format('H:i'),
                'check_out_time' => $a->check_out_time?->timezone('Asia/Jakarta')->format('H:i'),
                'status' => $a->check_out_time ? 'Pulang' : 'Hadir',
            ]);

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'chartData' => $chartData,
            'recentAttendances' => $recentAttendances,
        ]);
    }
}
