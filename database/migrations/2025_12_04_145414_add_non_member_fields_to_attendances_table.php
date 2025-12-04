<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->boolean('is_member')->default(true)->after('rfid_uid');
            $table->string('guest_name')->nullable()->after('is_member');
            $table->foreignId('daily_package_id')->nullable()->after('guest_name')->constrained()->nullOnDelete();
        });

        // Update member_id to be nullable for non-members
        Schema::table('attendances', function (Blueprint $table) {
            $table->foreignId('member_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropForeign(['daily_package_id']);
            $table->dropColumn(['is_member', 'guest_name', 'daily_package_id']);
        });
    }
};
