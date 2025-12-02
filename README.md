# MIKO GYM - Sistem Absensi Digital

Aplikasi absensi digital berbasis kartu RFID untuk gym, dibangun dengan Laravel, React (Inertia.js), dan ESP32.

## Fitur

- **Dashboard** - Statistik member, absensi hari ini, grafik kehadiran
- **Manajemen Member** - CRUD member dengan foto dan data keanggotaan
- **Jenis Keanggotaan** - Kelola paket membership (harian, bulanan, dll)
- **Absensi** - Check-in/check-out otomatis via RFID
- **RFID Belum Terdaftar** - Daftar kartu baru yang belum terdaftar
- **Rekap** - Laporan kehadiran dengan filter tanggal
- **Dark Mode** - Tema gelap/terang

## Requirements

- PHP >= 8.2
- Composer
- Node.js >= 18
- MySQL / MariaDB / SQLite
- ESP32 DevKit V1 + RFID Reader (untuk hardware)

## Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/username/gym-miko.git
cd gym-miko
```

### 2. Install Dependencies

```bash
composer install
npm install
```

### 3. Konfigurasi Environment

```bash
cp .env.example .env
php artisan key:generate
```

Edit file `.env` dan sesuaikan konfigurasi database:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gym_miko
DB_USERNAME=root
DB_PASSWORD=
```

### 4. Migrasi Database

```bash
php artisan migrate --seed
```

### 5. Storage Link

```bash
php artisan storage:link
```

### 6. Build Assets

```bash
npm run build
```

### 7. Jalankan Aplikasi

```bash
composer dev
```

Atau jalankan secara terpisah:

```bash
php artisan serve
npm run dev
```

Buka browser: `http://localhost:8000`

## Login Default

- **Email:** admin@mikogym.com
- **Password:** password

## API Endpoint untuk ESP32

### Scan RFID

```
POST /api/rfid/scan
Content-Type: application/json

{
    "rfid_uid": "ABC123XYZ"
}
```

**Response Sukses (Check-in):**
```json
{
    "success": true,
    "message": "Check-in berhasil",
    "type": "check_in",
    "member": {
        "name": "John Doe",
        "photo": "members/photo.jpg"
    },
    "time": "08:30:00"
}
```

**Response Error (Belum Terdaftar):**
```json
{
    "success": false,
    "message": "RFID belum terdaftar"
}
```

## Struktur Database

- `users` - Admin aplikasi
- `members` - Data member gym
- `membership_types` - Jenis keanggotaan
- `attendances` - Log absensi
- `unregistered_rfids` - Kartu RFID belum terdaftar

## Tech Stack

- **Backend:** Laravel 12, Laravel Fortify
- **Frontend:** React 18, Inertia.js, Tailwind CSS 4
- **Icons:** Heroicons
- **Notifications:** React Hot Toast

## License

MIT License
