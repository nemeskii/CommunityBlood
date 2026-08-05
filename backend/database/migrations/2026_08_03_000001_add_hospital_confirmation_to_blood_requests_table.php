<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('blood_requests', function (Blueprint $table) {
            $table->string('reference_code', 20)->nullable()->unique()->after('id');

            $table->foreignId('hospital_id')
                ->nullable()
                ->after('outcome')
                ->constrained('hospitals')
                ->nullOnDelete();
            $table->timestamp('hospital_confirmed_at')->nullable()->after('hospital_id');
        });
    }

    public function down(): void
    {
        Schema::table('blood_requests', function (Blueprint $table) {
            $table->dropColumn('hospital_confirmed_at');
            $table->dropConstrainedForeignId('hospital_id');
            $table->dropColumn('reference_code');
        });
    }
};
