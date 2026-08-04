<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('donors', function (Blueprint $table) {
            $table->date('date_of_birth')->nullable()->after('phone');
        });

        if (Schema::getConnection()->getDriverName() === 'pgsql') {
            // Postgres: enum columns are varchar + CHECK constraint under the hood.
            // Laravel's ->enum()->change() tries to alter type and constraint in
            // one statement, which isn't valid Postgres syntax. We only need to
            // drop NOT NULL here — the allowed values already exist from the
            // original CREATE TABLE, so there's nothing else to change.
            DB::statement('ALTER TABLE donors ALTER COLUMN blood_group DROP NOT NULL');
            DB::statement('ALTER TABLE donors ALTER COLUMN gender DROP NOT NULL');
            DB::statement('ALTER TABLE donors ALTER COLUMN city DROP NOT NULL');
            DB::statement('ALTER TABLE donors ALTER COLUMN age DROP NOT NULL');
        } else {
            Schema::table('donors', function (Blueprint $table) {
                $table->enum('blood_group', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
                    ->nullable()->change();
                $table->enum('gender', ['Male', 'Female', 'Other'])->nullable()->change();
                $table->string('city')->nullable()->change();
                $table->unsignedTinyInteger('age')->nullable()->change();
            });
        }
    }

    public function down(): void
    {
        Schema::table('donors', function (Blueprint $table) {
            $table->dropColumn('date_of_birth');
        });

        if (Schema::getConnection()->getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE donors ALTER COLUMN blood_group SET NOT NULL');
            DB::statement('ALTER TABLE donors ALTER COLUMN gender SET NOT NULL');
            DB::statement('ALTER TABLE donors ALTER COLUMN city SET NOT NULL');
            DB::statement('ALTER TABLE donors ALTER COLUMN age SET NOT NULL');
        } else {
            Schema::table('donors', function (Blueprint $table) {
                $table->enum('blood_group', ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
                    ->nullable(false)->change();
                $table->enum('gender', ['Male', 'Female', 'Other'])->nullable(false)->change();
                $table->string('city')->nullable(false)->change();
                $table->unsignedTinyInteger('age')->nullable(false)->change();
            });
        }
    }
};