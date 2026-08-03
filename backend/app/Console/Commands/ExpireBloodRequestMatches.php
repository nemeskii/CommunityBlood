<?php

namespace App\Console\Commands;

use App\Models\BloodRequestMatch;
use Illuminate\Console\Command;

class ExpireBloodRequestMatches extends Command
{
    protected $signature = 'blood-requests:expire-matches';

    protected $description = 'Mark proposed/notified donor matches as expired once past their expires_at, so admins get a signal to try another donor instead of a match sitting silently forever.';

    public function handle(): int
    {
        $count = BloodRequestMatch::whereIn('status', BloodRequestMatch::RESPONDABLE)
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', now())
            ->update(['status' => 'expired']);

        $this->info("Expired {$count} stale match(es).");

        return self::SUCCESS;
    }
}
