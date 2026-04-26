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
        Schema::create('category_course', function (Blueprint $table) {
            //when a course is deleted, its category assignments should also be deleted
            $table->foreignId('course_id')->constrained()->onDelete('cascade');
            //category cannot be deleted as long as it is still assigned to courses
            $table->foreignId('category_id')->constrained()->onDelete('restrict');

            $table->primary(['course_id', 'category_id']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('category_course');
    }
};
