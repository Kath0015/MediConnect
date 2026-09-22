<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('lab_requests', function (Blueprint $table) {
            $table->id();
            $table->string('request_number')->unique();
            $table->foreignId('patient_id')->nullable()->constrained('patients')->nullOnDelete();
            $table->string('patient_name');
            $table->string('test_name');
            $table->string('category')->default('General'); // Hematology, Urinalysis, Blood Chemistry, etc.
            $table->string('requested_by');
            $table->string('status')->default('Pending'); // Pending, Processing, Completed, Cancelled
            $table->text('results')->nullable();
            $table->string('attachment_path')->nullable();
            $table->date('date_requested');
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('lab_requests');
    }
};
