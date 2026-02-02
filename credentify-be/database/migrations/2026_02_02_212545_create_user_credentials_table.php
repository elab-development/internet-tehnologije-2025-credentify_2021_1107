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
        Schema::create('user_credentials', function (Blueprint $table) {
             $table->id();

            $table->foreignId('user_id')
                ->constrained('users')
                ->cascadeOnDelete();

            $table->foreignId('credential_id')
                ->constrained('credentials')
                ->cascadeOnDelete();

            $table->enum('status', ['Pending', 'Approved', 'Rejected', 'Expired'])
                ->default('Pending');

            $table->date('applied_date')->nullable();
            $table->date('issued_date')->nullable();
            $table->date('expiry_date')->nullable();

            $table->string('image')->nullable();

            $table->timestamps();

            $table->index(['user_id']);
            $table->index(['credential_id']);

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_credentials');
    }
};
