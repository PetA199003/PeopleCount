import net from 'net';
import EventEmitter from 'events';

class TCPCameraServer extends EventEmitter {
  constructor(port = 8888) {
    super();
    this.port = port;
    this.server = null;
    this.cameras = new Map();
    this.clients = new Set();
  }

  start() {
    this.server = net.createServer((socket) => {
      console.log(`📡 Camera node connected: ${socket.remoteAddress}:${socket.remotePort}`);
      this.clients.add(socket);

      let buffer = '';

      socket.on('data', (data) => {
        buffer += data.toString();
        
        // Process complete JSON messages (newline-delimited)
        const lines = buffer.split('\n');
        buffer = lines.pop(); // Keep incomplete line in buffer

        lines.forEach(line => {
          if (line.trim()) {
            try {
              const message = JSON.parse(line);
              this.handleCameraMessage(socket, message);
            } catch (error) {
              console.error('Failed to parse camera message:', error);
            }
          }
        });
      });

      socket.on('close', () => {
        console.log(`📡 Camera node disconnected: ${socket.remoteAddress}:${socket.remotePort}`);
        this.clients.delete(socket);
        
        // Mark cameras from this socket as offline
        this.cameras.forEach((camera, cameraId) => {
          if (camera.socket === socket) {
            camera.status = 'offline';
            camera.lastSeen = new Date();
            this.emit('camera_status_changed', { cameraId, status: 'offline' });
          }
        });
      });

      socket.on('error', (error) => {
        console.error('Camera socket error:', error);
        this.clients.delete(socket);
      });
    });

    this.server.listen(this.port, () => {
      console.log(`🖥️ TCP Camera Server listening on port ${this.port}`);
    });

    // Cleanup offline cameras periodically
    setInterval(() => {
      this.cleanupOfflineCameras();
    }, 30000);
  }

  handleCameraMessage(socket, message) {
    const { type, camera_id } = message;

    switch (type) {
      case 'camera_registration':
        this.registerCamera(socket, message);
        break;
        
      case 'person_detection':
        this.handlePersonDetection(message);
        break;
        
      case 'heartbeat':
        this.updateCameraHeartbeat(camera_id);
        break;
        
      default:
        console.warn(`Unknown message type: ${type}`);
    }
  }

  registerCamera(socket, message) {
    const { camera_id } = message;
    
    this.cameras.set(camera_id, {
      id: camera_id,
      socket: socket,
      status: 'online',
      lastSeen: new Date(),
      detections: 0,
      todayIn: 0,
      todayOut: 0
    });

    console.log(`📹 Camera registered: ${camera_id}`);
    this.emit('camera_registered', { cameraId: camera_id });

    // Send configuration to camera
    this.sendCameraConfig(socket, camera_id);
  }

  sendCameraConfig(socket, cameraId) {
    const config = {
      type: 'config_update',
      camera_id: cameraId,
      zones: {
        entry: { enabled: true, x: 100, y: 200, width: 300, height: 100 },
        exit: { enabled: true, x: 500, y: 200, width: 300, height: 100 }
      },
      sensitivity: 0.7,
      min_person_size: 50,
      max_person_size: 200
    };

    try {
      socket.write(JSON.stringify(config) + '\n');
    } catch (error) {
      console.error('Failed to send config to camera:', error);
    }
  }

  handlePersonDetection(message) {
    const { camera_id, detections } = message;
    const camera = this.cameras.get(camera_id);
    
    if (!camera) {
      console.warn(`Detection from unknown camera: ${camera_id}`);
      return;
    }

    // Update camera statistics
    camera.detections += detections.length;
    camera.lastSeen = new Date();

    // Process each detection
    detections.forEach(detection => {
      if (detection.zone === 'entry') {
        camera.todayIn++;
        this.emit('person_entered', { cameraId: camera_id, detection });
      } else if (detection.zone === 'exit') {
        camera.todayOut++;
        this.emit('person_exited', { cameraId: camera_id, detection });
      }
    });

    // Emit detection event for real-time updates
    this.emit('detections_received', {
      cameraId: camera_id,
      detections: detections,
      camera: camera
    });
  }

  updateCameraHeartbeat(cameraId) {
    const camera = this.cameras.get(cameraId);
    if (camera) {
      camera.lastSeen = new Date();
      camera.status = 'online';
    }
  }

  cleanupOfflineCameras() {
    const now = new Date();
    const timeout = 60000; // 1 minute timeout

    this.cameras.forEach((camera, cameraId) => {
      if (now - camera.lastSeen > timeout && camera.status === 'online') {
        camera.status = 'offline';
        console.log(`📹 Camera ${cameraId} marked as offline`);
        this.emit('camera_status_changed', { cameraId, status: 'offline' });
      }
    });
  }

  getCameraStatus() {
    const status = {};
    this.cameras.forEach((camera, cameraId) => {
      status[cameraId] = {
        id: cameraId,
        status: camera.status,
        lastSeen: camera.lastSeen,
        todayIn: camera.todayIn,
        todayOut: camera.todayOut,
        detections: camera.detections
      };
    });
    return status;
  }

  updateCameraZones(cameraId, zones) {
    const camera = this.cameras.get(cameraId);
    if (camera && camera.socket) {
      const config = {
        type: 'config_update',
        camera_id: cameraId,
        zones: zones
      };
      
      try {
        camera.socket.write(JSON.stringify(config) + '\n');
        console.log(`📹 Updated zones for camera ${cameraId}`);
      } catch (error) {
        console.error('Failed to update camera zones:', error);
      }
    }
  }

  stop() {
    if (this.server) {
      this.server.close();
      console.log('🛑 TCP Camera Server stopped');
    }
  }
}

export default TCPCameraServer;