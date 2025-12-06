<?php

namespace App\Exports;

use App\Models\Member;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class MemberReportExport implements FromCollection, WithHeadings, WithMapping, WithStyles, WithTitle
{
    protected $dateFrom;
    protected $dateTo;
    protected $type;

    public function __construct($dateFrom, $dateTo, $type = 'all')
    {
        $this->dateFrom = $dateFrom;
        $this->dateTo = $dateTo;
        $this->type = $type;
    }

    public function collection()
    {
        $query = Member::with('membershipType');

        if ($this->type === 'new') {
            $query->whereBetween('created_at', [$this->dateFrom . ' 00:00:00', $this->dateTo . ' 23:59:59']);
        } elseif ($this->type === 'expiring') {
            $query->where('status', 'active')
                ->whereBetween('membership_end_date', [today(), today()->addDays(30)]);
        } elseif ($this->type === 'active') {
            $query->where('status', 'active');
        } elseif ($this->type === 'expired') {
            $query->where('status', 'expired');
        }

        return $query->orderBy('name')->get();
    }

    public function headings(): array
    {
        return [
            'No',
            'Nama',
            'No. HP',
            'Gender',
            'Tipe Membership',
            'Harga',
            'Status',
            'Tgl Daftar',
            'Berlaku Sampai',
            'RFID UID',
        ];
    }

    public function map($member): array
    {
        static $no = 0;
        $no++;

        return [
            $no,
            $member->name,
            $member->phone,
            $member->gender === 'male' ? 'Laki-laki' : 'Perempuan',
            $member->membershipType->name ?? '-',
            $member->membershipType->price ?? 0,
            ucfirst($member->status),
            $member->created_at->format('d/m/Y'),
            $member->membership_end_date ? $member->membership_end_date->format('d/m/Y') : '-',
            $member->rfid_uid ?? '-',
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
        $titles = [
            'all' => 'Semua Member',
            'new' => 'Member Baru',
            'expiring' => 'Segera Expired',
            'active' => 'Member Aktif',
            'expired' => 'Member Expired',
        ];

        return $titles[$this->type] ?? 'Member';
    }
}
