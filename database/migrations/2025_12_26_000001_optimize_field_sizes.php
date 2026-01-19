<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // =============================================
        // 1. USERS TABLE
        // =============================================
        Schema::table('users', function (Blueprint $table) {
            $table->string('name', 100)->change();
            $table->string('email', 100)->change();
        });

        // =============================================
        // 2. MEMBERSHIP_TYPES TABLE
        // =============================================
        Schema::table('membership_types', function (Blueprint $table) {
            $table->string('name', 50)->change();
        });

        // =============================================
        // 3. MEMBERS TABLE
        // =============================================
        Schema::table('members', function (Blueprint $table) {
            $table->string('rfid_uid', 20)->change();
            $table->string('name', 100)->change();
            $table->string('email', 100)->nullable()->change();
            $table->string('phone', 15)->nullable()->change();
            $table->string('photo', 100)->nullable()->change();
        });

        // =============================================
        // 4. ATTENDANCES TABLE
        // =============================================
        Schema::table('attendances', function (Blueprint $table) {
            $table->string('rfid_uid', 20)->change();
            $table->string('guest_name', 100)->nullable()->change();
        });

        // =============================================
        // 5. UNREGISTERED_RFIDS TABLE
        // =============================================
        Schema::table('unregistered_rfids', function (Blueprint $table) {
            $table->string('rfid_uid', 20)->change();
        });

        // =============================================
        // 6. DAILY_PACKAGES TABLE
        // =============================================
        Schema::table('daily_packages', function (Blueprint $table) {
            $table->string('name', 50)->change();
        });
    }

    public function down(): void
    {
        // Revert field sizes
        Schema::table('daily_packages', function (Blueprint $table) {
            $table->string('name', 255)->change();
        });

        Schema::table('unregistered_rfids', function (Blueprint $table) {
            $table->string('rfid_uid', 255)->change();
        });

        Schema::table('attendances', function (Blueprint $table) {
            $table->string('rfid_uid', 255)->change();
            $table->string('guest_name', 255)->nullable()->change();
        });

        Schema::table('members', function (Blueprint $table) {
            $table->string('rfid_uid', 255)->change();
            $table->string('name', 255)->change();
            $table->string('email', 255)->nullable()->change();
            $table->string('phone', 255)->nullable()->change();
            $table->string('photo', 255)->nullable()->change();
        });

        Schema::table('membership_types', function (Blueprint $table) {
            $table->string('name', 255)->change();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('name', 255)->change();
            $table->string('email', 255)->change();
        });
    }
};
