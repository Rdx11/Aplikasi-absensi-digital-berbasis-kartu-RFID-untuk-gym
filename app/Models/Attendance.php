<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends Model
{
    protected $fillable = [
        'member_id',
        'rfid_uid',
        'is_member',
        'guest_name',
        'daily_package_id',
        'check_in_time',
        'check_out_time',
        'date',
    ];

    protected $casts = [
        'check_in_time' => 'datetime',
        'check_out_time' => 'datetime',
        'date' => 'date',
        'is_member' => 'boolean',
    ];

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class, 'member_id', 'id');
    }

    public function dailyPackage(): BelongsTo
    {
        return $this->belongsTo(DailyPackage::class, 'daily_package_id', 'id');
    }
}
