# OpenCV Person Counter System

Ein verteiltes Personenzähler-System mit Raspberry Pi Kamera-Nodes und zentralem Linux Debian Server.

## Architektur

### Raspberry Pi Kamera-Nodes
- **Funktion**: Video-Aufnahme und OpenCV-Personenerkennung
- **Hardware**: Raspberry Pi 4 + High Quality Kamera
- **Software**: Python 3 + OpenCV
- **Kommunikation**: TCP-Socket zum zentralen Server

### Linux Debian Zentral-Server
- **Funktion**: Web-Interface, API, Datenverarbeitung
- **Hardware**: Linux Debian System (VM oder physisch)
- **Software**: Node.js + Express + WebSocket
- **Kommunikation**: HTTP API + WebSocket für Frontend

## Features

- **Multi-Kamera Support**: Unterstützung für mehrere Kameras je nach Eingangsbreite
- **Verteilte Architektur**: Raspberry Pi Nodes + zentraler Linux Server
- **OpenCV Integration**: Echte Personenerkennung mit konfigurierbaren Parametern
- **TCP-Kommunikation**: Effiziente Datenübertragung zwischen Pi und Server
- **Zonenkonfiguration**: Separate Ein- und Ausgangsbereiche pro Kamera
- **Alarm-System**: Benachrichtigungen bei falscher Bereichsnutzung
- **Real-Time Dashboard**: Live-Überwachung aller Kameras und Statistiken
- **HTTP API**: Externe Schnittstellen für Durchsagen und LED-Wand-Steuerung
- **Companion Integration**: Steuerung von LED-Displays über Companion

## Quick Start

### 1. Linux Server Setup
```bash
# Repository klonen
git clone <repository-url>

# Dependencies installieren
npm install

# Server starten
npm run dev
```

### 2. Raspberry Pi Setup
```bash
# Auf jedem Raspberry Pi
curl -O https://raw.githubusercontent.com/your-repo/raspberry-pi/install.sh
chmod +x install.sh
sudo ./install.sh

# Kamera konfigurieren
sudo nano /etc/systemd/system/person-counter-camera.service
# Environment=CAMERA_ID=haupteingang
# Environment=SERVER_HOST=192.168.1.100

# Service starten
sudo systemctl enable person-counter-camera
sudo systemctl start person-counter-camera
```

## API Endpoints

### Personenzählung
- `GET /api/count` - Aktuelle Personenzahl abrufen
- `POST /api/reset` - Zähler zurücksetzen

### Externe Steuerung
- `POST /api/announcement` - Durchsage abspielen
- `POST /api/led-display` - LED-Wand via Companion steuern

### Kamera Management
- `GET /api/cameras` - Alle Kameras abrufen
- `PUT /api/cameras/:id` - Kamera-Konfiguration aktualisieren

## TCP Kamera-Protokoll

### Kamera-Registrierung
```json
{
  "type": "camera_registration",
  "camera_id": "haupteingang",
  "timestamp": "2025-01-27T10:30:00.000Z"
}
```

### Personenerkennung
```json
{
  "type": "person_detection",
  "camera_id": "haupteingang",
  "detections": [
    {
      "x": 150, "y": 200, "width": 60, "height": 120,
      "center_x": 180, "center_y": 260,
      "zone": "entry",
      "confidence": 0.85,
      "timestamp": "2025-01-27T10:30:00.123Z"
    }
  ]
}
```

### Heartbeat
```json
{
  "type": "heartbeat",
  "camera_id": "haupteingang",
  "status": "online",
  "timestamp": "2025-01-27T10:30:00.000Z"
}
```

## Beispiel API Calls

### Durchsage abspielen
```bash
curl -X POST http://localhost:3001/api/announcement \
  -H "Content-Type: application/json" \
  -d '{"message": "Bitte verlassen Sie das Gebäude", "volume": 90}'
```

### LED-Wand steuern
```bash
curl -X POST http://localhost:3001/api/led-display \
  -H "Content-Type: application/json" \
  -d '{"action": "play_video", "content": "emergency_exit.mp4", "companionIP": "192.168.1.100"}'
```

### Kamera-Konfiguration aktualisieren
```bash
curl -X PUT http://localhost:3001/api/cameras/haupteingang \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Haupteingang Nord",
    "type": "both",
    "zones": {
      "entry": {"enabled": true, "x": 100, "y": 200, "width": 300, "height": 100},
      "exit": {"enabled": true, "x": 500, "y": 200, "width": 300, "height": 100}
    },
    "sensitivity": 0.8
  }'
```

## Netzwerk-Architektur

### Ports
- **3001**: HTTP API und WebSocket (Linux Server)
- **8888**: TCP Kamera-Server (Linux Server)
- **80/443**: Web-Interface (optional mit Nginx)

### Beispiel-Netzwerk
```bash
# Linux Server
192.168.1.100:3001  # Web API
192.168.1.100:8888  # TCP Camera Server

# Raspberry Pi Nodes
192.168.1.10  # Haupteingang
192.168.1.11  # Seiteneingang  
192.168.1.12  # Notausgang

# Externe Systeme
192.168.1.200  # Companion Server
192.168.1.150  # Durchsage-System
```

## Monitoring

### System-Status prüfen
```bash
# Server Status
pm2 status
pm2 logs person-counter-api

# Kamera-Nodes Status (auf jedem Pi)
sudo systemctl status person-counter-camera
sudo journalctl -u person-counter-camera -f
```

### Performance-Monitoring
```bash
# Netzwerk-Traffic überwachen
sudo iftop -i eth0

# CPU/Memory auf Pi
htop

# Temperatur überwachen
watch -n 1 vcgencmd measure_temp
```

## Produktions-Deployment

Das verteilte System unterstützt:
- **Raspberry Pi Nodes**: Automatischer Start beim Boot
- **Linux Server**: PM2 Prozess-Management
- Automatischer Start beim Boot
- Systemd Service Integration
- TCP-Verbindung mit Auto-Reconnect
- Log-Rotation
- Fehler-Recovery
- Remote-Monitoring
- Horizontal Skalierung

## Vorteile der verteilten Architektur

1. **Performance**: OpenCV-Verarbeitung auf dedizierten Pi-Nodes
2. **Skalierbarkeit**: Einfaches Hinzufügen neuer Kamera-Nodes
3. **Ausfallsicherheit**: Server und Kameras unabhängig voneinander
4. **Wartung**: Separate Updates für Kameras und Server möglich
5. **Netzwerk-Effizienz**: Nur Erkennungsdaten werden übertragen, nicht Videos

## Sicherheit

- API Token Authentication
- Verschlüsselte Datenübertragung
- Zugriffsrechte-Management
- Audit-Logging