<?php

namespace Database\Seeders;

use App\Models\Skill;
use Illuminate\Database\Seeder;

class SkillSeeder extends Seeder
{
    public function run(): void
    {
        $skills = [
            ['name' => 'JavaScript',          'category' => 'Programming'],
            ['name' => 'TypeScript',          'category' => 'Programming'],
            ['name' => 'Laravel',             'category' => 'Backend'],
            ['name' => 'REST APIs',           'category' => 'Backend'],
            ['name' => 'SQL',                 'category' => 'Database'],
            ['name' => 'PostgreSQL',          'category' => 'Database'],
            ['name' => 'Git',                 'category' => 'Tools'],
            ['name' => 'Docker',              'category' => 'DevOps'],
            ['name' => 'Unit Testing',        'category' => 'Testing'],
            ['name' => 'CI/CD',               'category' => 'DevOps'],
        ];

        foreach ($skills as $skill) {
            Skill::updateOrCreate(
                ['name' => $skill['name']],
                ['category' => $skill['category']]
            );
        }
    }
}
