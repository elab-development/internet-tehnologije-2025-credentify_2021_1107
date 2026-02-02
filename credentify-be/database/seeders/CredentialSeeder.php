<?php

namespace Database\Seeders;

use App\Models\Credential;
use App\Models\Issuer;
use App\Models\Skill;
use Illuminate\Database\Seeder;

class CredentialSeeder extends Seeder
{
    public function run(): void
    {
        $issuerIds = Issuer::query()->pluck('id')->all();
        $skillIds  = Skill::query()->pluck('id')->all();

        $credentials = [
            ['name' => 'Full-Stack Web Development Certificate', 'category' => 'Web Development', 'validity_months' => 36],
            ['name' => 'Backend Development (Laravel) Certificate', 'category' => 'Backend', 'validity_months' => 24],
            ['name' => 'Frontend Development (JavaScript) Certificate', 'category' => 'Frontend', 'validity_months' => 24],
            ['name' => 'SQL & Relational Databases Certificate', 'category' => 'Database', 'validity_months' => 36],
            ['name' => 'DevOps Foundations Certificate', 'category' => 'DevOps', 'validity_months' => 24],
            ['name' => 'Docker Fundamentals Certificate', 'category' => 'DevOps', 'validity_months' => 24],
            ['name' => 'Git & Version Control Certificate', 'category' => 'Tools', 'validity_months' => 48],
            ['name' => 'API Design (REST) Certificate', 'category' => 'Backend', 'validity_months' => 36],
            ['name' => 'TypeScript Essentials Certificate', 'category' => 'Programming', 'validity_months' => 36],
            ['name' => 'Testing & Quality Assurance Certificate', 'category' => 'Testing', 'validity_months' => 24],
        ];

        foreach ($credentials as $c) {
            // Random issuer_id
            $issuerId = $issuerIds[array_rand($issuerIds)];

            // Kreiraj ili ažuriraj credential (po imenu).
            $credential = Credential::updateOrCreate(
                ['name' => $c['name']],
                [
                    'issuer_id' => $issuerId,
                    'category' => $c['category'],
                    'validity_months' => $c['validity_months'],
                    'is_active' => true,
                ]
            );

            // Dodeli 1–2 random skilla (bez ponavljanja)
            $count = random_int(1, 2);

            // Ako ima samo 1 skill u bazi, mora da bude 1.
            if (count($skillIds) < 2) {
                $count = 1;
            }

            $randomSkillIds = collect($skillIds)
                ->shuffle()
                ->take($count)
                ->values()
                ->all();

            
            $credential->skills()->sync($randomSkillIds);
        }
    }
}
