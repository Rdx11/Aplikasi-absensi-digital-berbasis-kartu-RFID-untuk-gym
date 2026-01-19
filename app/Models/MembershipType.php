<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class MembershipType extends Model
{
    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'id';
    }

    protected $fillable = [
        'name',
        'duration_type',
        'duration_days',
        'price',
        'renewal_price',
        'description',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'renewal_price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function members(): HasMany
    {
        return $this->hasMany(Member::class, 'membership_type_id', 'id');
    }

    public function renewals(): HasMany
    {
        return $this->hasMany(MemberRenewal::class, 'membership_type_id', 'id');
    }
}
