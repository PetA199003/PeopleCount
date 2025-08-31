const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:3001';

class PersonCounterAPI {
  async getCurrentCount() {
    const response = await fetch(`${API_BASE_URL}/count`);
    return response.json();
  }

  async resetCounter() {
    const response = await fetch(`${API_BASE_URL}/reset`, {
      method: 'POST'
    });
    return response.json();
  }

  async triggerAnnouncement(message: string, volume: number = 80) {
    const response = await fetch(`${API_BASE_URL}/announcement`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message, volume })
    });
    return response.json();
  }

  async controlLEDDisplay(action: string, content: string, companionIP?: string) {
    const response = await fetch(`${API_BASE_URL}/led-display`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action, content, companionIP })
    });
    return response.json();
  }

  async getCameras() {
    const response = await fetch(`${API_BASE_URL}/cameras`);
    return response.json();
  }

  // WebSocket connection for real-time updates
  connectWebSocket(onMessage: (data: any) => void) {
    const ws = new WebSocket(WS_URL);
    
    ws.onopen = () => {
      console.log('🔗 WebSocket connected');
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };
    
    ws.onclose = () => {
      console.log('🔌 WebSocket disconnected');
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        console.log('🔄 Attempting to reconnect...');
        this.connectWebSocket(onMessage);
      }, 3000);
    };
    
    ws.onerror = (error) => {
      console.error('🚨 WebSocket error:', error);
    };
    
    return ws;
  }

  // Camera management
  async updateCameraConfig(cameraId: string, config: any) {
    const response = await fetch(`${API_BASE_URL}/cameras/${cameraId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(config)
    });
    return response.json();
  }
}

export default new PersonCounterAPI();