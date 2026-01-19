<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DailyPackage extends Model
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
        'description',
        'price',
        'is_active',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'is_active' => 'boolean',
    ];

    public function attendances(): HasMany
    {
        return $this->hasMany(Attendance::class, 'daily_package_id', 'id');
    }
}
