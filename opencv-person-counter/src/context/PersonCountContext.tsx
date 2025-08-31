import React, { createContext, useContext, useState, useEffect } from 'react';
import { Camera, Alarm } from '../types';

interface PersonCountContextType {
  totalCount: number;
  todayIn: number;
  todayOut: number;
  cameras: Camera[];
  alarms: Alarm[];
  updateCamera: (id: string, camera: Camera) => void;
  addCamera: () => void;
  removeCamera: (id: string) => void;
}

const PersonCountContext = createContext<PersonCountContextType | undefined>(undefined);

export function PersonCountProvider({ children }: { children: React.ReactNode }) {
  const [totalCount, setTotalCount] = useState(23);
  const [todayIn, setTodayIn] = useState(127);
  const [todayOut, setTodayOut] = useState(104);
  const [cameras, setCameras] = useState<Camera[]>([
    {
      id: 'haupteingang',
      name: 'Haupteingang',
      location: 'Eingangsbereich Nord',
      status: 'online',
      type: 'both',
      resolution: '1920x1080',
      todayIn: 87,
      todayOut: 79,
      current: 8,
      sensitivity: 0.7,
      minPersonSize: 50,
      maxPersonSize: 200,
      zones: {
        entry: { enabled: true, x: 100, y: 200, width: 300, height: 100 },
        exit: { enabled: true, x: 500, y: 200, width: 300, height: 100 }
      }
    },
    {
      id: 'seiteneingang',
      name: 'Seiteneingang',
      location: 'Seitenbereich Ost',
      status: 'online',
      type: 'entry',
      resolution: '1920x1080',
      todayIn: 40,
      todayOut: 25,
      current: 15,
      sensitivity: 0.8,
      minPersonSize: 50,
      maxPersonSize: 200,
      zones: {
        entry: { enabled: true, x: 100, y: 200, width: 300, height: 100 },
        exit: { enabled: false, x: 0, y: 0, width: 0, height: 0 }
      }
    }
  ]);
  const [alarms, setAlarms] = useState<Alarm[]>([]);

  // Initialize WebSocket connection for real-time updates
  useEffect(() => {
    const connectWebSocket = () => {
      const ws = new WebSocket('ws://localhost:3001');
      
      ws.onopen = () => {
        console.log('🔗 WebSocket connected');
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'count_update':
            setTotalCount(data.data.total);
            setTodayIn(data.data.todayIn);
            setTodayOut(data.data.todayOut);
            break;
            
          case 'camera_update':
            setCameras(data.data.map((cam: any) => ({
              ...cam,
              resolution: '1920x1080',
              sensitivity: cam.sensitivity || 0.7,
              minPersonSize: cam.minPersonSize || 50,
              maxPersonSize: cam.maxPersonSize || 200,
              zones: cam.zones || {
                entry: { enabled: true, x: 100, y: 200, width: 300, height: 100 },
                exit: { enabled: true, x: 500, y: 200, width: 300, height: 100 }
              }
            })));
            break;
            
          case 'alarm':
            setAlarms(prev => [data.data, ...prev.slice(0, 49)]);
            break;
        }
      };
      
      ws.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        // Attempt to reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };
      
      ws.onerror = (error) => {
        console.error('🚨 WebSocket error:', error);
      };
      
      return ws;
    };

    const ws = connectWebSocket();

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, []);

  const updateCamera = (id: string, updatedCamera: Camera) => {
    // Update local state
    setCameras(prev => prev.map(cam => cam.id === id ? updatedCamera : cam));
    
    // Send update to server
    fetch(`http://localhost:3001/api/cameras/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedCamera)
    }).catch(console.error);
  };

  const addCamera = () => {
    const newCamera: Camera = {
      id: `cam${cameras.length + 1}`,
      name: `Kamera ${cameras.length + 1}`,
      location: 'Neuer Standort',
      status: 'offline',
      type: 'both',
      resolution: '1920x1080',
      todayIn: 0,
      todayOut: 0,
      current: 0,
      sensitivity: 0.7,
      minPersonSize: 50,
      maxPersonSize: 200,
      zones: {
        entry: { enabled: true, x: 0, y: 200, width: 300, height: 100 },
        exit: { enabled: true, x: 500, y: 200, width: 300, height: 100 }
      }
    };
    setCameras(prev => [...prev, newCamera]);
  };

  const removeCamera = (id: string) => {
    setCameras(prev => prev.filter(cam => cam.id !== id));
  };

  return (
    <PersonCountContext.Provider value={{
      totalCount,
      todayIn,
      todayOut,
      cameras,
      alarms,
      updateCamera,
      addCamera,
      removeCamera
    }}>
      {children}
    </PersonCountContext.Provider>
  );
}

export function usePersonCount() {
  const context = useContext(PersonCountContext);
  if (context === undefined) {
    throw new Error('usePersonCount must be used within a PersonCountProvider');
  }
  return context;
}