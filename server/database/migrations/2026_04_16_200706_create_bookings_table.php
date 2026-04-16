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
        Schema::create('bookings', function (Blueprint $table) {
            $table->id(); //primary key
            //cannot delete user as long as he has bookings
            $table->foreignId('user_id')->constrained()->onDelete('restrict');
            //cannot delete appointment as long as there are bookings
            $table->foreignId('appointment_id')->constrained()->onDelete('restrict');
            $table->string('status')->default('booked');
            //user cannot book the same appointment twice
            $table->unique(['user_id', 'appointment_id']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
