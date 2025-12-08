<?php

namespace App\Http\Controllers;

use App\Exports\IncomeReportExport;
use App\Models\Attendance;
use App\Models\DailyPackage;
use App\Models\Member;
use App\Models\MemberRenewal;
use App\Models\MembershipType;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class IncomeReportController extends Controller
{
    public function index(Request $request)
    {
        $dateFrom = $request->date_from ?? today()->startOfMonth()->format('Y-m-d');
        $dateTo = $request->date_to ?? today()->format('Y-m-d');

        // Income from new memberships (members registered in date range)
        $membershipIncome = Member::with('membershipType')
            ->whereBetween('created_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'])
            ->get();

        $totalMembershipIncome = $membershipIncome->sum(function ($member) {
            return $member->membershipType?->price ?? 0;
        });

        // Income from renewals
        $renewalIncome = MemberRenewal::whereBetween('created_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'])
            ->sum('price');

        $totalMembershipIncome += $renewalIncome;

        // Income by membership type
        $incomeByMembershipType = MembershipType::select('membership_types.*')
            ->selectRaw('COUNT(members.id) as new_members_count')
            ->selectRaw('COALESCE(SUM(membership_types.price), 0) as total_income')
            ->leftJoin('members', function ($join) use ($dateFrom, $dateTo) {
                $join->on('membership_types.id', '=', 'members.membership_type_id')
                    ->whereBetween('members.created_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59']);
            })
            ->groupBy('membership_types.id')
            ->get()
            ->map(function ($type) {
                return [
                    'id' => $type->id,
                    'name' => $type->name,
                    'price' => $type->price,
                    'new_members' => $type->new_members_count,
                    'total_income' => $type->new_members_count * $type->price,
                ];
            });

        // Income from daily packages (non-member attendance)
        $dailyPackageIncome = Attendance::with('dailyPackage')
            ->where('is_member', false)
            ->whereNotNull('daily_package_id')
            ->whereBetween('date', [$dateFrom, $dateTo])
            ->get();

        $totalDailyPackageIncome = $dailyPackageIncome->sum(function ($attendance) {
            return $attendance->dailyPackage?->price ?? 0;
        });

        // Income by daily package
        $incomeByDailyPackage = DailyPackage::select('daily_packages.*')
            ->selectRaw('COUNT(attendances.id) as usage_count')
            ->selectRaw('COALESCE(COUNT(attendances.id) * daily_packages.price, 0) as total_income')
            ->leftJoin('attendances', function ($join) use ($dateFrom, $dateTo) {
                $join->on('daily_packages.id', '=', 'attendances.daily_package_id')
                    ->where('attendances.is_member', false)
                    ->whereBetween('attendances.date', [$dateFrom, $dateTo]);
            })
            ->groupBy('daily_packages.id')
            ->get()
            ->map(function ($package) {
                return [
                    'id' => $package->id,
                    'name' => $package->name,
                    'price' => $package->price,
                    'usage_count' => $package->usage_count,
                    'total_income' => $package->usage_count * $package->price,
                ];
            });

        // Daily income breakdown
        $dailyIncome = collect();
        $currentDate = now()->parse($dateFrom);
        $endDate = now()->parse($dateTo);

        while ($currentDate <= $endDate) {
            $date = $currentDate->format('Y-m-d');
            
            // Membership income for this day (new members + renewals)
            $dayMembershipIncome = Member::with('membershipType')
                ->whereDate('created_at', $date)
                ->get()
                ->sum(fn($m) => $m->membershipType?->price ?? 0);

            // Add renewal income for this day
            $dayMembershipIncome += MemberRenewal::whereDate('created_at', $date)->sum('price');

            // Daily package income for this day
            $dayPackageIncome = Attendance::with('dailyPackage')
                ->where('is_member', false)
                ->whereNotNull('daily_package_id')
                ->whereDate('date', $date)
                ->get()
                ->sum(fn($a) => $a->dailyPackage?->price ?? 0);

            $dailyIncome->push([
                'date' => $date,
                'membership_income' => $dayMembershipIncome,
                'daily_package_income' => $dayPackageIncome,
                'total' => $dayMembershipIncome + $dayPackageIncome,
            ]);

            $currentDate->addDay();
        }

        $totalIncome = $totalMembershipIncome + $totalDailyPackageIncome;

        // Count renewals
        $renewalsCount = MemberRenewal::whereBetween('created_at', [$dateFrom . ' 00:00:00', $dateTo . ' 23:59:59'])->count();

        return Inertia::render('Reports/Income', [
            'stats' => [
                'totalIncome' => $totalIncome,
                'membershipIncome' => $totalMembershipIncome,
                'dailyPackageIncome' => $totalDailyPackageIncome,
                'newMembersCount' => $membershipIncome->count(),
                'renewalsCount' => $renewalsCount,
                'dailyVisitsCount' => $dailyPackageIncome->count(),
            ],
            'incomeByMembershipType' => $incomeByMembershipType,
            'incomeByDailyPackage' => $incomeByDailyPackage,
            'dailyIncome' => $dailyIncome,
            'filters' => [
                'date_from' => $dateFrom,
                'date_to' => $dateTo,
            ],
        ]);
    }

    public function export(Request $request)
    {
        $dateFrom = $request->date_from ?? today()->startOfMonth()->format('Y-m-d');
        $dateTo = $request->date_to ?? today()->format('Y-m-d');

        $filename = 'rekap-pendapatan-' . $dateFrom . '-' . $dateTo . '.xlsx';

        return Excel::download(new IncomeReportExport($dateFrom, $dateTo), $filename);
    }
}
