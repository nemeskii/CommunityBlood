<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class Donor extends Authenticatable
{
    use HasFactory, HasApiTokens;

    protected $fillable = [
    'full_name',
    'email',
    'password',
    'phone',
    'date_of_birth',
    'government_id_number',
    'government_id_image',
    'blood_group',
    'age',
    'gender',
    'city',
    'address',
    'last_donation_date',
    'available',
];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'available' => 'boolean',
        'last_donation_date' => 'date',
        'password' => 'hashed',
    ];

    public function donations()
    {
        return $this->hasMany(Donation::class);
    }
}