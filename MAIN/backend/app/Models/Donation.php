<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Donation extends Model
{
    use HasFactory;

    protected $fillable = [
        'donor_id',
        'blood_request_id',
        'blood_group',
        'units',
        'donation_date',
        'location',
        'status',
    ];

    protected $casts = [
        'donation_date' => 'date',
    ];

    public function donor()
    {
        return $this->belongsTo(Donor::class);
    }

    public function bloodRequest()
    {
        return $this->belongsTo(BloodRequest::class);
    }
}