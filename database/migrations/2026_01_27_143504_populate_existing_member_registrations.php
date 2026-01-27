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
        // Populate member_registrations from existing members
        DB::statement('
            INSERT INTO member_registrations (member_id, membership_type_id, member_name, price, membership_start_date, membership_end_date, created_at, updated_at)
            SELECT 
                m.id,
                m.membership_type_id,
                m.name,
                COALESCE(mt.price, 0),
                m.membership_start_date,
                m.membership_end_date,
                m.created_at,
                m.created_at
            FROM members m
            LEFT JOIN membership_types mt ON m.membership_type_id = mt.id
            WHERE NOT EXISTS (
                SELECT 1 FROM member_registrations mr WHERE mr.member_id = m.id
            )
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Optionally, you can delete the populated data
        // DB::statement('DELETE FROM member_registrations WHERE created_at < NOW()');
    }
};
