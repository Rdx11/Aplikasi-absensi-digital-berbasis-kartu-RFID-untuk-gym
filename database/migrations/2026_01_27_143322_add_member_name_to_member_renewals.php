<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('member_renewals', function (Blueprint $table) {
            // Add member_name column to store member name
            $table->string('member_name')->after('member_id')->nullable();
        });
        
        // Update existing records to populate member_name
        DB::statement('UPDATE member_renewals mr 
                       INNER JOIN members m ON mr.member_id = m.id 
                       SET mr.member_name = m.name 
                       WHERE mr.member_name IS NULL');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('member_renewals', function (Blueprint $table) {
            $table->dropColumn('member_name');
        });
    }
};
