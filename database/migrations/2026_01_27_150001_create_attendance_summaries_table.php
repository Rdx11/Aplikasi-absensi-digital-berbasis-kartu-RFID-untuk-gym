<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tabel untuk data summary (>5 tahun)
        Schema::create('attendance_summaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained('members')->onDelete('cascade');
            $table->year('year');
            $table->tinyInteger('month'); // 1-12
            $table->integer('total_days')->default(0);
            $table->integer('total_hours')->default(0);
            $table->date('first_attendance')->nullable();
            $table->date('last_attendance')->nullable();
            $table->timestamps();

            $table->unique(['member_id', 'year', 'month']);
            $table->index(['year', 'month']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_summaries');
    }
};
