<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\DailyPackage;
use App\Models\Member;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $query = Attendance::with(['member.membershipType', 'dailyPackage']);

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

        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->whereHas('member', function ($mq) use ($request) {
                    $mq->where('name', 'like', "%{$request->search}%");
                })->orWhere('guest_name', 'like', "%{$request->search}%")
                  ->orWhere('rfid_uid', 'like', "%{$request->search}%");
            });
        }

        $attendances = $query->latest('check_in_time')->paginate(15)->withQueryString();
        $members = Member::select('id', 'name')->orderBy('name')->get();
        $dailyPackages = DailyPackage::where('is_active', true)->get();

        return Inertia::render('Attendances/Index', [
            'attendances' => $attendances,
            'members' => $members,
            'dailyPackages' => $dailyPackages,
            'filters' => $request->only(['date', 'date_from', 'date_to', 'member_id', 'search']),
        ]);
    }

    public function storeManual(Request $request)
    {
        $validated = $request->validate([
            'guest_name' => 'required|string|max:255',
            'daily_package_id' => 'required|exists:daily_packages,id',
        ]);

        Attendance::create([
            'is_member' => false,
            'guest_name' => $validated['guest_name'],
            'daily_package_id' => $validated['daily_package_id'],
            'rfid_uid' => '-',
            'check_in_time' => now(),
            'date' => today(),
        ]);

        return redirect()->back()->with('success', 'Absensi non-member berhasil ditambahkan');
    }

    public function history(Request $request)
    {
        $query = Attendance::with(['member.membershipType', 'dailyPackage']);

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
