<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UnregisteredRfid extends Model
{
    protected $fillable = [
        'rfid_uid',
        'scan_time',
        'is_registered',
        'registered_at',
    ];

    protected $casts = [
        'scan_time' => 'datetime',
        'is_registered' => 'boolean',
        'registered_at' => 'datetime',
    ];
}
