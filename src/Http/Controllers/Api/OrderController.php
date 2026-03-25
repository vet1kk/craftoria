<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Order\StoreOrderRequest;
use App\Http\Requests\Order\UpdateOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class OrderController extends Controller
{
    /**
     * Create a public checkout order.
     *
     * @param \App\Http\Requests\Order\StoreOrderRequest $request
     * @return \App\Http\Resources\OrderResource
     * @throws \Random\RandomException
     */
    public function store(StoreOrderRequest $request): OrderResource
    {
        $order = Order::create(array_merge($request->validated(), [
            'user_id' => auth()->id(),
            'order_number' => OrderService::generateOrderNumber(),
            'status' => 'pending',
            'placed_at' => now(),
        ]));

        return new OrderResource($order);
    }

    /**
     * Return the admin order collection.
     *
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function index(): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Order::class);

        $orders = Order::query()
            ->with(['orderItems', 'user'])
                       ->latest('placed_at')
                       ->latest('created_at')
                       ->get();

        return OrderResource::collection($orders);
    }

    /**
     * Return a single order for the admin area.
     *
     * @param \App\Models\Order $order
     * @return \App\Http\Resources\OrderResource
     */
    public function show(Order $order): OrderResource
    {
        $this->authorize('view', $order);

        return new OrderResource($order->loadDetails());
    }

    /**
     * Update an order from the validated admin payload.
     *
     * @param \App\Http\Requests\Order\UpdateOrderRequest $request
     * @param \App\Models\Order $order
     * @return \App\Http\Resources\OrderResource
     */
    public function update(UpdateOrderRequest $request, Order $order): OrderResource
    {
        $this->authorize('update', $order);

        $order->update($request->validated());

        return $this->show($order);
    }
}
