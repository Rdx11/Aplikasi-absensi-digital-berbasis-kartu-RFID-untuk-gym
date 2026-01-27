# 📚 Panduan Sistem Archiving Absensi

## 🎯 Tujuan
Mengelola data absensi yang menumpuk selama bertahun-tahun dengan strategi hybrid:
- **Data tidak hilang** - Semua data tetap tersimpan
- **Performa optimal** - Query tetap cepat
- **Hemat storage** - Data lama di-compress/summarize

## 📊 Strategi Penyimpanan

### 1. Tabel Utama (`attendances`) - 0-2 Tahun
- **Isi**: Data detail 2 tahun terakhir
- **Tujuan**: Performa query optimal untuk data aktif
- **Update**: Otomatis via aplikasi

### 2. Tabel Archive (`attendance_archives`) - 2-5 Tahun
- **Isi**: Data detail 2-5 tahun yang lalu
- **Tujuan**: Backup data detail untuk keperluan audit
- **Update**: Otomatis via scheduler bulanan

### 3. Tabel Summary (`attendance_summaries`) - 5-10 Tahun
- **Isi**: Ringkasan bulanan (total hari, jam, dll)
- **Tujuan**: Laporan historis tanpa detail harian
- **Update**: Otomatis via scheduler bulanan

### 4. Data >10 Tahun
- **Status**: Dihapus otomatis
- **Alasan**: Sesuai kebijakan retensi data

## 🚀 Instalasi

### 1. Jalankan Migration
```bash
php artisan migrate
```

Ini akan membuat 2 tabel baru:
- `attendance_archives`
- `attendance_summaries`

### 2. Setup Cron Job (Production)
Tambahkan ke crontab server:
```bash
* * * * * cd /path-to-your-project && php artisan schedule:run >> /dev/null 2>&1
```

### 3. Test Archiving (Dry Run)
```bash
php artisan attendance:archive --dry-run
```

Ini akan menampilkan preview tanpa mengubah data.

### 4. Jalankan Archiving Manual
```bash
php artisan attendance:archive
```

## 📅 Jadwal Otomatis

Archiving berjalan otomatis setiap bulan:
- **Tanggal**: 1 setiap bulan
- **Waktu**: 02:00 pagi
- **Lokasi config**: `routes/console.php`

Untuk mengubah jadwal, edit file `routes/console.php`:
```php
// Contoh: Jalankan setiap minggu
Schedule::command('attendance:archive')->weekly();

// Contoh: Jalankan setiap hari jam 3 pagi
Schedule::command('attendance:archive')->dailyAt('03:00');
```

## 🔍 Monitoring

### Lihat Statistik Database
```bash
php artisan attendance:stats
```

Output:
```
📊 Statistik Database Absensi

🗄️  Tabel Utama (attendances)
Total Records: 50,000
Oldest Date: 2024-01-27
Newest Date: 2026-01-27
Size (MB): 15.5

📦 Tabel Archive (attendance_archives)
Total Records: 120,000
Oldest Date: 2021-01-27
Newest Date: 2024-01-26
Size (MB): 35.2

📊 Tabel Summary (attendance_summaries)
Total Records: 1,200
Years Covered: 5
Size (MB): 0.8

💾 Total Size: 51.5 MB
```

## 💻 Penggunaan di Aplikasi

### Query Data Historis (Semua Sumber)
```php
use App\Services\AttendanceService;

$service = new AttendanceService();

// Get attendance dari semua tabel
$history = $service->getAttendanceHistory(
    memberId: 1,
    startDate: '2020-01-01',
    endDate: '2026-01-27'
);

// $history['detail'] = Data dari tabel utama
// $history['archive'] = Data dari archive
// $history['summary'] = Data summary bulanan
```

### Hitung Total Kehadiran
```php
$service = new AttendanceService();

// Total kehadiran tahun ini
$total = $service->getTotalAttendance(memberId: 1);

// Total kehadiran tahun tertentu
$total2020 = $service->getTotalAttendance(memberId: 1, year: 2020);
```

## ⚙️ Kustomisasi

### Ubah Timeline Archiving

Edit file `app/Console/Commands/ArchiveAttendances.php`:

```php
// Ubah dari 2 tahun ke 1 tahun
$twoYearsAgo = Carbon::now()->subYears(1); // Ganti 2 jadi 1

// Ubah dari 5 tahun ke 3 tahun
$fiveYearsAgo = Carbon::now()->subYears(3); // Ganti 5 jadi 3

// Ubah dari 10 tahun ke 7 tahun
$tenYearsAgo = Carbon::now()->subYears(7); // Ganti 10 jadi 7
```

### Nonaktifkan Auto-Delete Data >10 Tahun

Comment bagian ini di `ArchiveAttendances.php`:
```php
// Step 3: Hapus data >10 tahun
// $this->deleteAncientData($isDryRun); // Comment baris ini
```

## 🛡️ Backup & Recovery

### Backup Manual Sebelum Archiving
```bash
# Backup database
mysqldump -u username -p database_name > backup_$(date +%Y%m%d).sql

# Atau backup hanya tabel attendances
mysqldump -u username -p database_name attendances > attendances_backup.sql
```

### Recovery Data dari Archive
```php
// Jika perlu restore data dari archive ke main table
DB::table('attendances')->insert(
    DB::table('attendance_archives')
        ->where('date', '>=', '2023-01-01')
        ->get()
        ->toArray()
);
```

## 📈 Estimasi Penghematan

Contoh perhitungan untuk gym dengan 500 member aktif:

**Tanpa Archiving (10 tahun):**
- 500 member × 300 hari/tahun × 10 tahun = 1,500,000 records
- Estimasi size: ~450 MB

**Dengan Archiving:**
- Main (2 tahun): 300,000 records (~90 MB)
- Archive (3 tahun): 450,000 records (~135 MB)
- Summary (5 tahun): 30,000 records (~5 MB)
- **Total: ~230 MB (Hemat 49%)**

## ⚠️ Troubleshooting

### Command Tidak Ditemukan
```bash
php artisan clear-compiled
composer dump-autoload
```

### Scheduler Tidak Jalan
Pastikan cron job sudah disetup:
```bash
crontab -l  # Lihat cron jobs
crontab -e  # Edit cron jobs
```

### Data Tidak Ter-archive
1. Cek apakah ada data yang memenuhi kriteria:
   ```bash
   php artisan attendance:archive --dry-run
   ```

2. Cek log Laravel:
   ```bash
   tail -f storage/logs/laravel.log
   ```

## 📞 Support

Jika ada pertanyaan atau issue:
1. Cek log: `storage/logs/laravel.log`
2. Test dengan dry-run: `php artisan attendance:archive --dry-run`
3. Lihat stats: `php artisan attendance:stats`

---

**Dibuat**: 27 Januari 2026
**Versi**: 1.0
