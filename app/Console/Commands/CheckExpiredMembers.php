<?php

namespace App\Console\Commands;

use App\Models\Member;
use Illuminate\Console\Command;

class CheckExpiredMembers extends Command
{
    protected $signature = 'members:check-expired';
    protected $description = 'Update status member yang sudah expired';

    public function handle()
    {
        $count = Member::where('status', 'active')
            ->where('membership_end_date', '<', today())
            ->update(['status' => 'expired']);

        $this->info("Updated {$count} members to expired status.");

        return Command::SUCCESS;
    }
}
