<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Order\OrderItem\StoreOrderItemRequest;
use App\Http\Requests\Order\OrderItem\UpdateOrderItemRequest;
use App\Http\Resources\OrderItemResource;
use App\Models\Order;
use App\Models\OrderItem;
use App\Services\OrderItemService;

class OrderItemController extends Controller
{
    public function __construct(private readonly OrderItemService $orderItemService)
    {
    }

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

        $orderItem = $this->orderItemService->store($order, $request->validated());

        return new OrderItemResource($orderItem);
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

        $updatedOrderItem = $this->orderItemService->update($orderItem, $request->validated());

        return new OrderItemResource($updatedOrderItem);
    }

    /**
     * @throws \Throwable
     */
    public function destroy(Order $order, OrderItem $orderItem): \Illuminate\Http\Response
    {
        $this->authorize('delete', $order);

        $this->orderItemService->delete($orderItem);

        return response()->noContent();
    }
}
