/*
 * File Konfigurasi ESP32 RFID Scanner
 * 
 * CARA PENGGUNAAN:
 * 1. Copy file ini menjadi "config.h"
 * 2. Isi konfigurasi sesuai dengan environment Anda
 * 3. Upload ke ESP32
 */

#ifndef CONFIG_H
#define CONFIG_H

// ========== WIFI CONFIGURATION ==========
// Ganti dengan kredensial WiFi di lokasi gym
const char* WIFI_SSID = "NAMA_WIFI_GYM";
const char* WIFI_PASSWORD = "PASSWORD_WIFI_GYM";

// ========== SERVER CONFIGURATION ==========
// UNTUK DEVELOPMENT (Localhost)
// const char* SERVER_URL = "http://192.168.1.100:8000/api/rfid/scan";

// UNTUK PRODUCTION (Hosting)
// Tanpa SSL:
// const char* SERVER_URL = "http://yourdomain.com/api/rfid/scan";
// 
// Dengan SSL (Recommended):
const char* SERVER_URL = "https://yourdomain.com/api/rfid/scan";

// Set true jika menggunakan HTTPS, false jika HTTP
const bool USE_HTTPS = true;

// ========== OPTIONAL: API KEY ==========
// Jika server memerlukan API key untuk keamanan
// const char* API_KEY = "your-secret-api-key";
// #define USE_API_KEY true

// ========== HARDWARE CONFIGURATION ==========
// Pin RFID
#define RFID_RST_PIN  22
#define RFID_SS_PIN   5

// Pin Buzzer
#define BUZZER_PIN    14

// LCD I2C Address (biasanya 0x27 atau 0x3F)
#define LCD_ADDRESS   0x27

// LCD I2C Pins
#define LCD_SDA_PIN   16
#define LCD_SCL_PIN   17

// ========== TIMEOUT CONFIGURATION ==========
// Timeout untuk HTTP request (dalam milidetik)
#define HTTP_TIMEOUT  15000

// Timeout untuk WiFi connection (dalam detik)
#define WIFI_TIMEOUT  30

// ========== DISPLAY CONFIGURATION ==========
// Nama gym yang ditampilkan di LCD
const char* GYM_NAME = "  Bricks Gym";

// Pesan saat menunggu scan
const char* SCAN_MESSAGE = "Tap Kartu Anda..";

#endif
