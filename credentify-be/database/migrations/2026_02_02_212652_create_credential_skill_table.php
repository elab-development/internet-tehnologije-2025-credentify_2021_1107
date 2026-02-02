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
        Schema::create('credential_skill', function (Blueprint $table) {
            $table->id();
             $table->foreignId('credential_id')
                ->constrained('credentials')
                ->cascadeOnDelete();

            $table->foreignId('skill_id')
                ->constrained('skills')
                ->cascadeOnDelete();

            $table->timestamps();

            $table->unique(['credential_id', 'skill_id']);
            $table->index(['credential_id']);
            $table->index(['skill_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('credential_skill');
    }
};
