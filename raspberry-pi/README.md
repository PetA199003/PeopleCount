# Raspberry Pi Kamera-Node Setup

## Hardware Setup

### Benötigte Komponenten
- Raspberry Pi 4 (4GB+ empfohlen)
- Raspberry Pi High Quality Kamera
- Micro SD-Karte (32GB+)
- Ethernet-Kabel (empfohlen für stabile Verbindung)
- Gehäuse mit Kamera-Halterung

### Physische Installation
1. **Kamera-Montage**: Exakt lotrecht über Durchgang
2. **Höhe**: 2,5-3 Meter für optimale Personenerkennung
3. **Sichtfeld**: Kompletter Durchgangsbereich muss erfasst werden
4. **Beleuchtung**: Mindestens 200 Lux für zuverlässige Erkennung

## Software Installation

### Automatische Installation
```bash
# Installation script herunterladen und ausführen
curl -O https://raw.githubusercontent.com/your-repo/raspberry-pi/install.sh
chmod +x install.sh
sudo ./install.sh
```

### Manuelle Installation
```bash
# System aktualisieren
sudo apt update && sudo apt upgrade -y

# Python und OpenCV installieren
sudo apt install -y python3-pip python3-opencv python3-numpy
sudo apt install -y libopencv-dev python3-opencv

# Kamera-Support aktivieren
sudo raspi-config nonint do_camera 0

# Projekt-Dateien kopieren
mkdir -p /home/pi/person-counter
cp camera-node.py /home/pi/person-counter/
chmod +x /home/pi/person-counter/camera-node.py
```

## Konfiguration

### Systemd Service Setup
```bash
# Service-Datei bearbeiten
sudo nano /etc/systemd/system/person-counter-camera.service

# Kamera ID und Server IP anpassen:
Environment=CAMERA_ID=haupteingang
Environment=SERVER_HOST=192.168.1.100
Environment=CAMERA_INDEX=0

# Service aktivieren
sudo systemctl enable person-counter-camera
sudo systemctl start person-counter-camera
```

### Mehrere Kameras pro Pi
```bash
# Zusätzliche Services für mehrere Kameras
sudo cp /etc/systemd/system/person-counter-camera.service \
        /etc/systemd/system/person-counter-camera-2.service

# Zweite Kamera konfigurieren
sudo nano /etc/systemd/system/person-counter-camera-2.service
# Environment=CAMERA_ID=seiteneingang
# Environment=CAMERA_INDEX=1

sudo systemctl enable person-counter-camera-2
sudo systemctl start person-counter-camera-2
```

## Kamera-Kalibrierung

### 1. Grundeinstellungen
```bash
# Kamera-Parameter optimieren
sudo nano /boot/config.txt

# Folgende Zeilen hinzufügen:
gpu_mem=128
camera_auto_detect=1
dtoverlay=imx477  # Für HQ Camera
```

### 2. OpenCV Parameter
Die Erkennungsparameter können über das Web-Interface angepasst werden:
- **Empfindlichkeit**: 0.7 (Standard)
- **Min. Personengröße**: 50px
- **Max. Personengröße**: 200px

### 3. Zonen-Konfiguration
Erkennungszonen werden automatisch vom Server übertragen:
- **Eingangszone**: Bereich für eintretende Personen
- **Ausgangszone**: Bereich für austretende Personen

## Monitoring

### Service Status prüfen
```bash
# Service Status
sudo systemctl status person-counter-camera

# Live Logs anzeigen
sudo journalctl -u person-counter-camera -f

# Fehler-Logs
sudo journalctl -u person-counter-camera --since "1 hour ago"
```

### Kamera testen
```bash
# Einzelbild aufnehmen
raspistill -o test.jpg

# Video-Stream testen
raspivid -t 10000 -o test.h264

# OpenCV Test
python3 -c "import cv2; print('OpenCV Version:', cv2.__version__)"
```

### Netzwerk-Verbindung prüfen
```bash
# Server erreichbar?
ping 192.168.1.100

# TCP Port offen?
telnet 192.168.1.100 8888

# Netzwerk-Geschwindigkeit testen
iperf3 -c 192.168.1.100
```

## Performance-Optimierung

### GPU-Beschleunigung
```bash
# GPU Memory erhöhen
sudo nano /boot/config.txt
gpu_mem=128

# OpenGL Support
sudo apt install -y mesa-utils

# GPU Status prüfen
vcgencmd get_mem gpu
```

### CPU-Optimierung
```bash
# CPU Governor auf Performance setzen
echo performance | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor

# Temperatur überwachen
vcgencmd measure_temp
```

### Netzwerk-Optimierung
```bash
# Ethernet-Verbindung bevorzugen
sudo nano /etc/dhcpcd.conf
# interface eth0
# static ip_address=192.168.1.10/24
# static routers=192.168.1.1

# WiFi deaktivieren (optional)
sudo systemctl disable wpa_supplicant
```

## Troubleshooting

### Häufige Probleme

**Kamera wird nicht erkannt**:
```bash
# Kamera-Interface aktivieren
sudo raspi-config
# -> Interface Options -> Camera -> Enable

# Hardware-Verbindung prüfen
vcgencmd get_camera

# Kamera-Module laden
sudo modprobe bcm2835-v4l2
```

**OpenCV Fehler**:
```bash
# OpenCV neu installieren
sudo apt remove python3-opencv
sudo apt install python3-opencv

# Alternative Installation
pip3 install opencv-python==4.5.5.64
```

**Verbindung zum Server fehlgeschlagen**:
```bash
# Firewall prüfen
sudo ufw status

# Netzwerk-Route prüfen
ip route show

# DNS-Auflösung testen
nslookup server-hostname
```

**Performance-Probleme**:
```bash
# CPU-Auslastung prüfen
htop

# Memory-Verbrauch
free -h

# Temperatur überwachen
watch -n 1 vcgencmd measure_temp
```

## Wartung

### Regelmäßige Updates
```bash
# System-Updates
sudo apt update && sudo apt upgrade -y

# Service neu starten
sudo systemctl restart person-counter-camera

# Logs rotieren
sudo logrotate -f /etc/logrotate.conf
```

### Backup
```bash
# SD-Karte klonen (auf anderem System)
sudo dd if=/dev/sdX of=pi-backup.img bs=4M status=progress

# Konfiguration sichern
tar -czf config-backup.tar.gz /etc/systemd/system/person-counter-*
```

### Remote-Zugriff
```bash
# SSH aktivieren
sudo systemctl enable ssh

# VNC für grafische Oberfläche (optional)
sudo apt install realvnc-vnc-server
sudo systemctl enable vncserver-x11-serviced
```