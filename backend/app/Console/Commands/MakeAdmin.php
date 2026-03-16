<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class MakeAdmin extends Command
{
    protected $signature   = 'make:admin {email} {password}';
    protected $description = 'Create or promote a user to admin';

    public function handle(): void
    {
        $user = User::updateOrCreate(
            ['email' => $this->argument('email')],
            [
                'name'     => 'Admin',
                'password' => bcrypt($this->argument('password')),
                'is_admin' => true,
            ]
        );

        $this->info("Admin user ready: {$user->email}");
    }
}
