<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Requests\UpdateOrderRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class OrderController extends Controller
{
    /**
     * @param  \App\Services\OrderService  $orderService
     * @return void
     */
    public function __construct(
        private readonly OrderService $orderService,
    ) {}

    /**
     * Create a public checkout order.
     *
     * @param  \App\Http\Requests\StoreOrderRequest  $request
     * @return \Illuminate\Http\JsonResponse
     *
     * @throws \Throwable
     */
    public function store(StoreOrderRequest $request): JsonResponse
    {
        $order = $this->orderService->create(
            $request->validated(),
            $request->user()?->getKey(),
        );

        return (new OrderResource($order))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Return the admin order collection.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Order::class);

        $orders = $this->orderService->listAll([
            'status' => $request->filled('status') ? (string) $request->string('status') : null,
            'payment_status' => $request->filled('payment_status') ? (string) $request->string('payment_status') : null,
            'fulfillment_type' => $request->filled('fulfillment_type') ? (string) $request->string('fulfillment_type') : null,
            'search' => $request->filled('search') ? trim((string) $request->string('search')) : null,
        ]);

        return OrderResource::collection($orders);
    }

    /**
     * Return a single order for the admin area.
     *
     * @param  \App\Models\Order  $order
     * @return \App\Http\Resources\OrderResource
     */
    public function show(Order $order): OrderResource
    {
        $this->authorize('view', $order);

        return new OrderResource($this->orderService->loadDetails($order));
    }

    /**
     * Update an order from the validated admin payload.
     *
     * @param  \App\Http\Requests\UpdateOrderRequest  $request
     * @param  \App\Models\Order  $order
     * @return \App\Http\Resources\OrderResource
     */
    public function update(UpdateOrderRequest $request, Order $order): OrderResource
    {
        $this->authorize('update', $order);

        return new OrderResource($this->orderService->update($order, $request->validated()));
    }
}
