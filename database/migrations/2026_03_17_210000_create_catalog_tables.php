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
        Schema::create('categories', static function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('icon')->nullable();
            $table->string('image_url')->nullable();
            $table->unsignedSmallInteger('position')->default(0);
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('ingredients', static function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->enum('unit', ['g', 'ml']);
            $table->unsignedSmallInteger('calories')->default(0);
            $table->decimal('proteins')->default(0);
            $table->decimal('fats')->default(0);
            $table->decimal('carbs')->default(0);
            $table->boolean('is_active')->default(true)->index();
            $table->decimal('cost_amount', 10)->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('products', static function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('category_id')
                  ->constrained('categories')
                  ->cascadeOnUpdate()
                  ->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('sku')->nullable()->unique();
            $table->text('description');
            $table->decimal('price', 10);
            $table->string('featured_image_url')->nullable();
            $table->string('shelf_life')->nullable();
            $table->unsignedSmallInteger('position')->default(0);
            $table->unsignedInteger('stock_quantity')->default(0);
            $table->unsignedInteger('reorder_level')->default(0);
            $table->boolean('is_active')->default(true)->index();
            $table->boolean('is_available')->default(true)->index();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('product_metadata', static function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('product_id')
                  ->constrained('products')
                  ->cascadeOnUpdate()
                  ->cascadeOnDelete();
            // 'type' stores the kind of info (e.g., 'serving_details', 'storage_instructions')
            $table->string('type')->index();
            $table->text('value');
            $table->timestamps();

            $table->unique(['product_id', 'type']);
        });

        Schema::create('product_images', static function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('product_id')
                  ->constrained('products')
                  ->cascadeOnUpdate()
                  ->cascadeOnDelete();
            $table->string('image_url');
            $table->unsignedSmallInteger('position')->default(0);
            $table->timestamps();

            $table->unique(['product_id', 'image_url']);
        });

        Schema::create('product_ingredients', static function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('product_id')
                  ->constrained('products')
                  ->cascadeOnUpdate()
                  ->cascadeOnDelete();
            $table->foreignUuid('ingredient_id')
                  ->constrained('ingredients')
                  ->cascadeOnUpdate()
                  ->cascadeOnDelete();
            $table->decimal('quantity', 10);
            $table->unsignedSmallInteger('position')->default(0);
            $table->timestamps();

            $table->unique(['product_id', 'ingredient_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('product_ingredients');
        Schema::dropIfExists('product_images');
        Schema::dropIfExists('product_metadata');
        Schema::dropIfExists('products');
        Schema::dropIfExists('ingredients');
        Schema::dropIfExists('categories');
    }
};
