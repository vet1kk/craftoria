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
    public function __construct(private readonly OrderService $orderService)
    {
    }

    /**
     * Create a public checkout order.
     *
     * @param \App\Http\Requests\Order\StoreOrderRequest $request
     * @return \App\Http\Resources\OrderResource
     * @throws \Random\RandomException
     */
    public function store(StoreOrderRequest $request): OrderResource
    {
        $order = $this->orderService->store($request->validated(), auth()->id());

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

        $orders = $this->orderService->index();

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

        return new OrderResource($this->orderService->show($order));
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

        return new OrderResource($this->orderService->update($order, $request->validated()));
    }
}
