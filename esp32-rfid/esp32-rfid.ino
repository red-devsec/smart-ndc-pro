/*
 * ESP32 RFID Pointing Reader - SMART NDC Pro
 *
 * Hardware: ESP32 + MFRC522 + LED green/red + buzzer
 * Wiring:
 *   MFRC522 -> ESP32
 *   SDA     -> GPIO5
 *   SCK     -> GPIO18
 *   MOSI    -> GPIO23
 *   MISO    -> GPIO19
 *   IRQ     -> not connected
 *   GND     -> GND
 *   RST     -> GPIO4
 *   3.3V    -> 3.3V
 *   LED green -> GPIO2
 *   LED red   -> GPIO15
 *   Buzzer    -> GPIO16
 *
 * Features:
 *   - LittleFS-persisted config.json (WiFi, API URL, location, readerId)
 *   - LittleFS-persisted offline.log (buffered pointages survive reboot)
 *   - AP setup portal on first boot or config button press (GPIO0)
 *   - SNTP ISO8601 timestamps
 *   - Card-type detection (MIFARE Classic / DESFire) reported to API
 *   - Debounce (3s between same-UID reads)
 *   - 403-aware sync (drop unauthorized cards from buffer)
 *   - WiFi auto-reconnect
 *   - Sync-at-startup after reboot
 *
 * Required Arduino libraries:
 *   - MFRC522 by GithubCommunity
 *   - ArduinoJson by Benoit Blanchon
 *   - LittleFS_esp32 (built into ESP32 core >= 2.0.0)
 */

#include <SPI.h>
#include <MFRC522.h>
#include <WiFi.h>
#include <WiFiClient.h>
#include <WebServer.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <LittleFS.h>
#include <time.h>

// ---------------- Pin definitions ----------------
#define RST_PIN       4
#define SS_PIN        5
#define LED_GREEN     2
#define LED_RED       15
#define BUZZER        16
#define CONFIG_BTN    0   // BOOT button used to force AP config mode

MFRC522 mfrc522(SS_PIN, RST_PIN);
WebServer server(80);

// ---------------- Config ----------------
struct Config {
  String ssid;
  String password;
  String apiUrl;
  String location;   // "office" or "warehouse"
  String readerId;   // unique reader identifier
};

Config cfg;

// ---------------- Offline buffer (LittleFS) ----------------
const char* OFFLINE_FILE = "/offline.log";
const int OFFLINE_MAX = 200;

// ---------------- Debounce ----------------
String lastUid = "";
unsigned long lastUidTime = 0;
const unsigned long DEBOUNCE_MS = 3000;

// ---------------- NTP ----------------
const char* NTP_SERVER = "pool.ntp.org";
const long  GMT_OFFSET_SEC = 3600;       // UTC+1 (Morocco)
const int   DST_OFFSET_SEC = 0;

// ============================================================
// Utility helpers
// ============================================================
String isoTimestamp() {
  time_t now = time(nullptr);
  if (now < 100000) return String(0);
  struct tm t;
  gmtime_r(&now, &t);
  char buf[25];
  strftime(buf, sizeof(buf), "%Y-%m-%dT%H:%M:%SZ", &t);
  return String(buf);
}

String cardType() {
  MFRC522::PICC_Type t = mfrc522.PICC_GetType(mfrc522.uid.sak);
  switch (t) {
    case MFRC522::PICC_TYPE_MIFARE_MINI:
    case MFRC522::PICC_TYPE_MIFARE_1K:
    case MFRC522::PICC_TYPE_MIFARE_4K:
      return "MIFARE_CLASSIC";
    case MFRC522::PICC_TYPE_MIFARE_DESFIRE:
      return "MIFARE_DESFIRE";
    default:
      return "UNKNOWN";
  }
}

String getCardUID() {
  String uid = "";
  for (byte i = 0; i < mfrc522.uid.size; i++) {
    if (mfrc522.uid.uidByte[i] < 0x10) uid += "0";
    uid += String(mfrc522.uid.uidByte[i], HEX);
    if (i < mfrc522.uid.size - 1) uid += ":";
  }
  uid.toUpperCase();
  return uid;
}

// ============================================================
// LED / buzzer feedback
// ============================================================
void feedbackSuccess() {
  digitalWrite(LED_GREEN, HIGH);
  digitalWrite(BUZZER, HIGH); delay(150);
  digitalWrite(BUZZER, LOW);
  delay(100);
  digitalWrite(LED_GREEN, LOW);
}

void feedbackFailure() {
  for (int i = 0; i < 2; i++) {
    digitalWrite(LED_RED, HIGH);
    digitalWrite(BUZZER, HIGH); delay(200);
    digitalWrite(BUZZER, LOW);
    digitalWrite(LED_RED, LOW);
    delay(150);
  }
}

void feedbackOffline() {
  digitalWrite(LED_GREEN, HIGH);
  digitalWrite(LED_RED, HIGH);
  delay(300);
  digitalWrite(LED_GREEN, LOW);
  digitalWrite(LED_RED, LOW);
}

// ============================================================
// Config persistence (LittleFS)
// ============================================================
bool loadConfig() {
  if (!LittleFS.exists("/config.json")) return false;
  File f = LittleFS.open("/config.json", "r");
  if (!f) return false;
  StaticJsonDocument<512> doc;
  DeserializationError err = deserializeJson(doc, f);
  f.close();
  if (err) return false;
  cfg.ssid     = doc["ssid"]     | "";
  cfg.password = doc["password"] | "";
  cfg.apiUrl   = doc["apiUrl"]   | "";
  cfg.location = doc["location"] | "office";
  cfg.readerId = doc["readerId"] | String((uint32_t)ESP.getEfuseMac(), HEX);
  return cfg.ssid.length() > 0;
}

void saveConfig(const Config& c) {
  StaticJsonDocument<512> doc;
  doc["ssid"]     = c.ssid;
  doc["password"] = c.password;
  doc["apiUrl"]   = c.apiUrl;
  doc["location"] = c.location;
  doc["readerId"] = c.readerId;
  File f = LittleFS.open("/config.json", "w");
  if (f) {
    serializeJson(doc, f);
    f.close();
  }
}

// ============================================================
// AP configuration portal
// ============================================================
void handleConfigPage() {
  String html = R"=====(<!DOCTYPE html><html><head><meta charset='utf-8'>
<title>Smart NDC - Config Lecteur RFID</title>
<style>body{font-family:sans-serif;max-width:420px;margin:40px auto;padding:20px}
input,select,button{display:block;width:100%;margin:8px 0;padding:10px;box-sizing:border-box}
button{background:#2563eb;color:#fff;border:none;border-radius:4px}</style></head>
<body><h2>Configuration du lecteur RFID</h2>
<form action='/save' method='post'>
<label>WiFi SSID</label><input name='ssid' required>
<label>WiFi Mot de passe</label><input name='password' type='password'>
<label>URL API</label><input name='apiUrl' value='http://158.220.104.121:3001/api/rfid/scan' required>
<label>Emplacement</label><select name='location'>
<option value='office'>Bureau</option><option value='warehouse'>Entrepot</option></select>
<label>ID Lecteur</label><input name='readerId'>
<button type='submit'>Enregistrer &amp; Redemarrer</button>
</form></body></html>)=====";
  server.send(200, "text/html", html);
}

void handleSave() {
  Config c;
  c.ssid     = server.arg("ssid");
  c.password = server.arg("password");
  c.apiUrl   = server.arg("apiUrl");
  c.location = server.arg("location");
  c.readerId = server.arg("readerId");
  if (c.readerId.length() == 0) {
    c.readerId = String((uint32_t)ESP.getEfuseMac(), HEX);
  }
  saveConfig(c);
  server.send(200, "text/html", "<h2>Sauvegarde OK. Redemarrage...</h2>");
  delay(1500);
  ESP.restart();
}

void startAPConfig() {
  String apName = "SmartNDC-Reader-" + String((uint32_t)ESP.getEfuseMac(), HEX);
  WiFi.softAP(apName.c_str());
  Serial.println("AP mode: " + apName + " @ " + WiFi.softAPIP().toString());
  server.on("/",   handleConfigPage);
  server.on("/save", handleSave);
  server.begin();
  while (true) {
    server.handleClient();
    delay(5);
  }
}

// ============================================================
// WiFi
// ============================================================
void connectWiFi() {
  if (cfg.ssid.length() == 0) { startAPConfig(); return; }
  WiFi.mode(WIFI_STA);
  WiFi.begin(cfg.ssid.c_str(), cfg.password.c_str());
  Serial.print("Connexion WiFi");
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 30) {
    delay(500); Serial.print("."); attempts++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi OK: " + WiFi.localIP().toString());
    configTime(GMT_OFFSET_SEC, DST_OFFSET_SEC, NTP_SERVER);
  } else {
    Serial.println("\nWiFi echec - mode degrade");
  }
}

void ensureWiFi() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("Reconnexion WiFi...");
    WiFi.disconnect();
    WiFi.reconnect();
    delay(2000);
  }
}

// ============================================================
// API send
// ============================================================
// Returns: 1 = success, 0 = transient failure (keep in buffer), -1 = 403 (drop)
int sendToAPI(const String& uid, const String& cardTypeStr, const String& ts) {
  if (WiFi.status() != WL_CONNECTED) return 0;
  HTTPClient http;
  http.begin(cfg.apiUrl);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(3000);

  StaticJsonDocument<256> doc;
  doc["uid"]       = uid;
  doc["location"]  = cfg.location;
  doc["readerId"]  = cfg.readerId;
  doc["cardType"]  = cardTypeStr;
  doc["timestamp"] = ts;
  String body;
  serializeJson(doc, body);

  int code = http.POST(body);
  String resp = http.getString();
  http.end();

  Serial.println("API " + String(code) + ": " + resp);
  if (code == 200) return 1;
  if (code == 403) return -1; // unauthorized - drop from buffer
  return 0;                   // transient - retry later
}

// ============================================================
// Offline buffer (LittleFS append + read + truncate)
// ============================================================
void appendOffline(const String& line) {
  File f = LittleFS.open(OFFLINE_FILE, "a");
  if (!f) return;
  f.println(line);
  f.close();
}

int countOffline() {
  File f = LittleFS.open(OFFLINE_FILE, "r");
  if (!f) return 0;
  int n = 0;
  while (f.available()) { if (f.readStringUntil('\n').length() > 0) n++; }
  f.close();
  return n;
}

void syncOffline() {
  if (WiFi.status() != WL_CONNECTED) return;
  File f = LittleFS.open(OFFLINE_FILE, "r");
  if (!f) return;

  String remaining = "";
  int synced = 0, dropped = 0;
  while (f.available()) {
    String line = f.readStringUntil('\n');
    line.trim();
    if (line.length() == 0) continue;

    // Parse: uid|cardType|ts
    int p1 = line.indexOf('|');
    int p2 = line.indexOf('|', p1 + 1);
    String uid = line.substring(0, p1);
    String ct  = line.substring(p1 + 1, p2);
    String ts  = line.substring(p2 + 1);

    int r = sendToAPI(uid, ct, ts);
    if (r == 1) synced++;
    else if (r == -1) { dropped++; continue; }
    else { remaining += line + "\n"; } // keep for next sync
    delay(150);
  }
  f.close();

  // Rewrite remaining unsent records
  File out = LittleFS.open(OFFLINE_FILE, "w");
  if (out) { out.print(remaining); out.close(); }
  Serial.println("Sync: " + String(synced) + " envoyes, " + String(dropped) + " droppes, " + String(remaining.length() > 0 ? "reste" : "0") + " restants");
}

// ============================================================
// Setup / loop
// ============================================================
void setup() {
  Serial.begin(115200);
  pinMode(LED_GREEN, OUTPUT);
  pinMode(LED_RED, OUTPUT);
  pinMode(BUZZER, OUTPUT);
  pinMode(CONFIG_BTN, INPUT_PULLUP);

  digitalWrite(LED_GREEN, LOW);
  digitalWrite(LED_RED, LOW);
  digitalWrite(BUZZER, LOW);

  // Startup LED test
  digitalWrite(LED_GREEN, HIGH); delay(250); digitalWrite(LED_GREEN, LOW);
  digitalWrite(LED_RED, HIGH);   delay(250); digitalWrite(LED_RED, LOW);

  if (!LittleFS.begin(true)) {
    Serial.println("LittleFS mount failed");
  }

  // Force AP config if BOOT button held > 2s, or no config saved
  bool btnHeld = (digitalRead(CONFIG_BTN) == LOW);
  unsigned long start = millis();
  while (digitalRead(CONFIG_BTN) == LOW && millis() - start < 2000) { delay(10); }
  if (millis() - start >= 2000) btnHeld = true;

  if (btnHeld || !loadConfig()) {
    Serial.println("Mode configuration AP");
    startAPConfig();
    return;
  }

  Serial.println("Config chargee: " + cfg.ssid + " @ " + cfg.location);
  SPI.begin();
  mfrc522.PCD_Init();
  connectWiFi();
  // Sync any offline records from before reboot
  delay(2000);
  syncOffline();
}

void loop() {
  static unsigned long lastSync = 0;

  // Periodic sync + WiFi keepalive
  if (millis() - lastSync > 30000) {
    ensureWiFi();
    syncOffline();
    lastSync = millis();
  }

  // Check for new card
  if (!mfrc522.PICC_IsNewCardPresent() || !mfrc522.PICC_ReadCardSerial()) {
    return;
  }

  String uid = getCardUID();
  String ct  = cardType();
  String ts  = isoTimestamp();

  // Debounce same card
  if (uid == lastUid && millis() - lastUidTime < DEBOUNCE_MS) {
    mfrc522.PICC_HaltA();
    return;
  }
  lastUid = uid;
  lastUidTime = millis();

  Serial.println("Carte: " + uid + " (" + ct + ") @ " + ts);

  int r = sendToAPI(uid, ct, ts);
  if (r == 1) {
    Serial.println("OK");
    feedbackSuccess();
  } else if (r == -1) {
    Serial.println("Refuse (403)");
    feedbackFailure();
  } else {
    // Transient/offline -> buffer
    String line = uid + "|" + ct + "|" + ts;
    if (countOffline() < OFFLINE_MAX) {
      appendOffline(line);
      Serial.println("Sauvegarde locale");
    } else {
      Serial.println("Buffer plein!");
    }
    feedbackOffline();
  }

  mfrc522.PICC_HaltA();
  delay(800);
}