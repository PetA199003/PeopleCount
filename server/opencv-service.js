// OpenCV Service Simulation for Raspberry Pi
import cv from 'opencv4nodejs'; // This would be the actual opencv4nodejs in production
import EventEmitter from 'events';

class OpenCVPersonCounter extends EventEmitter {
  constructor() {
    super();
    this.cameras = new Map();
    this.detectionActive = false;
    this.personCount = 0;
  }

  // Initialize camera with Raspberry Pi High Quality Camera
  async initCamera(cameraId, config) {
    console.log(`🎥 Initializing camera ${cameraId} on Raspberry Pi...`);
    
    // In production, this would initialize the actual camera:
    // const cap = new cv.VideoCapture(cameraId);
    // cap.set(cv.CAP_PROP_FRAME_WIDTH, 1920);
    // cap.set(cv.CAP_PROP_FRAME_HEIGHT, 1080);
    
    this.cameras.set(cameraId, {
      id: cameraId,
      ...config,
      capture: null, // Simulated camera object
      personDetector: this.initPersonDetector(),
      zones: config.zones || {
        entry: { x: 0, y: 200, width: 300, height: 100 },
        exit: { x: 500, y: 200, width: 300, height: 100 }
      }
    });

    this.emit('camera_initialized', { cameraId, status: 'ready' });
  }

  // Initialize person detection using OpenCV
  initPersonDetector() {
    // In production, this would set up the HOG descriptor:
    // const hog = new cv.HOGDescriptor();
    // hog.setSVMDetector(cv.HOGDescriptor.getDefaultPeopleDetector());
    return {
      detect: this.simulatePersonDetection.bind(this)
    };
  }

  // Simulate person detection (in production this would use actual OpenCV)
  simulatePersonDetection(frame, zones) {
    const detections = [];
    
    // Simulate random detections
    if (Math.random() > 0.8) {
      const detection = {
        x: Math.random() * 400 + 50,
        y: Math.random() * 200 + 100,
        width: 60 + Math.random() * 40,
        height: 120 + Math.random() * 80,
        confidence: 0.7 + Math.random() * 0.3
      };

      // Determine which zone the detection is in
      let zone = null;
      if (zones.entry.enabled && this.isInZone(detection, zones.entry)) {
        zone = 'entry';
      } else if (zones.exit.enabled && this.isInZone(detection, zones.exit)) {
        zone = 'exit';
      }

      if (zone) {
        detections.push({
          ...detection,
          zone,
          direction: zone === 'entry' ? 'in' : 'out',
          timestamp: new Date()
        });
      }
    }

    return detections;
  }

  // Check if detection is within a zone
  isInZone(detection, zone) {
    const centerX = detection.x + detection.width / 2;
    const centerY = detection.y + detection.height / 2;
    
    return centerX >= zone.x && 
           centerX <= zone.x + zone.width &&
           centerY >= zone.y && 
           centerY <= zone.y + zone.height;
  }

  // Start detection on all cameras
  startDetection() {
    if (this.detectionActive) return;
    
    this.detectionActive = true;
    console.log('🔍 Starting person detection...');

    this.detectionInterval = setInterval(() => {
      this.cameras.forEach((camera) => {
        if (camera.capture) {
          // In production: const frame = camera.capture.read();
          const detections = camera.personDetector.detect(null, camera.zones);
          
          detections.forEach(detection => {
            this.handlePersonDetection(camera.id, detection);
          });
        }
      });
    }, 100); // 10 FPS processing
  }

  // Stop detection
  stopDetection() {
    this.detectionActive = false;
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
    }
    console.log('⏹️ Person detection stopped');
  }

  // Handle detected person
  handlePersonDetection(cameraId, detection) {
    const camera = this.cameras.get(cameraId);
    if (!camera) return;

    // Check for wrong direction usage
    if (camera.type === 'entry' && detection.direction === 'out') {
      this.emit('alarm', {
        type: 'wrong_direction',
        camera: camera.name,
        message: 'Person using entry as exit',
        timestamp: new Date()
      });
    } else if (camera.type === 'exit' && detection.direction === 'in') {
      this.emit('alarm', {
        type: 'wrong_direction',
        camera: camera.name,
        message: 'Person using exit as entry',
        timestamp: new Date()
      });
    }

    // Update count
    if (detection.direction === 'in') {
      this.personCount++;
    } else if (detection.direction === 'out') {
      this.personCount = Math.max(0, this.personCount - 1);
    }

    this.emit('person_detected', {
      cameraId,
      detection,
      newCount: this.personCount
    });
  }

  // Get current status
  getStatus() {
    return {
      active: this.detectionActive,
      cameras: Array.from(this.cameras.values()),
      personCount: this.personCount
    };
  }
}

export default OpenCVPersonCounter;