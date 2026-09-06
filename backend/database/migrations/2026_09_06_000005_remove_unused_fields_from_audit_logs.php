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
        Schema::table('audit_logs', function (Blueprint $table) {
            // Remove url field (never populated in code)
            if (Schema::hasColumn('audit_logs', 'url')) {
                $table->dropColumn('url');
            }
            
            // Remove method field (never populated in code)
            if (Schema::hasColumn('audit_logs', 'method')) {
                $table->dropColumn('method');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            // Re-add removed columns
            $table->string('url')->nullable()->after('action');
            $table->string('method')->nullable()->after('url');
        });
    }
};
