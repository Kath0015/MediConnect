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
        Schema::table('med_certs', function (Blueprint $table) {
            // Remove QR code path (never generated)
            if (Schema::hasColumn('med_certs', 'qr_code_path')) {
                $table->dropColumn('qr_code_path');
            }
            
            // Remove verified_at timestamp (is_verified flag already exists, verified_at never set)
            if (Schema::hasColumn('med_certs', 'verified_at')) {
                $table->dropColumn('verified_at');
            }
            
            // Remove is_verified flag (status field controls this via 'approved' enum)
            if (Schema::hasColumn('med_certs', 'is_verified')) {
                $table->dropColumn('is_verified');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('med_certs', function (Blueprint $table) {
            // Re-add removed columns
            $table->string('qr_code_path')->nullable()->after('verification_hash');
            $table->boolean('is_verified')->default(false)->after('qr_code_path');
            $table->timestamp('verified_at')->nullable()->after('is_verified');
        });
    }
};
