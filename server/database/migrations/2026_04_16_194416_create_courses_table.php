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
        Schema::create('courses', function (Blueprint $table) {
            $table->id(); //primary key
            //id-name differs, specify the referenced table explicitly (users)
            //trainer cannot be deleted as long as he has courses
            $table->foreignId('trainer_id')->constrained('users')->onDelete('restrict');
            //cannot delete difficulty as long as there are still courses that reference it
            $table->foreignId('difficulty_id')->constrained()->onDelete('restrict');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('location');
            $table->unsignedInteger('participant_limit'); //positive integer
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('courses');
    }
};
