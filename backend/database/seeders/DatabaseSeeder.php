<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create admin user if it doesn't exist
        User::updateOrCreate(
            ['email' => 'info@globaltalentmediahub.co.uk'],
            [
                'name' => 'Admin User',
                'password' => bcrypt('password'), // Default password, change in production
                'is_admin' => true,
            ]
        );

        // Seed categories first
        $this->call([
            CategorySeeder::class,
        ]);

        // Then seed events (which depend on categories)
        $this->call([
            EventSeeder::class,
        ]);
    }
}
