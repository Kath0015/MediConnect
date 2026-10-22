<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('med_certs', function (Blueprint $table) {
            $table->string('delivery_method')->default('pickup')->after('pickup_date');
        });
    }

    public function down(): void
    {
        Schema::table('med_certs', function (Blueprint $table) {
            $table->dropColumn('delivery_method');
        });
    }
};
