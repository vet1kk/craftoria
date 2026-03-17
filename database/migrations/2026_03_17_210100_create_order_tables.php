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
        Schema::create('orders', static function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('order_number')->unique();
            $table->foreignUuid('user_id')
                  ->nullable()
                  ->constrained('users')
                  ->cascadeOnUpdate()
                  ->nullOnDelete();
            $table->string('status')->default('pending')->index();
            $table->string('fulfillment_type')->default('delivery')->index();
            $table->string('customer_name');
            $table->string('customer_email')->nullable();
            $table->string('customer_phone');
            $table->char('currency', 3)->default('UAH');
            $table->decimal('subtotal_amount', 10)->default(0);
            $table->decimal('discount_amount', 10)->default(0);
            $table->decimal('delivery_fee_amount', 10)->default(0);
            $table->decimal('total_amount', 10)->default(0);
            $table->text('customer_notes')->nullable();
            $table->string('payment_method')->nullable();
            $table->string('payment_status')->default('pending')->index();
            $table->string('payment_reference')->nullable();
            $table->string('delivery_address_line_1')->nullable();
            $table->string('delivery_address_line_2')->nullable();
            $table->string('delivery_city')->nullable();
            $table->string('delivery_postal_code')->nullable();
            $table->char('delivery_country_code', 2)->nullable();
            $table->timestamp('placed_at')->nullable()->index();
            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('preparing_at')->nullable();
            $table->timestamp('estimated_ready_at')->nullable();
            $table->timestamp('ready_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->text('cancelled_reason')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });

        Schema::create('order_items', static function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('order_id')
                  ->constrained('orders')
                  ->cascadeOnUpdate()
                  ->cascadeOnDelete();
            $table->foreignUuid('product_id')
                  ->nullable()
                  ->constrained('products')
                  ->cascadeOnUpdate()
                  ->nullOnDelete();
            $table->string('product_name');
            $table->string('product_sku')->nullable();
            $table->unsignedInteger('quantity');
            $table->decimal('unit_price', 10);
            $table->decimal('line_total', 10);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_items');
        Schema::dropIfExists('orders');
    }
};
