<?php

namespace App\Exports;

use App\Models\Attendance;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class AttendanceExport implements FromCollection, WithHeadings, WithMapping, WithStyles
{
    protected $dateFrom;
    protected $dateTo;
    protected $memberId;
    protected $status;

    public function __construct($dateFrom, $dateTo, $memberId = null, $status = 'all')
    {
        $this->dateFrom = $dateFrom;
        $this->dateTo = $dateTo;
        $this->memberId = $memberId;
        $this->status = $status;
    }

    public function collection()
    {
        $query = Attendance::with(['member', 'member.membershipType', 'dailyPackage'])
            ->whereBetween('date', [$this->dateFrom, $this->dateTo]);

        if ($this->memberId) {
            $query->where('member_id', $this->memberId);
        }

        if ($this->status && $this->status !== 'all') {
            $query->where('is_member', $this->status === 'member');
        }

        return $query->latest('date')->latest('check_in_time')->get();
    }

    public function headings(): array
    {
        return [
            'No',
            'Tanggal',
            'Nama',
            'Status',
            'Paket/Membership',
            'RFID UID',
            'Waktu Masuk',
        ];
    }

    public function map($attendance): array
    {
        static $no = 0;
        $no++;

        return [
            $no,
            $attendance->date->format('d/m/Y'),
            $attendance->is_member ? ($attendance->member->name ?? '-') : $attendance->guest_name,
            $attendance->is_member ? 'Member' : 'Non-Member',
            $attendance->is_member 
                ? ($attendance->member->membershipType->name ?? '-') 
                : ($attendance->dailyPackage->name ?? '-'),
            $attendance->rfid_uid,
            $attendance->check_in_time->format('H:i:s'),
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
