<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MemberRegistration extends Model
{
    protected $fillable = [
        'member_id',
        'membership_type_id',
        'member_name',
        'price',
        'membership_start_date',
        'membership_end_date',
        'notes',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'membership_start_date' => 'date',
        'membership_end_date' => 'date',
    ];

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class, 'member_id', 'id');
    }

    public function membershipType(): BelongsTo
    {
        return $this->belongsTo(MembershipType::class, 'membership_type_id', 'id');
    }
}
