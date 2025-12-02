<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Member;
use App\Models\UnregisteredRfid;
use Illuminate\Http\Request;

class RfidController extends Controller
{
    public function scan(Request $request)
    {
        $request->validate([
            'rfid_uid' => 'required|string',
        ]);

        $rfidUid = $request->rfid_uid;
        $member = Member::where('rfid_uid', $rfidUid)->first();

        if (!$member) {
            // Simpan ke unregistered_rfids
            UnregisteredRfid::create([
                'rfid_uid' => $rfidUid,
                'scan_time' => now(),
                'is_registered' => false,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'RFID belum terdaftar',
            ], 404);
        }

        // Cek status member
        if ($member->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Member tidak aktif atau sudah expired',
                'member' => [
                    'name' => $member->name,
                    'status' => $member->status,
                ],
            ], 403);
        }

        // Cek membership expired
        if ($member->membership_end_date < today()) {
            $member->update(['status' => 'expired']);
            return response()->json([
                'success' => false,
                'message' => 'Membership sudah expired',
                'member' => [
                    'name' => $member->name,
                    'expired_date' => $member->membership_end_date->format('d/m/Y'),
                ],
            ], 403);
        }

        // Cek apakah sudah check-in hari ini
        $todayAttendance = Attendance::where('member_id', $member->id)
            ->whereDate('date', today())
            ->first();

        if ($todayAttendance) {
            // Jika belum check-out, lakukan check-out
            if (!$todayAttendance->check_out_time) {
                $todayAttendance->update(['check_out_time' => now()]);
                return response()->json([
                    'success' => true,
                    'message' => 'Check-out berhasil',
                    'type' => 'check_out',
                    'member' => [
                        'name' => $member->name,
                        'photo' => $member->photo,
                    ],
                    'time' => now()->format('H:i:s'),
                ]);
            }

            // Sudah check-in dan check-out
            return response()->json([
                'success' => true,
                'message' => 'Sudah absen hari ini',
                'type' => 'already',
                'member' => [
                    'name' => $member->name,
                    'check_in' => $todayAttendance->check_in_time->format('H:i'),
                    'check_out' => $todayAttendance->check_out_time->format('H:i'),
                ],
            ]);
        }

        // Buat check-in baru
        Attendance::create([
            'member_id' => $member->id,
            'rfid_uid' => $rfidUid,
            'check_in_time' => now(),
            'date' => today(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Check-in berhasil',
            'type' => 'check_in',
            'member' => [
                'name' => $member->name,
                'photo' => $member->photo,
                'membership_type' => $member->membershipType->name ?? null,
            ],
            'time' => now()->format('H:i:s'),
        ]);
    }
}
