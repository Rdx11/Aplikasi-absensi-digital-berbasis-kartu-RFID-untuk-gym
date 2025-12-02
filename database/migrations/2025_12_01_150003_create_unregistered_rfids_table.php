<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('unregistered_rfids', function (Blueprint $table) {
            $table->id();
            $table->string('rfid_uid');
            $table->timestamp('scan_time');
            $table->boolean('is_registered')->default(false);
            $table->timestamp('registered_at')->nullable();
            $table->timestamps();

            $table->index('rfid_uid');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('unregistered_rfids');
    }
};
