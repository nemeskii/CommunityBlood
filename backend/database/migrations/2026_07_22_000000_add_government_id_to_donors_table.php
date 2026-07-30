<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('donors', function (Blueprint $table) {
            $table->string('government_id_number', 20)->nullable()->after('date_of_birth');
            $table->string('government_id_image')->nullable()->after('government_id_number');
        });
    }

    public function down(): void
    {
        Schema::table('donors', function (Blueprint $table) {
            $table->dropColumn(['government_id_number', 'government_id_image']);
        });
    }
};