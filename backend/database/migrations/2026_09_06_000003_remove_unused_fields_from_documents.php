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
        Schema::table('documents', function (Blueprint $table) {
            // Remove unused versioning field
            if (Schema::hasColumn('documents', 'version')) {
                $table->dropColumn('version');
            }
            
            // Remove unused encryption flag (no encryption implemented)
            if (Schema::hasColumn('documents', 'is_encrypted')) {
                $table->dropColumn('is_encrypted');
            }
            
            // Remove unused public flag (no access control based on this)
            if (Schema::hasColumn('documents', 'is_public')) {
                $table->dropColumn('is_public');
            }
            
            // Remove unused access tracking (recordAccess() method never called)
            if (Schema::hasColumn('documents', 'last_accessed_at')) {
                $table->dropColumn('last_accessed_at');
            }
            
            // Remove tags field (frontend never populates, not used in search)
            if (Schema::hasColumn('documents', 'tags')) {
                $table->dropColumn('tags');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('documents', function (Blueprint $table) {
            // Re-add removed columns
            $table->integer('version')->default(1)->after('path');
            $table->json('tags')->nullable()->after('version');
            $table->boolean('is_encrypted')->default(false)->after('checksum');
            $table->boolean('is_public')->default(false)->after('is_encrypted');
            $table->timestamp('last_accessed_at')->nullable()->after('is_public');
        });
    }
};
