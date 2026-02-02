<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin
        User::updateOrCreate(
            ['email' => 'admin@credentify.test'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password'),
                'role' => User::ROLE_ADMIN,
                'profile_info' => null,
            ]
        );

        // Moderator - Lazar
        User::updateOrCreate(
            ['email' => 'lazar@credentify.test'],
            [
                'name' => 'Lazar',
                'password' => Hash::make('password'),
                'role' => User::ROLE_MODERATOR,
                'profile_info' => null,
            ]
        );

        User::updateOrCreate(
            ['email' => 'nikola@credentify.test'],
            [
                'name' => 'Nikola',
                'password' => Hash::make('password'),
                'role' => User::ROLE_USER,
                'profile_info' => null,
            ]
        );

        User::updateOrCreate(
            ['email' => 'igor@credentify.test'],
            [
                'name' => 'Igor',
                'password' => Hash::make('password'),
                'role' => User::ROLE_USER,
                'profile_info' => null,
            ]
        );

        // Još 3 klasična korisnika
        $extraUsers = [
            ['name' => 'Jovana', 'email' => 'jovana@credentify.test'],
            ['name' => 'Milica', 'email' => 'milica@credentify.test'],
            ['name' => 'Marko',  'email' => 'marko@credentify.test'],
        ];

        foreach ($extraUsers as $u) {
            User::updateOrCreate(
                ['email' => $u['email']],
                [
                    'name' => $u['name'],
                    'password' => Hash::make('password'),
                    'role' => User::ROLE_USER,
                    'profile_info' => null,
                ]
            );
        }
    }
}
