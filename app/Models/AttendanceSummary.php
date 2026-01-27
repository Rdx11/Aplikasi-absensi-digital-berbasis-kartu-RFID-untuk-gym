<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AttendanceSummary extends Model
{
    protected $fillable = [
        'member_id',
        'year',
        'month',
        'total_days',
        'total_hours',
        'first_attendance',
        'last_attendance',
    ];

    protected $casts = [
        'first_attendance' => 'date',
        'last_attendance' => 'date',
    ];

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }
}
