<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Hospital extends Authenticatable
{
    use HasFactory, HasApiTokens;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'city',
        'address',
        'approved',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'approved' => 'boolean',
        'password' => 'hashed',
    ];

    public function donations()
    {
        return $this->hasMany(Donation::class);
    }

    public function bloodRequests()
    {
        return $this->hasMany(BloodRequest::class);
    }
}
