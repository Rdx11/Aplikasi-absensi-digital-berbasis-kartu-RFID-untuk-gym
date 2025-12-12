# Bricks Gym - Sistem Absensi Digital

Aplikasi absensi digital berbasis kartu RFID untuk gym, dibangun dengan Laravel, React (Inertia.js), dan ESP32.

## Fitur

### Manajemen Member
- **CRUD Member** - Kelola data member dengan foto dan informasi keanggotaan
- **Perpanjang Member** - Perpanjang membership dengan pilihan jenis baru
- **Auto Expired** - Status member otomatis berubah jika membership habis
- **Validasi Tanggal** - Validasi tanggal mulai tidak boleh lebih dari tanggal akhir

### Jenis Keanggotaan
- **CRUD Jenis Membership** - Kelola paket (harian, bulanan, 6 bulan, tahunan)
- **Harga Berbeda** - Harga member baru dan harga perpanjangan terpisah
- **Durasi Otomatis** - Tanggal akhir dihitung otomatis berdasarkan durasi

### Absensi
- **Check-in Real-time** - Absensi otomatis via RFID dengan popup foto member
- **Paket Harian** - Absensi non-member dengan paket harian
- **RFID Belum Terdaftar** - Daftar kartu baru yang belum terdaftar

### Laporan & Rekap
- **Rekap Absensi** - Laporan kehadiran member dan non-member
- **Laporan Member** - Statistik member (baru, aktif, expired, segera expired)
- **Rekap Pendapatan** - Pendapatan dari membership baru, perpanjangan, dan paket harian
- **Export Excel** - Export semua laporan ke Excel

### Lainnya
- **Dashboard** - Statistik member, absensi hari ini, grafik kehadiran 7 hari
- **Dark Mode** - Tema gelap/terang
- **Pagination** - Semua tabel dengan pagination

## Requirements

- PHP >= 8.2
- Composer
- Node.js >= 18
- MySQL / MariaDB
- ESP32 DevKit V1 + MFRC522 RFID Reader + LCD I2C 16x2

## Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/username/bricks-gym.git
cd bricks-gym
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
APP_NAME="Bricks Gym"
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=bricks_gym
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

Untuk development:
```bash
php artisan serve --host=0.0.0.0 --port=8000
npm run dev
```

Buka browser: `http://localhost:8000`

## Login Default

- **Email:** admin@bricksgym.com
- **Password:** password

## Konfigurasi ESP32

### Wiring MFRC522 ke ESP32

| MFRC522 | ESP32 |
|---------|-------|
| SDA     | GPIO 5 |
| SCK     | GPIO 18 |
| MOSI    | GPIO 23 |
| MISO    | GPIO 19 |
| RST     | GPIO 22 |
| 3.3V    | 3.3V |
| GND     | GND |

### Wiring LCD I2C

| LCD I2C | ESP32 |
|---------|-------|
| SDA     | GPIO 16 |
| SCL     | GPIO 17 |
| VCC     | 5V |
| GND     | GND |

### Buzzer
- Positif → GPIO 14
- Negatif → GND

### Konfigurasi di Kode ESP32

Edit file `esp32/rfid_scanner.ino`:

```cpp
// WiFi
const char* ssid = "NAMA_WIFI_ANDA";
const char* password = "PASSWORD_WIFI_ANDA";

// Server (ganti dengan IP komputer)
String serverName = "http://192.168.1.xxx:8000/api/rfid/scan";
```

### Library yang Dibutuhkan (Arduino IDE)

- MFRC522 by GithubCommunity
- ArduinoJson by Benoit Blanchon
- LiquidCrystal_I2C

## API Endpoint

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
        "photo": "members/photo.jpg",
        "membership_type": "Gold"
    },
    "time": "08:30:00",
    "today_count": 1
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

### Tabel Utama
- `users` - Data admin/user login
- `members` - Data member gym
- `membership_types` - Jenis keanggotaan (harga, durasi)
- `member_renewals` - History perpanjangan member
- `attendances` - Data absensi
- `daily_packages` - Paket harian untuk non-member
- `unregistered_rfids` - RFID yang belum terdaftar

## Scheduled Tasks

Untuk menjalankan auto-check expired members, tambahkan cron job:

```bash
* * * * * cd /path-to-project && php artisan schedule:run >> /dev/null 2>&1
```

Atau jalankan manual:
```bash
php artisan members:check-expired
```

## Tech Stack

- **Backend:** Laravel 12, Laravel Fortify
- **Frontend:** React 18, Inertia.js, Tailwind CSS 4
- **Charts:** Recharts
- **Icons:** Heroicons
- **Notifications:** React Hot Toast
- **Export:** Maatwebsite Excel
- **Hardware:** ESP32 DevKit V1, MFRC522, LCD I2C 16x2

## License

MIT License
