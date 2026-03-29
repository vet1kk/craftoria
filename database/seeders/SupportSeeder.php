<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Models\AnalyticsEvent;
use App\Models\AuditLog;
use App\Models\Category;
use App\Models\Ingredient;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class SupportSeeder extends Seeder
{
    /**
     * Seed analytics and audit logs only if none exist.
     *
     * @return void
     */
    public function run(): void
    {
        // Skip if analytics or audit logs already exist
        if (AnalyticsEvent::query()->exists() || AuditLog::query()->exists()) {
            return;
        }

        /** @var \Illuminate\Support\Collection<int, \Illuminate\Database\Eloquent\Model> $collection */
        $collection = collect([
            ...Category::query()->limit(5)->get()->all(),
            ...Ingredient::query()->limit(5)->get()->all(),
            ...Product::query()->limit(10)->get()->all(),
            ...Order::query()->limit(10)->get()->all(),
        ]);

        $users = User::query()->get();

        if ($users->isEmpty()) {
            return;
        }

        foreach (range(1, 40) as $iteration) {
            $user = $users->random();
            $auditable = $collection->isNotEmpty() ? $collection->random() : null;

            AnalyticsEvent::factory()->for($user)->create([
                'session_id' => (string) Str::uuid(),
                'occurred_at' => now()->subMinutes($iteration * 7),
            ]);

            AuditLog::factory()->for($user, 'actor')->create([
                'auditable_type' => $auditable?->getMorphClass(),
                'auditable_id' => $auditable?->getKey(),
                'occurred_at' => now()->subMinutes($iteration * 5),
            ]);
        }
    }
}
