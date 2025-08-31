import TCPCameraServer from './tcp-server.js';
import EventEmitter from 'events';

class PersonCounterService extends EventEmitter {
  constructor() {
    super();
    this.tcpServer = new TCPCameraServer(8888);
    this.totalCount = 0;
    this.dailyStats = { in: 0, out: 0 };
    this.cameras = new Map();
    this.alarms = [];
    
    this.setupTCPServerEvents();
  }

  setupTCPServerEvents() {
    this.tcpServer.on('camera_registered', ({ cameraId }) => {
      this.cameras.set(cameraId, {
        id: cameraId,
        name: `Kamera ${cameraId}`,
        location: 'Automatisch erkannt',
        status: 'online',
        type: 'both',
        resolution: '1920x1080',
        todayIn: 0,
        todayOut: 0,
        current: 0,
        sensitivity: 0.7,
        minPersonSize: 50,
        maxPersonSize: 200,
        zones: {
          entry: { enabled: true, x: 100, y: 200, width: 300, height: 100 },
          exit: { enabled: true, x: 500, y: 200, width: 300, height: 100 }
        },
        lastSeen: new Date()
      });
      
      this.emit('camera_update', this.getCameraData());
    });

    this.tcpServer.on('person_entered', ({ cameraId, detection }) => {
      this.totalCount++;
      this.dailyStats.in++;
      
      const camera = this.cameras.get(cameraId);
      if (camera) {
        camera.todayIn++;
        camera.current++;
        
        // Check for wrong direction usage
        if (camera.type === 'exit') {
          this.createAlarm({
            title: 'Falsche Bereichsnutzung',
            description: `Person nutzt Ausgang ${camera.name} als Eingang`,
            camera: camera.name,
            type: 'wrong_direction',
            severity: 'warning'
          });
        }
      }
      
      this.emit('count_update', {
        total: this.totalCount,
        todayIn: this.dailyStats.in,
        todayOut: this.dailyStats.out
      });
    });

    this.tcpServer.on('person_exited', ({ cameraId, detection }) => {
      this.totalCount = Math.max(0, this.totalCount - 1);
      this.dailyStats.out++;
      
      const camera = this.cameras.get(cameraId);
      if (camera) {
        camera.todayOut++;
        camera.current = Math.max(0, camera.current - 1);
        
        // Check for wrong direction usage
        if (camera.type === 'entry') {
          this.createAlarm({
            title: 'Falsche Bereichsnutzung',
            description: `Person nutzt Eingang ${camera.name} als Ausgang`,
            camera: camera.name,
            type: 'wrong_direction',
            severity: 'warning'
          });
        }
      }
      
      this.emit('count_update', {
        total: this.totalCount,
        todayIn: this.dailyStats.in,
        todayOut: this.dailyStats.out
      });
    });

    this.tcpServer.on('camera_status_changed', ({ cameraId, status }) => {
      const camera = this.cameras.get(cameraId);
      if (camera) {
        camera.status = status;
        this.emit('camera_update', this.getCameraData());
      }
    });
  }

  createAlarm(alarmData) {
    const alarm = {
      id: Date.now().toString(),
      timestamp: new Date(),
      ...alarmData
    };
    
    this.alarms.unshift(alarm);
    
    // Keep only last 50 alarms
    if (this.alarms.length > 50) {
      this.alarms = this.alarms.slice(0, 50);
    }
    
    this.emit('alarm_created', alarm);
    console.log(`🚨 Alarm: ${alarm.title} - ${alarm.description}`);
  }

  getCameraData() {
    return Array.from(this.cameras.values());
  }

  getCurrentStats() {
    return {
      total: this.totalCount,
      todayIn: this.dailyStats.in,
      todayOut: this.dailyStats.out,
      cameras: this.getCameraData(),
      alarms: this.alarms.slice(0, 10) // Return only recent alarms
    };
  }

  updateCameraConfig(cameraId, config) {
    const camera = this.cameras.get(cameraId);
    if (camera) {
      Object.assign(camera, config);
      
      // Send zone updates to camera node
      if (config.zones) {
        this.tcpServer.updateCameraZones(cameraId, config.zones);
      }
      
      this.emit('camera_update', this.getCameraData());
    }
  }

  resetCounter() {
    this.totalCount = 0;
    this.dailyStats = { in: 0, out: 0 };
    
    // Reset camera counters
    this.cameras.forEach(camera => {
      camera.todayIn = 0;
      camera.todayOut = 0;
      camera.current = 0;
    });
    
    this.emit('count_update', {
      total: this.totalCount,
      todayIn: this.dailyStats.in,
      todayOut: this.dailyStats.out
    });
    
    console.log('🔄 Counter reset');
  }

  start() {
    this.tcpServer.start();
    console.log('🚀 Person Counter Service started');
  }

  stop() {
    this.tcpServer.stop();
    console.log('🛑 Person Counter Service stopped');
  }
}

export default PersonCounterService;