<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('donors', function (Blueprint $table) {
            $table->date('date_of_birth')->nullable()->after('phone');
            $table->enum('blood_group', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
                ->nullable()->change();
            $table->enum('gender', ['Male', 'Female', 'Other'])->nullable()->change();
            $table->string('city')->nullable()->change();
            $table->unsignedTinyInteger('age')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('donors', function (Blueprint $table) {
            $table->dropColumn('date_of_birth');
            $table->enum('blood_group', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
                ->nullable(false)->change();
            $table->enum('gender', ['Male', 'Female', 'Other'])->nullable(false)->change();
            $table->string('city')->nullable(false)->change();
            $table->unsignedTinyInteger('age')->nullable(false)->change();
        });
    }
};