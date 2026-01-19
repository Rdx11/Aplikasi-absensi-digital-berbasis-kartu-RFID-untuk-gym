<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Member extends Model
{
    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'id';
    }

    protected $fillable = [
        'rfid_uid',
        'name',
        'email',
        'phone',
        'birth_date',
        'gender',
        'address',
        'membership_type_id',
        'membership_start_date',
        'membership_end_date',
        'status',
        'photo',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'membership_start_date' => 'date',
        'membership_end_date' => 'date',
    ];

    public function membershipType(): BelongsTo
    {
        return $this->belongsTo(MembershipType::class, 'membership_type_id', 'id');
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class, 'member_id', 'id');
    }

    public function renewals(): HasMany
    {
        return $this->hasMany(MemberRenewal::class, 'member_id', 'id');
    }
}
