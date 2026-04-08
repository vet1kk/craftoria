<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('catalog_translations', static function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('translatable_type', 120);
            $table->uuid('translatable_id');
            $table->string('locale', 5);
            $table->string('field', 64);
            $table->text('value');
            $table->timestamps();

            $table->unique(['translatable_type', 'translatable_id', 'locale', 'field'], 'catalog_translations_unique');
            $table->index(['translatable_type', 'translatable_id', 'locale'], 'catalog_translations_lookup');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('catalog_translations');
    }
};
