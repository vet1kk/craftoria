<?php

declare(strict_types=1);

use App\Http\Controllers\Api\AnalyticsEventController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\IngredientController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\OrderItemController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\ProductIngredientController;
use App\Http\Controllers\Api\ProductMetadataController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\SettingsController;
use Illuminate\Support\Facades\Route;

Route::get('/', HealthController::class);
Route::get('/health', HealthController::class);
Route::get('/settings', SettingsController::class);

Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/categories/{slug}', [CategoryController::class, 'show'])->where('slug', '^(?!options$).+');

Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);

Route::post('/orders', [OrderController::class, 'store']);
Route::post('/analytics/events', [AnalyticsEventController::class, 'store']);

Route::get('/session', [AuthController::class, 'session']);
Route::post('/register', [AuthController::class, 'store']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:api')->group(function (): void {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/refresh', [AuthController::class, 'refresh']);

    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::get('/profile/orders', [ProfileController::class, 'orders']);

    Route::post('/categories', [CategoryController::class, 'store'])->name('categories.store');
    Route::get('/categories/options', [CategoryController::class, 'options'])->name('categories.options');
    Route::put('/categories/{category}', [CategoryController::class, 'update'])->name('categories.update');
    Route::put('/categories/{category}/products', [CategoryController::class, 'assignProducts'])
         ->name('categories.products.assign');
    Route::patch('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy'])->name('categories.destroy');

    Route::get('/ingredients', [IngredientController::class, 'index'])->name('ingredients.index');
    Route::post('/ingredients', [IngredientController::class, 'store'])->name('ingredients.store');
    Route::get('/ingredients/{ingredient}', [IngredientController::class, 'show'])->name('ingredients.show');
    Route::put('/ingredients/{ingredient}', [IngredientController::class, 'update'])->name('ingredients.update');
    Route::patch('/ingredients/{ingredient}', [IngredientController::class, 'update']);
    Route::delete('/ingredients/{ingredient}', [
        IngredientController::class,
        'destroy',
    ])->name('ingredients.destroy');

    Route::post('/products', [ProductController::class, 'store'])->name('products.store');
    Route::put('/products/{product}', [ProductController::class, 'update'])->name('products.update');
    Route::patch('/products/{product}', [ProductController::class, 'update']);
    Route::delete('/products/{product}', [ProductController::class, 'destroy'])->name('products.destroy');

    Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
    Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');
    Route::put('/orders/{order}', [OrderController::class, 'update'])->name('orders.update');
    Route::patch('/orders/{order}', [OrderController::class, 'update']);

    Route::scopeBindings()->group(function (): void {
        Route::post('/orders/{order}/items', [OrderItemController::class, 'store'])->name('orders.items.store');
        Route::put('/orders/{order}/items/{order_item}', [
            OrderItemController::class,
            'update',
        ])->name('orders.items.update');
        Route::delete('/orders/{order}/items/{order_item}', [
            OrderItemController::class,
            'destroy',
        ])->name('orders.items.destroy');

        Route::post('/products/{product}/ingredients', [
            ProductIngredientController::class,
            'store',
        ])->name('products.ingredients.store');
        Route::put('/products/{product}/ingredients/{product_ingredient}', [
            ProductIngredientController::class,
            'update',
        ])->name('products.ingredients.update');
        Route::delete('/products/{product}/ingredients/{product_ingredient}', [
            ProductIngredientController::class,
            'destroy',
        ])->name('products.ingredients.destroy');

        Route::post('/products/{product}/metadata', [
            ProductMetadataController::class,
            'store',
        ])->name('products.metadata.store');
        Route::put('/products/{product}/metadata/{metadata}', [
            ProductMetadataController::class,
            'update',
        ])->name('products.metadata.update');
        Route::delete('/products/{product}/metadata/{metadata}', [
            ProductMetadataController::class,
            'destroy',
        ])->name('products.metadata.destroy');
    });
});
