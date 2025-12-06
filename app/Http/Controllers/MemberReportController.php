<?php

namespace App\Http\Controllers;

use App\Exports\MemberReportExport;
use App\Models\Member;
use App\Models\MembershipType;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class MemberReportController extends Controller
{
    public function index(Request $request)
    {
        $dateFrom = $request->date_from ?? today()->startOfMonth()->format('Y-m-d');
        $dateTo = $request->date_to ?? today()->format('Y-m-d');
        $type = $request->type ?? 'all';

        // Total members
        $totalMembers = Member::count();
        $activeMembers = Member::where('status', 'active')->count();
        $expiredMembers = Member::where('status', 'expired')->count();
        $inactiveMembers = Member::where('status', 'inactive')->count();

        // Members registered in date range
        $newMembers = Member::whereBetween('created_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'])->count();

        // Members expiring soon (within 7 days)
        $expiringSoon = Member::where('status', 'active')
            ->whereBetween('membership_end_date', [today(), today()->addDays(7)])
            ->count();

        // Members by membership type
        $membersByType = MembershipType::withCount(['members', 'members as active_members_count' => function ($q) {
            $q->where('status', 'active');
        }])->get()->map(function ($type) {
            return [
                'id' => $type->id,
                'name' => $type->name,
                'price' => $type->price,
                'total_members' => $type->members_count,
                'active_members' => $type->active_members_count,
            ];
        });

        // Members by gender
        $membersByGender = [
            'male' => Member::where('gender', 'male')->count(),
            'female' => Member::where('gender', 'female')->count(),
        ];

        // Members list based on filter type
        $membersQuery = Member::with('membershipType');

        if ($type === 'new') {
            $membersQuery->whereBetween('created_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'])
                ->orderBy('created_at', 'desc');
        } elseif ($type === 'expiring') {
            $membersQuery->where('status', 'active')
                ->whereBetween('membership_end_date', [today(), today()->addDays(30)])
                ->orderBy('membership_end_date');
        } elseif ($type === 'active') {
            $membersQuery->where('status', 'active')->orderBy('name');
        } elseif ($type === 'expired') {
            $membersQuery->where('status', 'expired')->orderBy('membership_end_date', 'desc');
        } else {
            $membersQuery->orderBy('name');
        }

        $membersList = $membersQuery->get();

        return Inertia::render('Reports/Members', [
            'stats' => [
                'totalMembers' => $totalMembers,
                'activeMembers' => $activeMembers,
                'expiredMembers' => $expiredMembers,
                'inactiveMembers' => $inactiveMembers,
                'newMembers' => $newMembers,
                'expiringSoon' => $expiringSoon,
            ],
            'membersByType' => $membersByType,
            'membersByGender' => $membersByGender,
            'membersList' => $membersList,
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
                'type' => $type,
            ],
        ]);
    }

    public function export(Request $request)
    {
        $dateFrom = $request->date_from ?? today()->startOfMonth()->format('Y-m-d');
        $dateTo = $request->date_to ?? today()->format('Y-m-d');
        $type = $request->type ?? 'all';

        $filename = 'laporan-member-' . $type . '-' . $dateFrom . '-' . $dateTo . '.xlsx';

        return Excel::download(new MemberReportExport($dateFrom, $dateTo, $type), $filename);
    }
}
