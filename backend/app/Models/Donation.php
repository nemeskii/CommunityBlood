<?php

namespace App\Models;

use App\Services\DonationMailService;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

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
        'reference_code',
        'hospital_id',
        'verified_at',
    ];

    protected $casts = [
        'donation_date' => 'date',
        'verified_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (Donation $donation) {
            if (! $donation->reference_code) {
                $donation->reference_code = static::generateReferenceCode();
            }
        });

        static::created(function (Donation $donation) {
            if ($donation->status === 'completed') {
                app(DonationMailService::class)->sendCompletionEmail($donation);
            }
        });

        static::updated(function (Donation $donation) {
            if ($donation->wasChanged('status') && $donation->status === 'completed') {
                app(DonationMailService::class)->sendCompletionEmail($donation);
            }
        });
    }

    public static function generateReferenceCode(): string
    {
        do {
            $code = 'DN-' . strtoupper(Str::random(6));
        } while (static::where('reference_code', $code)->exists());

        return $code;
    }

    public function donor()
    {
        return $this->belongsTo(Donor::class);
    }

    public function bloodRequest()
    {
        return $this->belongsTo(BloodRequest::class);
    }

    public function hospital()
    {
        return $this->belongsTo(Hospital::class);
    }
}