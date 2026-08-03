<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('blood_requests', function (Blueprint $table) {
            $table->foreignId('active_match_id')
                ->nullable()
                ->after('matched_donor_id')
                ->constrained('blood_request_matches')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('blood_requests', function (Blueprint $table) {
            $table->dropConstrainedForeignId('active_match_id');
        });
    }
};
