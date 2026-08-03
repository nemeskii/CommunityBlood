<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BloodRequestMatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'blood_request_id',
        'donor_id',
        'status',
        'confirm_token',
        'expires_at',
        'notified_at',
        'notify_failed',
        'responded_at',
        'responded_via',
        'acknowledged_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'notified_at' => 'datetime',
        'responded_at' => 'datetime',
        'acknowledged_at' => 'datetime',
        'notify_failed' => 'boolean',
    ];

    const RESPONDABLE = ['proposed', 'notified'];

    public function bloodRequest()
    {
        return $this->belongsTo(BloodRequest::class);
    }

    public function donor()
    {
        return $this->belongsTo(Donor::class);
    }

    public function isRespondable(): bool
    {
        if (! in_array($this->status, self::RESPONDABLE, true)) {
            return false;
        }

        return ! $this->expires_at || $this->expires_at->isFuture();
    }
}
