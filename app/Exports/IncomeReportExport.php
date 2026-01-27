<?php

namespace App\Exports;

use App\Models\Attendance;
use App\Models\Member;
use App\Models\MemberRenewal;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Illuminate\Support\Collection;

class IncomeReportExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithTitle
{
    protected $dateFrom;
    protected $dateTo;

    public function __construct($dateFrom, $dateTo)
    {
        $this->dateFrom = $dateFrom;
        $this->dateTo = $dateTo;
    }

    public function collection()
    {
        $data = new Collection();

        // Get membership income (new members from registrations)
        $membershipIncome = \App\Models\MemberRegistration::with('membershipType')
            ->whereBetween('created_at', [$this->dateFrom . ' 00:00:00', $this->dateTo . ' 23:59:59'])
            ->get()
            ->map(function ($registration) {
                return [
                    'date' => $registration->created_at->format('Y-m-d'),
                    'type' => 'Membership',
                    'description' => 'Member Baru: ' . $registration->member_name,
                    'package' => $registration->membershipType->name ?? '-',
                    'amount' => $registration->price ?? 0,
                ];
            });

        // Get renewal income
        $renewalIncome = MemberRenewal::with('membershipType')
            ->whereBetween('created_at', [$this->dateFrom . ' 00:00:00', $this->dateTo . ' 23:59:59'])
            ->get()
            ->map(function ($renewal) {
                return [
                    'date' => $renewal->created_at->format('Y-m-d'),
                    'type' => 'Perpanjangan',
                    'description' => 'Perpanjang: ' . ($renewal->member_name ?? '-'),
                    'package' => $renewal->membershipType->name ?? '-',
                    'amount' => $renewal->price ?? 0,
                ];
            });

        // Get daily package income
        $dailyPackageIncome = Attendance::with('dailyPackage')
            ->where('is_member', false)
            ->whereNotNull('daily_package_id')
            ->whereBetween('date', [$this->dateFrom, $this->dateTo])
            ->get()
            ->map(function ($attendance) {
                return [
                    'date' => $attendance->date->format('Y-m-d'),
                    'type' => 'Paket Harian',
                    'description' => 'Kunjungan: ' . $attendance->guest_name,
                    'package' => $attendance->dailyPackage->name ?? '-',
                    'amount' => $attendance->dailyPackage->price ?? 0,
                ];
            });

        // Merge and sort by date
        return $membershipIncome->concat($renewalIncome)->concat($dailyPackageIncome)->sortBy('date')->values();
    }

    public function headings(): array
    {
        return [
            'No',
            'Tanggal',
            'Tipe',
            'Keterangan',
            'Paket/Membership',
            'Jumlah (Rp)',
        ];
    }

    public function map($row): array
    {
        static $no = 0;
        $no++;

        return [
            $no,
            date('d/m/Y', strtotime($row['date'])),
            $row['type'],
            $row['description'],
            $row['package'],
            $row['amount'],
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }

    public function title(): string
    {
        return 'Rekap Pendapatan';
    }
}
