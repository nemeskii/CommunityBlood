<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

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
        'active_match_id',
        'donor_id',
        'reference_code',
        'hospital_id',
        'hospital_confirmed_at',
    ];

    protected $casts = [
        'hospital_confirmed_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (BloodRequest $bloodRequest) {
            if (! $bloodRequest->reference_code) {
                $bloodRequest->reference_code = static::generateReferenceCode();
            }
        });
    }

    public static function generateReferenceCode(): string
    {
        do {
            $code = 'RQ-' . strtoupper(Str::random(6));
        } while (static::where('reference_code', $code)->exists());

        return $code;
    }

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

    public function hospital()
    {
        return $this->belongsTo(Hospital::class);
    }

    public function matches()
    {
        return $this->hasMany(BloodRequestMatch::class);
    }

    public function activeMatch()
    {
        return $this->belongsTo(BloodRequestMatch::class, 'active_match_id');
    }
}