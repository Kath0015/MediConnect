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
        Schema::table('users', function (Blueprint $table) {
            // Remove unused tracking fields
            if (Schema::hasColumn('users', 'last_login_at')) {
                $table->dropColumn('last_login_at');
            }
            if (Schema::hasColumn('users', 'last_login_ip')) {
                $table->dropColumn('last_login_ip');
            }
            
            // Remove redundant fields (data stored in patients table instead)
            if (Schema::hasColumn('users', 'address')) {
                $table->dropColumn('address');
            }
            if (Schema::hasColumn('users', 'emergency_contact')) {
                $table->dropColumn('emergency_contact');
            }
            if (Schema::hasColumn('users', 'date_of_birth')) {
                $table->dropColumn('date_of_birth');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Re-add removed columns
            $table->timestamp('last_login_at')->nullable()->after('profile_photo_path');
            $table->string('last_login_ip')->nullable()->after('last_login_at');
            $table->text('address')->nullable()->after('date_of_birth');
            $table->json('emergency_contact')->nullable()->after('address');
            $table->date('date_of_birth')->nullable()->after('phone');
        });
    }
};
