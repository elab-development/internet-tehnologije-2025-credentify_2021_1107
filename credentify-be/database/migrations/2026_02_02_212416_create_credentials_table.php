<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('credentials', function (Blueprint $table) {
            $table->id();

            $table->foreignId('issuer_id')
                ->constrained('issuers')
                ->cascadeOnDelete();

            $table->string('name');
            $table->string('category')->nullable();
            $table->unsignedInteger('validity_months')->nullable();
            $table->boolean('is_active')->default(true);

            $table->timestamps();

            $table->index(['issuer_id']);
            $table->index(['is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('credentials');
    }
};
