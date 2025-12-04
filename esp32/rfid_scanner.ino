/*
 * ESP32 RFID Scanner untuk Bricks Gym
 * Menggunakan MFRC522 + LCD I2C 16x2
 * 
 * Wiring:
 * RFID MFRC522:
 * - SDA  -> GPIO 5
 * - SCK  -> GPIO 18
 * - MOSI -> GPIO 23
 * - MISO -> GPIO 19
 * - RST  -> GPIO 22
 * - 3.3V -> 3.3V
 * - GND  -> GND
 * 
 * LCD I2C:
 * - SDA -> GPIO 16
 * - SCL -> GPIO 17
 * - VCC -> 5V
 * - GND -> GND
 * 
 * Buzzer:
 * - Positif -> GPIO 14
 * - Negatif -> GND
 */

#include <Arduino.h>
#include <WiFi.h>
#include <SPI.h>
#include <MFRC522.h>
#include <HTTPClient.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <ArduinoJson.h>

// ========== WIFI ==============
const char* ssid     = "Khusus_fillah";
const char* password = "QWEASD@swq14";

// ========== SERVER ENDPOINT ==========
// Ganti IP_KOMPUTER dengan IP address komputer yang menjalankan Laravel
// Cek dengan perintah: ipconfig (Windows) atau ifconfig (Linux/Mac)
String serverName = "http://192.168.1.100:8000/api/rfid/scan";

// ========== LCD ==========
LiquidCrystal_I2C lcd(0x27, 16, 2);

// ========== RFID + BUZZER ==========
#define RST_PIN  22
#define SS_PIN   5
#define BUZZER   14

MFRC522 mfrc522(SS_PIN, RST_PIN);

// ========== SETUP ==========
void setup() {
    Serial.begin(115200);
    delay(10);
    
    // LCD Init
    Wire.begin(16, 17);
    lcd.begin(16, 2);
    lcd.backlight();
    lcd.setCursor(0, 0);
    lcd.print("  Bricks Gym");
    lcd.setCursor(0, 1);
    lcd.print("Connecting WiFi");
    
    // Buzzer Init
    pinMode(BUZZER, OUTPUT);
    digitalWrite(BUZZER, LOW);
    
    // RFID Init
    SPI.begin();
    mfrc522.PCD_Init();
    
    // WiFi Connect
    WiFi.begin(ssid, password);
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 30) {
        delay(500);
        Serial.print(".");
        attempts++;
    }
    
    if (WiFi.status() == WL_CONNECTED) {
        Serial.println("\nWiFi Connected!");
        Serial.print("IP: ");
        Serial.println(WiFi.localIP());
        
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("WiFi Connected!");
        lcd.setCursor(0, 1);
        lcd.print(WiFi.localIP());
        
        beepSuccess();
        delay(2000);
    } else {
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("WiFi Failed!");
        beepError();
    }
}

// ========== LOOP ==========
void loop() {
    // Tampilkan pesan scan
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("  Bricks Gym");
    lcd.setCursor(0, 1);
    lcd.print("Tap Kartu Anda..");
    
    // Cek kartu
    if (!mfrc522.PICC_IsNewCardPresent()) return;
    if (!mfrc522.PICC_ReadCardSerial()) return;
    
    // Baca UID kartu
    String rfidUid = getCardUID();
    Serial.println("Card UID: " + rfidUid);
    
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Memproses...");
    lcd.setCursor(0, 1);
    lcd.print(rfidUid);
    
    // Kirim ke server
    sendToServer(rfidUid);
    
    // Lepaskan kartu
    mfrc522.PICC_HaltA();
    mfrc522.PCD_StopCrypto1();
    
    delay(2000);
}

// ========== GET CARD UID ==========
String getCardUID() {
    String uid = "";
    for (byte i = 0; i < mfrc522.uid.size; i++) {
        if (mfrc522.uid.uidByte[i] < 0x10) {
            uid += "0";
        }
        uid += String(mfrc522.uid.uidByte[i], HEX);
    }
    uid.toUpperCase();
    return uid;
}

// ========== SEND TO SERVER ==========
void sendToServer(String rfidUid) {
    if (WiFi.status() != WL_CONNECTED) {
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("WiFi Error!");
        beepError();
        return;
    }
    
    HTTPClient http;
    http.begin(serverName);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("Accept", "application/json");
    http.setTimeout(10000);
    
    // Buat JSON payload
    String payload = "{\"rfid_uid\":\"" + rfidUid + "\"}";
    Serial.println("Sending: " + payload);
    
    int httpCode = http.POST(payload);
    
    if (httpCode > 0) {
        String response = http.getString();
        Serial.println("Response: " + response);
        
        // Parse JSON
        StaticJsonDocument<512> doc;
        DeserializationError error = deserializeJson(doc, response);
        
        if (!error) {
            bool success = doc["success"];
            const char* message = doc["message"];
            const char* type = doc["type"] | "";
            
            lcd.clear();
            
            if (success) {
                // Berhasil
                if (doc.containsKey("member")) {
                    const char* name = doc["member"]["name"];
                    
                    lcd.setCursor(0, 0);
                    lcd.print("Halo,");
                    lcd.setCursor(0, 1);
                    
                    // Potong nama jika terlalu panjang
                    String memberName = String(name);
                    if (memberName.length() > 16) {
                        memberName = memberName.substring(0, 16);
                    }
                    lcd.print(memberName);
                    
                    if (strcmp(type, "check_in") == 0) {
                        Serial.println("Check-in berhasil: " + memberName);
                        beepSuccess();
                    } else if (strcmp(type, "already") == 0) {
                        Serial.println("Sudah absen: " + memberName);
                        beepAlready();
                    }
                }
            } else {
                // Gagal
                lcd.setCursor(0, 0);
                
                if (httpCode == 404) {
                    lcd.print("Kartu Tidak");
                    lcd.setCursor(0, 1);
                    lcd.print("Terdaftar!");
                } else if (httpCode == 403) {
                    lcd.print("Member Tidak");
                    lcd.setCursor(0, 1);
                    lcd.print("Aktif/Expired!");
                } else {
                    lcd.print("Gagal!");
                    lcd.setCursor(0, 1);
                    lcd.print(message);
                }
                beepError();
            }
        } else {
            lcd.clear();
            lcd.setCursor(0, 0);
            lcd.print("Parse Error");
            beepError();
        }
    } else {
        Serial.println("HTTP Error: " + String(httpCode));
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("Server Error");
        lcd.setCursor(0, 1);
        lcd.print("Code: " + String(httpCode));
        beepError();
    }
    
    http.end();
}

// ========== BUZZER FUNCTIONS ==========
void beepSuccess() {
    // 1 beep panjang
    digitalWrite(BUZZER, HIGH);
    delay(200);
    digitalWrite(BUZZER, LOW);
}

void beepAlready() {
    // 2 beep pendek
    for (int i = 0; i < 2; i++) {
        digitalWrite(BUZZER, HIGH);
        delay(100);
        digitalWrite(BUZZER, LOW);
        delay(100);
    }
}

void beepError() {
    // 3 beep cepat
    for (int i = 0; i < 3; i++) {
        digitalWrite(BUZZER, HIGH);
        delay(80);
        digitalWrite(BUZZER, LOW);
        delay(80);
    }
}
