# Deployment Guide: Distributed Person Counter System

## Architektur Übersicht

Das System besteht aus zwei Hauptkomponenten:

### 1. Raspberry Pi Kamera-Nodes
- **Zweck**: Video-Aufnahme und OpenCV-Personenerkennung
- **Hardware**: Raspberry Pi 4 + High Quality Kamera
- **Software**: Python 3 + OpenCV
- **Kommunikation**: TCP-Socket zum zentralen Server

### 2. Linux Debian Zentral-Server
- **Zweck**: Web-Interface, API, Datenverarbeitung
- **Hardware**: Linux Debian System (VM oder physisch)
- **Software**: Node.js + Express + WebSocket
- **Kommunikation**: HTTP API + WebSocket für Frontend

## Raspberry Pi Setup

### Hardware Installation
1. Raspberry Pi 4 mit mindestens 4GB RAM
2. High Quality Kamera-Modul anschließen
3. Kamera lotrecht über Eingang/Ausgang montieren (2,5-3m Höhe)
4. Netzwerk-Verbindung (Ethernet empfohlen)

### Software Installation
```bash
# Auf jedem Raspberry Pi ausführen
curl -O https://raw.githubusercontent.com/your-repo/install.sh
chmod +x install.sh
sudo ./install.sh
```

### Kamera-Node Konfiguration
```bash
# Kamera ID und Server IP konfigurieren
sudo nano /etc/systemd/system/person-counter-camera.service

# Beispiel-Konfiguration:
Environment=CAMERA_ID=haupteingang
Environment=SERVER_HOST=192.168.1.100

# Service starten
sudo systemctl enable person-counter-camera
sudo systemctl start person-counter-camera

# Status prüfen
sudo systemctl status person-counter-camera
```

### Mehrere Kameras pro Pi
```bash
# Für mehrere Kameras am selben Pi
sudo cp /etc/systemd/system/person-counter-camera.service /etc/systemd/system/person-counter-camera-2.service

# Service 2 konfigurieren
sudo nano /etc/systemd/system/person-counter-camera-2.service
# Environment=CAMERA_ID=seiteneingang
# Environment=CAMERA_INDEX=1

sudo systemctl enable person-counter-camera-2
sudo systemctl start person-counter-camera-2
```

## Linux Debian Server Setup

### System Anforderungen
- Linux Debian 11+ oder Ubuntu 20.04+
- Node.js 18+
- Mindestens 2GB RAM
- Netzwerk-Zugang zu allen Raspberry Pi Nodes

### Installation
```bash
# Node.js installieren
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Projekt klonen und installieren
git clone <repository-url>
cd opencv-person-counter
npm install

# Produktions-Build
npm run build

# PM2 für Prozess-Management installieren
sudo npm install -g pm2

# Service starten
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Netzwerk-Konfiguration
```bash
# Firewall-Regeln
sudo ufw allow 3001/tcp  # HTTP API
sudo ufw allow 8888/tcp  # TCP Camera Server
sudo ufw allow 80/tcp    # Web Interface
sudo ufw allow 443/tcp   # HTTPS (optional)
```

## Kamera-Kalibrierung

### 1. Physische Installation
- Kamera exakt lotrecht über Durchgang montieren
- Höhe: 2,5-3 Meter für optimale Erkennung
- Sichtfeld sollte kompletten Durchgangsbereich abdecken
- Beleuchtung prüfen (min. 200 Lux)

### 2. Software-Kalibrierung
1. Web-Interface öffnen: `http://server-ip:3001`
2. Zu "Kameras" navigieren
3. Kamera auswählen und Erkennungszonen konfigurieren:
   - **Eingangszone**: Bereich wo Personen das Gelände betreten
   - **Ausgangszone**: Bereich wo Personen das Gelände verlassen
4. Empfindlichkeit anpassen (0.1 = niedrig, 1.0 = hoch)
5. Min/Max Personengröße in Pixeln einstellen

### 3. Test und Validierung
```bash
# Live-Test durchführen
curl http://server-ip:3001/api/count

# Zähler zurücksetzen
curl -X POST http://server-ip:3001/api/reset

# Kamera-Status prüfen
curl http://server-ip:3001/api/cameras
```

## Externe Integrationen

### Companion LED-Wand Steuerung
```bash
# Video auf LED-Wand abspielen
curl -X POST http://server-ip:3001/api/led-display \
  -H "Content-Type: application/json" \
  -d '{
    "action": "play_video",
    "content": "emergency_exit.mp4",
    "companionIP": "192.168.1.200"
  }'

# Text anzeigen
curl -X POST http://server-ip:3001/api/led-display \
  -H "Content-Type: application/json" \
  -d '{
    "action": "show_text",
    "content": "Gebäude voll - Bitte warten",
    "companionIP": "192.168.1.200"
  }'
```

### Durchsagen-System
```bash
# Durchsage abspielen
curl -X POST http://server-ip:3001/api/announcement \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Bitte verlassen Sie das Gebäude ordnungsgemäß",
    "volume": 85
  }'
```

## Monitoring und Wartung

### Log-Überwachung
```bash
# Server Logs
pm2 logs person-counter

# Raspberry Pi Logs
sudo journalctl -u person-counter-camera -f

# System Status
pm2 status
```

### Backup und Recovery
```bash
# Datenbank-Backup (falls SQLite verwendet)
cp /path/to/database.db /backup/location/

# Konfiguration sichern
tar -czf config-backup.tar.gz /etc/systemd/system/person-counter-*
```

### Performance-Optimierung
- **Raspberry Pi**: GPU-Memory auf 128MB erhöhen
- **Server**: SSD für bessere I/O Performance
- **Netzwerk**: Gigabit Ethernet für mehrere Kameras

## Troubleshooting

### Häufige Probleme

**Kamera nicht erkannt**:
```bash
# Kamera-Interface prüfen
sudo raspi-config
# -> Interface Options -> Camera -> Enable

# Kamera testen
raspistill -o test.jpg
```

**Netzwerk-Verbindung fehlgeschlagen**:
```bash
# Ping zum Server testen
ping 192.168.1.100

# Port-Erreichbarkeit prüfen
telnet 192.168.1.100 8888
```

**OpenCV Performance-Probleme**:
```bash
# GPU-Memory erhöhen
sudo nano /boot/config.txt
# gpu_mem=128

# System neu starten
sudo reboot
```

## Skalierung

### Mehrere Eingänge
- Pro Eingang: 1-3 Kameras je nach Breite
- Jede Kamera als separater Node
- Zentrale Aggregation auf Server

### Load Balancing
- Mehrere Server-Instanzen mit Load Balancer
- Shared Database für konsistente Daten
- Redis für Session-Management

### High Availability
- Redundante Server-Instanzen
- Automatisches Failover
- Backup-Kamera-Nodes