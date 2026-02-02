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
        $this->call([
            UserSeeder::class,           // admin, moderator, users
            IssuerSeeder::class,         // 10 issuers
            SkillSeeder::class,          // 10 skills
            CredentialSeeder::class,     // credentials + povezivanje na issuers + pivot credential_skill
            UserCredentialSeeder::class, // user_credentials (samo role=user) + datumi + image
        ]);
    }
}
