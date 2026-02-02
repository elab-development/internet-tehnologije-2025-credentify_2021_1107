<?php

namespace Database\Seeders;

use App\Models\Issuer;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Http;

class IssuerSeeder extends Seeder
{
    public function run(): void
    {
        $inserted = 0;

        $plans = [
            ['query' => 'university', 'filter' => 'country.country_code:RS'],
            ['query' => 'institute',  'filter' => 'country.country_code:RS'],
            ['query' => 'academy',    'filter' => 'country.country_code:RS'],
            ['query' => 'university', 'filter' => 'country.country_code:GB'],
            ['query' => 'institute',  'filter' => 'country.country_code:DE'],
        ];

        foreach ($plans as $plan) {
            if ($inserted >= 10) break;

            $response = Http::timeout(20)->get('https://api.ror.org/v2/organizations', [
                'query'  => $plan['query'],
                'filter' => $plan['filter'],
            ]);

            if (!$response->successful()) {
                // Ako želiš da vidiš grešku:
                // $this->command?->warn('ROR request failed: ' . $response->status());
                continue;
            }

            $items = data_get($response->json(), 'items', []);
            if (!is_array($items)) continue;

            foreach ($items as $org) {
                if ($inserted >= 10) break 2;

                // 1) NAME: uzmi ror_display ako postoji, inače label, inače prvi name value.
                $names = data_get($org, 'names', []);
                $name = null;

                if (is_array($names)) {
                    foreach ($names as $n) {
                        $types = (array) data_get($n, 'types', []);
                        if (in_array('ror_display', $types, true)) {
                            $name = data_get($n, 'value');
                            break;
                        }
                    }
                    if (!$name) {
                        foreach ($names as $n) {
                            $types = (array) data_get($n, 'types', []);
                            if (in_array('label', $types, true)) {
                                $name = data_get($n, 'value');
                                break;
                            }
                        }
                    }
                    if (!$name && isset($names[0])) {
                        $name = data_get($names[0], 'value');
                    }
                }

                $name = trim((string) $name);
                if ($name === '') continue;

                // 2) COUNTRY: iz prve lokacije (ako postoji).
                $countryCode = (string) data_get($org, 'locations.0.geonames_details.country_code', '');
                $countryCode = $countryCode !== '' ? strtoupper($countryCode) : null;

                // 3) WEBSITE: iz links[] gde je type=website
                $website = null;
                $links = data_get($org, 'links', []);
                if (is_array($links)) {
                    foreach ($links as $link) {
                        if (data_get($link, 'type') === 'website' && !empty(data_get($link, 'value'))) {
                            $website = (string) data_get($link, 'value');
                            break;
                        }
                    }
                }

                // Minimalno mapiranje na Issuer (bez eksternog ID-ja).
                $issuer = Issuer::firstOrCreate(
                    ['name' => $name],
                    [
                        'name'    => $name,
                        'website' => $website,
                        'country' => $countryCode,
                        'email'   => null,
                    ]
                );

                if ($issuer->wasRecentlyCreated) {
                    $inserted++;
                    // $this->command?->info("Created issuer: {$name}");
                }

                if ($inserted >= 10) break 2;
            }
        }

        // $this->command?->info("Total created: {$inserted}");
    }
}
