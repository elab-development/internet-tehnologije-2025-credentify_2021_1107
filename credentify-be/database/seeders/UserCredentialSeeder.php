<?php

namespace Database\Seeders;

use App\Models\Credential;
use App\Models\User;
use App\Models\UserCredential;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class UserCredentialSeeder extends Seeder
{
    public function run(): void
    {
        //random slike da imamo nesto
        $images = [
            'https://cdn.prod.website-files.com/661b25aa8bda4a590a431922/6663248fa5dae72fca630708_61097af8161fd516096659a2_Example-Credential.jpeg',
            'https://dev.ppdm.org/PPDM_TESTDEV/images/PPDM_Images/Certification/img_CPDA_Certificate_Sample_Dec22.png',
            'https://cdn.prod.website-files.com/661b25aa8bda4a590a431922/6663248f2dd0b147b81d22e1_5fc7ba6723514aabb98efbfb_28Aug2017-usedigitalcertificatedigitalbadge-image1.gif',
            'https://cdn.prod.website-files.com/661b25aa8bda4a590a431922/66622f7e6a6959096f71285f_648864705b7e78d5c8069324_Accredible_DigitalCredentialsBlog_06-DigitalCertificate2.webp',
        ];

        // Uzimamo samo "user" role (bez admin/moderator).
        $users = User::query()
            ->where('role', User::ROLE_USER)
            ->pluck('id')
            ->all();

        // Uzimamo samo aktivne credentiale, da ima smisla
        $credentials = Credential::query()
            ->where('is_active', true)
            ->get(['id', 'validity_months']);

        if (count($users) === 0 || $credentials->count() === 0) {
            return;
        }

        $statuses = ['Pending', 'Approved', 'Rejected', 'Expired'];

        foreach ($users as $userId) {
            // 1–3 user_credential zapisa po korisniku.
            $howMany = random_int(1, 3);

            // Shuffle credentiale da izbegnemo duplikate (bitno zbog unique user_id+credential_id).
            $picked = $credentials->shuffle()->take(min($howMany, $credentials->count()));

            foreach ($picked as $cred) {
                $status = $statuses[array_rand($statuses)];

                // Applied date: u poslednjih 60 dana.
                $appliedDate = Carbon::today()->subDays(random_int(0, 60));

                // Issued date: zavisi od statusa (da bude smisleno).
                if ($status === 'Expired') {
                    // Dovoljno star datum da često ispadne expired.
                    $issuedDate = Carbon::today()->subMonths(random_int(credMax(6), 48))->subDays(random_int(0, 30));
                } else {
                    // Skorije.
                    $issuedDate = Carbon::today()->subDays(random_int(0, 45));
                }

                // Validity months fallback (ako je null u bazi).
                $validity = (int) ($cred->validity_months ?? 24);
                if ($validity <= 0) {
                    $validity = 24;
                }

                // Expiry = issued + validity_months.
                $expiryDate = $issuedDate->copy()->addMonths($validity);

                // Ako je status Expired, a expiry ipak nije u prošlosti, pomeri issued unazad.
                if ($status === 'Expired' && $expiryDate->gte(Carbon::today())) {
                    $issuedDate = Carbon::today()->subMonths($validity + random_int(1, 12));
                    $expiryDate = $issuedDate->copy()->addMonths($validity);
                }

                // Rotacija slika.
                static $imgIndex = 0;
                $image = $images[$imgIndex % count($images)];
                $imgIndex++;

                // Unique constraint: user_id + credential_id, pa koristimo updateOrCreate.
                UserCredential::updateOrCreate(
                    [
                        'user_id' => $userId,
                        'credential_id' => $cred->id,
                    ],
                    [
                        'status' => $status,
                        'applied_date' => $appliedDate->toDateString(),
                        'issued_date' => $issuedDate->toDateString(),
                        'expiry_date' => $expiryDate->toDateString(),
                        'image' => $image,
                    ]
                );
            }
        }
    }
}

/**
 * Mali helper da se izbegne warning oko random_int granica 
 */
function credMax(int $min): int
{
    return $min;
}
