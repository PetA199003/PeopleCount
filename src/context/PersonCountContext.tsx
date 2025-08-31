import React, { createContext, useContext, useState, useEffect } from 'react';
import { Camera, Alarm } from '../types';
import PersonCounterAPI from '../services/api';

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
  const [todayIn, setTodayIn] = useState(0);
  const [todayOut, setTodayOut] = useState(0);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [alarms, setAlarms] = useState<Alarm[]>([]);

  // Initialize WebSocket connection for real-time updates
  useEffect(() => {
    const ws = PersonCounterAPI.connectWebSocket((data) => {
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
    });

    // Load initial data
    PersonCounterAPI.getCurrentCount().then(data => {
      setTotalCount(data.total);
      setTodayIn(data.todayIn);
      setTodayOut(data.todayOut);
    }).catch(console.error);

    PersonCounterAPI.getCameras().then(setCameras).catch(console.error);

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