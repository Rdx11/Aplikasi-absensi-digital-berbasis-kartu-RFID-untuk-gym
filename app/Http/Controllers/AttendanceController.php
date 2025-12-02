<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\Member;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $query = Attendance::with('member.membershipType');

        // Default: hari ini
        $date = $request->date ?? today()->format('Y-m-d');
        
        if ($request->date_from && $request->date_to) {
            $query->whereBetween('date', [$request->date_from, $request->date_to]);
        } else {
            $query->whereDate('date', $date);
        }

        if ($request->member_id) {
            $query->where('member_id', $request->member_id);
        }

        $attendances = $query->latest('check_in_time')->paginate(15)->withQueryString();
        $members = Member::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Attendances/Index', [
            'attendances' => $attendances,
            'members' => $members,
            'filters' => $request->only(['date', 'date_from', 'date_to', 'member_id']),
        ]);
    }

    public function history(Request $request)
    {
        $query = Attendance::with('member.membershipType');

        if ($request->date_from && $request->date_to) {
            $query->whereBetween('date', [$request->date_from, $request->date_to]);
        }

        if ($request->member_id) {
            $query->where('member_id', $request->member_id);
        }

        $attendances = $query->latest('date')->latest('check_in_time')->paginate(20)->withQueryString();
        $members = Member::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Attendances/History', [
            'attendances' => $attendances,
            'members' => $members,
            'filters' => $request->only(['date_from', 'date_to', 'member_id']),
        ]);
    }
}
