# API Dokumentation

## Übersicht

Das Person Counter System bietet eine umfassende HTTP API für externe Integrationen und Automatisierung.

**Base URL**: `http://your-server:3001/api`

## Personenzählung

### GET /api/count
Aktuelle Personenzahl und Tagesstatistiken abrufen.

**Response**:
```json
{
  "total": 23,
  "todayIn": 127,
  "todayOut": 104,
  "timestamp": "2025-01-27T10:30:00.000Z"
}
```

### POST /api/reset
Personenzähler zurücksetzen.

**Response**:
```json
{
  "success": true,
  "message": "Counter reset successfully"
}
```

## Kamera-Management

### GET /api/cameras
Alle registrierten Kameras und deren Status abrufen.

**Response**:
```json
[
  {
    "id": "haupteingang",
    "name": "Haupteingang",
    "location": "Eingangsbereich Nord",
    "status": "online",
    "type": "both",
    "todayIn": 87,
    "todayOut": 79,
    "current": 8,
    "lastSeen": "2025-01-27T10:29:45.000Z"
  }
]
```

### PUT /api/cameras/:id
Kamera-Konfiguration aktualisieren.

**Request Body**:
```json
{
  "name": "Neuer Name",
  "type": "entry",
  "zones": {
    "entry": {
      "enabled": true,
      "x": 100,
      "y": 200,
      "width": 300,
      "height": 100
    },
    "exit": {
      "enabled": false,
      "x": 0,
      "y": 0,
      "width": 0,
      "height": 0
    }
  },
  "sensitivity": 0.8
}
```

## Externe Steuerung

### POST /api/announcement
Durchsage über Lautsprecher-System abspielen.

**Request Body**:
```json
{
  "message": "Bitte verlassen Sie das Gebäude ordnungsgemäß",
  "volume": 85
}
```

**Response**:
```json
{
  "success": true,
  "message": "Announcement triggered",
  "data": {
    "message": "Bitte verlassen Sie das Gebäude ordnungsgemäß",
    "volume": 85
  }
}
```

### POST /api/led-display
LED-Wand über Companion steuern.

**Request Body**:
```json
{
  "action": "play_video",
  "content": "emergency_exit.mp4",
  "companionIP": "192.168.1.200"
}
```

**Verfügbare Aktionen**:
- `play_video`: Video abspielen
- `show_text`: Text anzeigen
- `show_image`: Bild anzeigen
- `clear_display`: Display leeren

**Response**:
```json
{
  "success": true,
  "message": "LED display command sent",
  "companionCommand": {
    "page": "led-wall",
    "action": "play_video",
    "content": "emergency_exit.mp4",
    "timestamp": "2025-01-27T10:30:00.000Z"
  }
}
```

## WebSocket Events

**Verbindung**: `ws://your-server:3001`

### Event Types

#### count_update
```json
{
  "type": "count_update",
  "data": {
    "total": 24,
    "todayIn": 128,
    "todayOut": 104
  }
}
```

#### camera_update
```json
{
  "type": "camera_update",
  "data": [
    {
      "id": "haupteingang",
      "status": "online",
      "todayIn": 88,
      "todayOut": 79
    }
  ]
}
```

#### alarm
```json
{
  "type": "alarm",
  "data": {
    "id": "1706349000123",
    "title": "Falsche Bereichsnutzung",
    "description": "Person nutzt Eingang als Ausgang",
    "camera": "Haupteingang",
    "type": "wrong_direction",
    "severity": "warning",
    "timestamp": "2025-01-27T10:30:00.123Z"
  }
}
```

#### announcement
```json
{
  "type": "announcement",
  "data": {
    "message": "Durchsage Text",
    "volume": 85,
    "timestamp": "2025-01-27T10:30:00.000Z"
  }
}
```

#### led_display
```json
{
  "type": "led_display",
  "data": {
    "page": "led-wall",
    "action": "play_video",
    "content": "emergency_exit.mp4",
    "timestamp": "2025-01-27T10:30:00.000Z"
  }
}
```

## Beispiel-Integrationen

### Bash Script für Notfall-Durchsage
```bash
#!/bin/bash
# emergency-announcement.sh

SERVER="192.168.1.100:3001"
MESSAGE="NOTFALL: Bitte verlassen Sie sofort das Gebäude!"

# Durchsage abspielen
curl -X POST "http://$SERVER/api/announcement" \
  -H "Content-Type: application/json" \
  -d "{\"message\": \"$MESSAGE\", \"volume\": 100}"

# LED-Wand auf Notfall schalten
curl -X POST "http://$SERVER/api/led-display" \
  -H "Content-Type: application/json" \
  -d '{"action": "play_video", "content": "emergency_exit.mp4"}'
```

### Python Integration
```python
import requests
import json

class PersonCounterAPI:
    def __init__(self, base_url):
        self.base_url = base_url
    
    def get_current_count(self):
        response = requests.get(f"{self.base_url}/count")
        return response.json()
    
    def trigger_announcement(self, message, volume=80):
        data = {"message": message, "volume": volume}
        response = requests.post(f"{self.base_url}/announcement", json=data)
        return response.json()
    
    def control_led_display(self, action, content, companion_ip="192.168.1.200"):
        data = {
            "action": action,
            "content": content,
            "companionIP": companion_ip
        }
        response = requests.post(f"{self.base_url}/led-display", json=data)
        return response.json()

# Verwendung
api = PersonCounterAPI("http://192.168.1.100:3001/api")

# Aktuelle Anzahl abrufen
count = api.get_current_count()
print(f"Aktuelle Personen: {count['total']}")

# Bei Überfüllung warnen
if count['total'] > 50:
    api.trigger_announcement("Gebäude ist voll. Bitte warten Sie.", 90)
    api.control_led_display("show_text", "GEBÄUDE VOLL - BITTE WARTEN")
```

### Node.js Integration
```javascript
import fetch from 'node-fetch';

class PersonCounterClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async getCurrentCount() {
    const response = await fetch(`${this.baseUrl}/count`);
    return response.json();
  }

  async triggerAnnouncement(message, volume = 80) {
    const response = await fetch(`${this.baseUrl}/announcement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, volume })
    });
    return response.json();
  }

  async controlLEDDisplay(action, content, companionIP = '192.168.1.200') {
    const response = await fetch(`${this.baseUrl}/led-display`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, content, companionIP })
    });
    return response.json();
  }
}

// Verwendung
const client = new PersonCounterClient('http://192.168.1.100:3001/api');

// Überwachung starten
setInterval(async () => {
  const count = await client.getCurrentCount();
  
  if (count.total > 100) {
    await client.triggerAnnouncement('Maximale Kapazität erreicht', 90);
    await client.controlLEDDisplay('show_text', 'KAPAZITÄT ERREICHT');
  }
}, 30000);
```

## Fehlerbehandlung

### HTTP Status Codes
- `200`: Erfolg
- `400`: Ungültige Anfrage
- `404`: Endpoint nicht gefunden
- `500`: Server-Fehler

### Typische Fehler-Responses
```json
{
  "success": false,
  "error": "Camera not found",
  "code": "CAMERA_NOT_FOUND"
}
```

## Rate Limiting

- **Announcement API**: Max. 1 Anfrage pro 5 Sekunden
- **LED Display API**: Max. 1 Anfrage pro 2 Sekunden
- **Count API**: Unbegrenzt
- **Camera Config**: Max. 10 Anfragen pro Minute

## Sicherheit

### API Token (Optional)
```bash
# Header für authentifizierte Anfragen
curl -H "Authorization: Bearer YOUR_API_TOKEN" \
     http://server:3001/api/count
```

### IP-Whitelist
Konfigurieren Sie Ihre Firewall, um nur vertrauenswürdige IPs zuzulassen:
```bash
sudo ufw allow from 192.168.1.0/24 to any port 3001
sudo ufw allow from 192.168.1.0/24 to any port 8888
```