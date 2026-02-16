# Credentify — Platforma za upravljanje kredencijalima

Credentify je veb aplikacija koja omogućava korisnicima da na jednom mestu vode evidenciju o svojim kompetencijama, veštinama, diplomama, sertifikatima i drugim postignućima. U praksi se ovakvi podaci često nalaze u mejlovima, na papiru, u PDF fajlovima ili na društvenim mrežama, što otežava održavanje i predstavljanje trećim licima. Aplikacija rešava problem nedostatka centralizovanog, preglednog i pouzdanog načina za čuvanje i ažuriranje kredencijala, kao i nemogućnost jasnog prikaza razvoja kompetencija kroz vreme.

![Logo](frontend/public/credentify logo.png)

Osnovni cilj aplikacije je da obezbedi centralno mesto na kome korisnik može da kreira profesionalni profil, doda relevantne veštine i unese kredencijale koje poseduje (sa informacijama o izdavaču i datumu izdavanja). Sistem podržava i proces provere kredencijala kroz moderatorsku ulogu, kako bi se razlikovali uneti i verifikovani podaci.

Ciljna grupa su pojedinci koji žele strukturirano da vode evidenciju o obrazovanju i profesionalnom razvoju (studenti, polaznici kurseva/obuka, zaposleni), dok moderatorima i administratorima aplikacija pruža alate za kontrolu sadržaja i nadzor nad korisnicima i kredencijalima.

---

## Funkcionalnosti (pregled)

### Gost (neulogovan korisnik)
- Registracija.
- Prijava.

### Korisnik (autentifikovan)
- Pregled i izmena profila.
- Upravljanje ličnom listom veština.
- Dodavanje, pregled i brisanje kredencijala.
- Izvoz kredencijala u Excel format.

### Moderator
- Pregled svih kredencijala koje su korisnici uneli.
- Promena statusa kredencijala (npr. Approved / Rejected) nakon provere.

### Administrator
- Pregled svih korisnika.
- Uklanjanje naloga koji više ne treba da postoje ili krše pravila korišćenja.
- Uvid u admin metrike (dashboard).

---

## Tehnologije

### Backend
- **Laravel** (REST API).
- **MySQL** (baza podataka).
- **Sanctum** (autentifikacija, token/cookie u zavisnosti od podešavanja).
- **Laravel API Resources** (standardizovan JSON output).

### Frontend
- **React** (SPA aplikacija).
- **Axios** (HTTP komunikacija sa backendom).
- **react-google-charts** (vizualizacija metrika na admin dashboard-u).

### Eksterni servisi (API)
- **ImgBB API** — upload/hostovanje slika (npr. fotografije sertifikata); backend čuva samo URL.
- **ROR API** — inicijalno popunjavanje Issuer tabele realnim organizacijama.

---

## Lokalno pokretanje (bez Docker-a)

### Preduslovi
- Node.js (preporučeno 18+)
- Composer
- PHP (kompatibilan sa Laravel verzijom projekta)
- MySQL
- Git

> Backend i frontend postoje kao odvojeni folderi

---

### 1) Backend (Laravel)
Backend koraci:
   ```bash
   cd credentify-be
   composer install
   php artisan migrate:fresh --seed
   php artisan serve
   ```

### 2) Frontend (React)
Frontend koraci:
   ```bash
   cd credentify-fe
   npm install
   npm start
   ```

Frontend će biti dostupan na: http://localhost:3000

## Pokretanje projekta uz Docker

> Pretpostavke: instaliran i pokrenut **Docker Desktop**.

1. Pokretanje Docker kompozicije:
```bash
    docker compose down -v
    docker compose up --build
```

Frontend pokrenut na: [http://localhost:3000](http://localhost:3000) Backend API pokrenut na: [http://127.0.0.1:8000/api](http://127.0.0.1:8000/api)