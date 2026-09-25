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
        Schema::table('clinic_settings', function (Blueprint $table) {
            if (!Schema::hasColumn('clinic_settings', 'dss_google_sheet_url')) {
                $table->text('dss_google_sheet_url')->nullable()->after('contact_phone');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('clinic_settings', function (Blueprint $table) {
            if (Schema::hasColumn('clinic_settings', 'dss_google_sheet_url')) {
                $table->dropColumn('dss_google_sheet_url');
            }
        });
    }
};
