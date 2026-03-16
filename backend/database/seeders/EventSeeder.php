<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Event;
use App\Models\Category;
use App\Models\User;
use Illuminate\Support\Str;
use Carbon\Carbon;

class EventSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get or create categories
        $categories = Category::all();
        if ($categories->isEmpty()) {
            $categories = Category::factory()->count(5)->create();
        }

        // Get or create a user for event creator
        $user = User::updateOrCreate(
            ['email' => 'info@globaltalentmediahub.co.uk'],
            [
                'name' => 'Admin User',
                'password' => bcrypt('password'), // Default password, change in production
                'is_admin' => true,
            ]
        );

        // Sample events data with images and videos
        $events = [
            [
                'title' => 'London Music Festival 2026',
                'description' => 'Join us for the biggest music festival in London featuring top international artists, local talent, and amazing performances. Experience live music across multiple stages with food, drinks, and entertainment for all ages.',
                'short_description' => 'The biggest music festival in London featuring top international artists.',
                'category_id' => $categories->random()->id,
                'location' => 'Hyde Park, London',
                'venue_address' => 'Hyde Park, London W2 2UH, United Kingdom',
                'starts_at' => Carbon::now()->addMonths(2)->setTime(12, 0),
                'ends_at' => Carbon::now()->addMonths(2)->setTime(22, 0),
                'cover_image' => 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&h=600&fit=crop',
                'video_url' => 'https://www.youtube.com/embed/jfKfPfyJRdk',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=800&h=600&fit=crop',
                ],
                'price' => 75.00,
                'capacity' => 10000,
                'available_tickets' => 8500,
                'status' => 'published',
                'is_featured' => true,
                'terms_and_conditions' => 'Tickets are non-refundable. Age restrictions apply. Please arrive 30 minutes before the event starts.',
            ],
            [
                'title' => 'Tech Innovation Summit 2026',
                'description' => 'A premier technology conference bringing together industry leaders, innovators, and entrepreneurs. Features keynote speakers, workshops, networking sessions, and showcases of cutting-edge technology.',
                'short_description' => 'Premier technology conference with industry leaders and innovators.',
                'category_id' => $categories->random()->id,
                'location' => 'Olympia London',
                'venue_address' => 'Hammersmith Rd, London W14 8UX, United Kingdom',
                'starts_at' => Carbon::now()->addMonths(3)->setTime(9, 0),
                'ends_at' => Carbon::now()->addMonths(3)->addDays(2)->setTime(18, 0),
                'cover_image' => 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=600&fit=crop',
                'video_url' => 'https://www.youtube.com/embed/rUxyKA_-grg',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=600&fit=crop',
                ],
                'price' => 299.00,
                'capacity' => 2000,
                'available_tickets' => 1800,
                'status' => 'published',
                'is_featured' => true,
                'terms_and_conditions' => 'Professional dress code required. Conference materials included. Networking events included.',
            ],
            [
                'title' => 'Comedy Night Special',
                'description' => 'An evening of laughter with top UK comedians. Enjoy hilarious stand-up performances, improv shows, and interactive comedy that will leave you in stitches.',
                'short_description' => 'An evening of laughter with top UK comedians.',
                'category_id' => $categories->random()->id,
                'location' => 'Comedy Store, London',
                'venue_address' => '1a Oxendon St, London SW1Y 4EE, United Kingdom',
                'starts_at' => Carbon::now()->addWeeks(3)->setTime(20, 0),
                'ends_at' => Carbon::now()->addWeeks(3)->setTime(23, 0),
                'cover_image' => 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&h=600&fit=crop',
                'video_url' => 'https://www.youtube.com/embed/dQw4w9WgXcQ',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=800&h=600&fit=crop',
                ],
                'price' => 35.00,
                'capacity' => 400,
                'available_tickets' => 250,
                'status' => 'published',
                'is_featured' => false,
                'terms_and_conditions' => 'Age 18+. No refunds. Doors open 30 minutes before show time.',
            ],
            [
                'title' => 'Food & Wine Festival',
                'description' => 'Celebrate culinary excellence with tastings from top chefs, wine pairings, cooking demonstrations, and gourmet food vendors. A paradise for food lovers!',
                'short_description' => 'Celebrate culinary excellence with tastings and cooking demos.',
                'category_id' => $categories->random()->id,
                'location' => 'Borough Market, London',
                'venue_address' => '8 Southwark St, London SE1 1TL, United Kingdom',
                'starts_at' => Carbon::now()->addWeeks(4)->setTime(11, 0),
                'ends_at' => Carbon::now()->addWeeks(4)->setTime(20, 0),
                'cover_image' => 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=600&fit=crop',
                'video_url' => 'https://www.youtube.com/embed/4qQ_r2s2JNs',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=600&fit=crop',
                ],
                'price' => 45.00,
                'capacity' => 1500,
                'available_tickets' => 1200,
                'status' => 'published',
                'is_featured' => false,
                'terms_and_conditions' => 'Allergen information available. Some tastings require additional payment.',
            ],
            [
                'title' => 'Art & Photography Exhibition',
                'description' => 'Discover stunning contemporary art and photography from emerging and established artists. Features interactive installations, artist talks, and exclusive previews.',
                'short_description' => 'Contemporary art and photography from emerging artists.',
                'category_id' => $categories->random()->id,
                'location' => 'Tate Modern, London',
                'venue_address' => 'Bankside, London SE1 9TG, United Kingdom',
                'starts_at' => Carbon::now()->addMonths(1)->setTime(10, 0),
                'ends_at' => Carbon::now()->addMonths(2)->setTime(18, 0),
                'cover_image' => 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=1200&h=600&fit=crop',
                'video_url' => 'https://www.youtube.com/embed/kJQP7kiw5Fk',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=600&fit=crop',
                ],
                'price' => 20.00,
                'capacity' => 500,
                'available_tickets' => 450,
                'status' => 'published',
                'is_featured' => false,
                'terms_and_conditions' => 'Photography permitted. Guided tours available. Gift shop on site.',
            ],
            [
                'title' => 'Yoga & Wellness Retreat',
                'description' => 'A day of relaxation and wellness with yoga sessions, meditation workshops, healthy meals, spa treatments, and mindfulness activities in a peaceful setting.',
                'short_description' => 'A day of relaxation with yoga, meditation, and wellness activities.',
                'category_id' => $categories->random()->id,
                'location' => 'Kensington Gardens, London',
                'venue_address' => 'Kensington Gardens, London W2 2UH, United Kingdom',
                'starts_at' => Carbon::now()->addWeeks(5)->setTime(8, 0),
                'ends_at' => Carbon::now()->addWeeks(5)->setTime(17, 0),
                'cover_image' => 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&h=600&fit=crop',
                'video_url' => 'https://www.youtube.com/embed/b1H3xO3x_Js',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1510936111840-65e151ad71bb?w=800&h=600&fit=crop',
                ],
                'price' => 85.00,
                'capacity' => 200,
                'available_tickets' => 150,
                'status' => 'published',
                'is_featured' => false,
                'terms_and_conditions' => 'Yoga mats provided. Wear comfortable clothing. Bring water bottle.',
            ],
            [
                'title' => 'Business Networking Gala',
                'description' => 'Connect with industry leaders, entrepreneurs, and professionals at this exclusive networking event. Features keynote speakers, panel discussions, and cocktail reception.',
                'short_description' => 'Exclusive networking event with industry leaders and professionals.',
                'category_id' => $categories->random()->id,
                'location' => 'Grosvenor House, London',
                'venue_address' => '86-90 Park Ln, London W1K 7TN, United Kingdom',
                'starts_at' => Carbon::now()->addMonths(1)->addWeeks(2)->setTime(18, 0),
                'ends_at' => Carbon::now()->addMonths(1)->addWeeks(2)->setTime(23, 0),
                'cover_image' => 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=1200&h=600&fit=crop',
                'video_url' => 'https://www.youtube.com/embed/M7FIvfx5J10',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&h=600&fit=crop',
                ],
                'price' => 150.00,
                'capacity' => 500,
                'available_tickets' => 350,
                'status' => 'published',
                'is_featured' => true,
                'terms_and_conditions' => 'Business attire required. Business cards recommended. Dinner included.',
            ],
            [
                'title' => 'Jazz & Blues Night',
                'description' => 'Experience the best of jazz and blues with live performances from renowned musicians. Enjoy smooth melodies, soulful rhythms, and an intimate atmosphere.',
                'short_description' => 'Live jazz and blues performances in an intimate setting.',
                'category_id' => $categories->random()->id,
                'location' => 'Ronnie Scott\'s Jazz Club',
                'venue_address' => '47 Frith St, London W1D 4HT, United Kingdom',
                'starts_at' => Carbon::now()->addWeeks(2)->setTime(19, 30),
                'ends_at' => Carbon::now()->addWeeks(2)->setTime(23, 30),
                'cover_image' => 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&h=600&fit=crop',
                'video_url' => 'https://www.youtube.com/embed/neV5J9F3rD8',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop',
                ],
                'price' => 55.00,
                'capacity' => 220,
                'available_tickets' => 180,
                'status' => 'published',
                'is_featured' => false,
                'terms_and_conditions' => 'Table service available. Drinks not included. Age 18+.',
            ],
            [
                'title' => 'Fashion Week Showcase',
                'description' => 'Be the first to see the latest fashion trends and designs from top designers. Featuring runway shows, designer meet-and-greets, and exclusive previews.',
                'short_description' => 'Latest fashion trends and designs from top designers.',
                'category_id' => $categories->random()->id,
                'location' => 'Somerset House, London',
                'venue_address' => 'Strand, London WC2R 1LA, United Kingdom',
                'starts_at' => Carbon::now()->addMonths(4)->setTime(14, 0),
                'ends_at' => Carbon::now()->addMonths(4)->setTime(21, 0),
                'cover_image' => 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop',
                'video_url' => 'https://www.youtube.com/embed/3xZXm15QvyI',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=600&fit=crop',
                ],
                'price' => 120.00,
                'capacity' => 800,
                'available_tickets' => 600,
                'status' => 'published',
                'is_featured' => true,
                'terms_and_conditions' => 'Photography restrictions apply. VIP packages available.',
            ],
            [
                'title' => 'Film Festival Opening Night',
                'description' => 'Celebrate the opening night of our annual film festival with red carpet arrivals, premiere screenings, Q&A sessions with directors, and after-party.',
                'short_description' => 'Opening night of our annual film festival with premiere screenings.',
                'category_id' => $categories->random()->id,
                'location' => 'BFI Southbank, London',
                'venue_address' => 'Belvedere Rd, London SE1 8XT, United Kingdom',
                'starts_at' => Carbon::now()->addMonths(5)->setTime(18, 0),
                'ends_at' => Carbon::now()->addMonths(5)->setTime(23, 0),
                'cover_image' => 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&h=600&fit=crop',
                'video_url' => 'https://www.youtube.com/embed/u31qwQUeGuM',
                'gallery_images' => [
                    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=600&fit=crop',
                    'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&h=600&fit=crop',
                ],
                'price' => 65.00,
                'capacity' => 450,
                'available_tickets' => 400,
                'status' => 'published',
                'is_featured' => false,
                'terms_and_conditions' => 'Red carpet access. After-party included. Age restrictions apply.',
            ],
        ];

        foreach ($events as $eventData) {
            $slug = Str::slug($eventData['title']);
            $eventData['slug'] = $slug;
            $eventData['created_by'] = $user->id;
            
            // Check if event with this title already exists, if so, update it
            Event::updateOrCreate(
                ['title' => $eventData['title']],
                $eventData
            );
        }

        $this->command->info('Created ' . count($events) . ' sample events with images and videos!');
    }
}
