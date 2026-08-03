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
        'outcome',
        'matched_donor_id',
        'donor_id',
    ];

    public function matchedDonor()
    {
        return $this->belongsTo(Donor::class, 'matched_donor_id');
    }

    public function requester()
    {
        return $this->belongsTo(Donor::class, 'donor_id');
    }

    public function donations()
    {
        return $this->hasMany(Donation::class);
    }
}