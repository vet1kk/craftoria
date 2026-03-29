<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Order\OrderItem\StoreOrderItemRequest;
use App\Http\Requests\Order\OrderItem\UpdateOrderItemRequest;
use App\Http\Resources\OrderItemResource;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Support\Facades\DB;

class OrderItemController extends Controller
{
    /**
     * @param \App\Http\Requests\Order\OrderItem\StoreOrderItemRequest $request
     * @param \App\Models\Order $order
     * @return \App\Http\Resources\OrderItemResource
     *
     * @throws \Throwable
     */
    public function store(StoreOrderItemRequest $request, Order $order): OrderItemResource
    {
        $this->authorize('update', $order);

        return DB::transaction(static function () use ($request, $order) {
            $product = Product::findOrFail($request->validated('product_id'));
            $orderItem = $order->orderItems()->create([
                'product_id' => $product->id,
                'product_name' => $product->name,
                'product_sku' => $product->sku,
                'quantity' => $request->validated('quantity'),
                'unit_price' => $product->price,
                'line_total' => $product->price * $request->validated('quantity'),
                'notes' => $request->validated('notes'),
            ]);

            return new OrderItemResource($orderItem);
        });
    }

    /**
     * @param \App\Http\Requests\Order\OrderItem\UpdateOrderItemRequest $request
     * @param \App\Models\Order $order
     * @param \App\Models\OrderItem $orderItem
     * @return \App\Http\Resources\OrderItemResource
     * @throws \Throwable
     */
    public function update(UpdateOrderItemRequest $request, Order $order, OrderItem $orderItem): OrderItemResource
    {
        $this->authorize('update', $order);

        return DB::transaction(static function () use ($request, $orderItem) {
            $orderItem->fill($request->validated());

            $orderItem->line_total = $orderItem->unit_price * $orderItem->quantity;
            $orderItem->save();

            return new OrderItemResource($orderItem);
        });
    }

    /**
     * @throws \Throwable
     */
    public function destroy(Order $order, OrderItem $orderItem): \Illuminate\Http\Response
    {
        $this->authorize('delete', $order);

        DB::transaction(static function () use ($orderItem) {
            $orderItem->delete();
        });

        return response()->noContent();
    }
}
