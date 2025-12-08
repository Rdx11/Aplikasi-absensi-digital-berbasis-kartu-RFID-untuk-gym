<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MemberRenewal extends Model
{
    protected $fillable = [
        'member_id',
        'membership_type_id',
        'old_end_date',
        'new_start_date',
        'new_end_date',
        'price',
        'notes',
    ];

    protected $casts = [
        'old_end_date' => 'date',
        'new_start_date' => 'date',
        'new_end_date' => 'date',
        'price' => 'decimal:2',
    ];

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function membershipType(): BelongsTo
    {
        return $this->belongsTo(MembershipType::class);
    }
}
