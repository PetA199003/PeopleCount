export interface Camera {
  id: string;
  name: string;
  location: string;
  status: 'online' | 'offline';
  type: 'entry' | 'exit' | 'both';
  resolution: string;
  todayIn: number;
  todayOut: number;
  current: number;
  sensitivity: number;
  minPersonSize: number;
  maxPersonSize: number;
  zones: {
    entry: Zone;
    exit: Zone;
  };
  lastSeen?: Date;
}

export interface Zone {
  enabled: boolean;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Alarm {
  id: string;
  title: string;
  description: string;
  camera: string;
  type: 'wrong_direction' | 'system_error' | 'high_capacity';
  timestamp: Date;
  severity: 'info' | 'warning' | 'error';
}

export interface PersonDetection {
  id: string;
  cameraId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  direction: 'in' | 'out';
  timestamp: Date;
}