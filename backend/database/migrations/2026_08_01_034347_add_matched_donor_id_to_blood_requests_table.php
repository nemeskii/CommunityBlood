<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('blood_requests', function (Blueprint $table) {
            $table->foreignId('matched_donor_id')
                ->nullable()
                ->after('reason')
                ->constrained('donors')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('blood_requests', function (Blueprint $table) {
            $table->dropConstrainedForeignId('matched_donor_id');
        });
    }
};
