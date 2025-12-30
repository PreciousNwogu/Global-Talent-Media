<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            ['name' => 'Music & Concerts', 'description' => 'Live music performances, concerts, and musical events'],
            ['name' => 'Technology', 'description' => 'Tech conferences, workshops, and innovation events'],
            ['name' => 'Comedy', 'description' => 'Comedy shows, stand-up performances, and entertainment'],
            ['name' => 'Food & Drink', 'description' => 'Food festivals, wine tastings, and culinary events'],
            ['name' => 'Arts & Culture', 'description' => 'Art exhibitions, cultural events, and creative showcases'],
            ['name' => 'Wellness', 'description' => 'Yoga, meditation, wellness retreats, and health events'],
            ['name' => 'Business', 'description' => 'Networking events, conferences, and business gatherings'],
            ['name' => 'Fashion', 'description' => 'Fashion shows, design events, and style showcases'],
            ['name' => 'Film & Cinema', 'description' => 'Film festivals, screenings, and cinema events'],
            ['name' => 'Sports', 'description' => 'Sports events, tournaments, and athletic competitions'],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(
                ['slug' => Str::slug($category['name'])],
                [
                    'name' => $category['name'],
                    'description' => $category['description'],
                ]
            );
        }

        $this->command->info('Created ' . count($categories) . ' categories!');
    }
}

