<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BloodRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'requester_name',
        'requester_phone',
        'requester_email',
        'blood_group',
        'city',
        'reason',
        'status',
    ];
}