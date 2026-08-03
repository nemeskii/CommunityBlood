<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('blood_request_matches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('blood_request_id')->constrained('blood_requests')->cascadeOnDelete();
            $table->foreignId('donor_id')->constrained('donors')->cascadeOnDelete();

            // proposed: admin picked this donor, notification not confirmed sent yet
            // notified: notification (email/SMS) was sent successfully
            // confirmed: donor accepted, via in-app or magic link
            // declined: donor said no
            // expired: no response before expires_at
            // cancelled: superseded by a new match on the same request (admin re-matched)
            $table->enum('status', ['proposed', 'notified', 'confirmed', 'declined', 'expired', 'cancelled'])
                ->default('proposed');

            $table->string('confirm_token', 64)->unique();
            $table->timestamp('expires_at')->nullable();

            $table->timestamp('notified_at')->nullable();
            $table->boolean('notify_failed')->default(false);

            $table->timestamp('responded_at')->nullable();
            $table->enum('responded_via', ['in_app', 'link'])->nullable();

            // for the admin "live" badge — null until an admin has seen this outcome
            $table->timestamp('acknowledged_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('blood_request_matches');
    }
};
