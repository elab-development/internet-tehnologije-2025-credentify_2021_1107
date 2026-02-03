<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $defaultUserProfileInfo = 'Standardni korisnik Credentify aplikacije. Prati svoje kredencijale i veštine.';
        $adminProfileInfo = 'Administrator sistema. Upravlja korisnicima, izdavačima i definicijama kredencijala.';
        $moderatorProfileInfo = 'Moderator sistema. Pregleda prijave za kredencijale i donosi odluke (odobri/odbij).';

        // Admin
        User::updateOrCreate(
            ['email' => 'admin@credentify.test'],
            [
                'name' => 'Admin',
                'password' => 'password',
                'role' => User::ROLE_ADMIN,
                'profile_info' => $adminProfileInfo,
            ]
        );

        // Moderator - Lazar
        User::updateOrCreate(
            ['email' => 'lazar@credentify.test'],
            [
                'name' => 'Lazar',
                'password' => 'password',
                'role' => User::ROLE_MODERATOR,
                'profile_info' => $moderatorProfileInfo,
            ]
        );

        // Nikola - user
        User::updateOrCreate(
            ['email' => 'nikola@credentify.test'],
            [
                'name' => 'Nikola',
                'password' => 'password',
                'role' => User::ROLE_USER,
                'profile_info' => $defaultUserProfileInfo,
            ]
        );

        // Igor - user
        User::updateOrCreate(
            ['email' => 'igor@credentify.test'],
            [
                'name' => 'Igor',
                'password' => 'password',
                'role' => User::ROLE_USER,
                'profile_info' => $defaultUserProfileInfo,
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
                    'password' => 'password',
                    'role' => User::ROLE_USER,
                    'profile_info' => $defaultUserProfileInfo,
                ]
            );
        }
    }
}
