<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
{
    $admins = [
        ['email' => 'admin@kuotsu.test', 'name' => 'Admin', 'password' => 'password123'],
        ['email' => 'nha@kuotsu.test', 'name' => 'Admin NHA', 'password' => 'password456'],
    ];

    foreach ($admins as $admin) {
        User::updateOrCreate(
            ['email' => $admin['email']],
            [
                'name' => $admin['name'],
                'password' => Hash::make($admin['password']),
                'is_admin' => true,
            ]
        );
    }
}
}