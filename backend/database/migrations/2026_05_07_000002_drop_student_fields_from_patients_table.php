<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            if (Schema::hasColumn('patients', 'student_number')) {
                $table->dropColumn('student_number');
            }
            if (Schema::hasColumn('patients', 'program')) {
                $table->dropColumn('program');
            }
            if (Schema::hasColumn('patients', 'program_end_year')) {
                $table->dropColumn('program_end_year');
            }
        });
    }

    public function down(): void
    {
        Schema::table('patients', function (Blueprint $table) {
            if (!Schema::hasColumn('patients', 'student_number')) {
                $table->string('student_number')->nullable()->unique();
            }
            if (!Schema::hasColumn('patients', 'program')) {
                $table->string('program')->nullable();
            }
            if (!Schema::hasColumn('patients', 'program_end_year')) {
                $table->integer('program_end_year')->nullable();
            }
        });
    }
};
