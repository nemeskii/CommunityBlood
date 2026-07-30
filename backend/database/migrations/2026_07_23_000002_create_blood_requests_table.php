<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('blood_requests', function (Blueprint $table) {
            $table->id();
            $table->string('requester_name');
            $table->string('requester_phone');
            $table->string('requester_email')->nullable();
            $table->string('blood_group');
            $table->string('city')->nullable();
            $table->text('reason')->nullable();
            $table->enum('status', ['pending', 'contacted', 'closed'])->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blood_requests');
    }
};