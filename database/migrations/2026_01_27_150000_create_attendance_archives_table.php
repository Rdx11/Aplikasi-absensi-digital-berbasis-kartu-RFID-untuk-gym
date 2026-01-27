<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tabel untuk data archive (2-5 tahun)
        Schema::create('attendance_archives', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained('members')->onDelete('cascade');
            $table->string('rfid_uid');
            $table->timestamp('check_in_time');
            $table->timestamp('check_out_time')->nullable();
            $table->date('date');
            $table->timestamps();

            $table->index('rfid_uid');
            $table->index('date');
            $table->index('member_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_archives');
    }
};
