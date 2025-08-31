import React, { useState, useEffect } from 'react';
import { Camera, AlertCircle, CheckCircle, Settings } from 'lucide-react';
import { Camera as CameraType } from '../types';

interface CameraFeedProps {
  camera: CameraType;
}

export default function CameraFeed({ camera }: CameraFeedProps) {
  const [detectedPersons, setDetectedPersons] = useState<Array<{id: number, x: number, y: number, direction: string}>>([]);

  useEffect(() => {
    // Simulate person detection
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newPerson = {
          id: Date.now(),
          x: Math.random() * 300 + 50,
          y: Math.random() * 200 + 50,
          direction: Math.random() > 0.5 ? 'in' : 'out'
        };
        setDetectedPersons(prev => [...prev, newPerson]);
        
        setTimeout(() => {
          setDetectedPersons(prev => prev.filter(p => p.id !== newPerson.id));
        }, 2000);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const statusColor = camera.status === 'online' ? 'text-green-400' : 'text-red-400';
  const StatusIcon = camera.status === 'online' ? CheckCircle : AlertCircle;

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Camera className="h-5 w-5 text-blue-400" />
            <div>
              <h3 className="text-white font-semibold">{camera.name}</h3>
              <p className="text-sm text-gray-400">{camera.location}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <StatusIcon className={`h-4 w-4 ${statusColor}`} />
            <span className={`text-sm ${statusColor}`}>
              {camera.status === 'online' ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      <div className="relative aspect-video bg-gray-900">
        {/* Simulated Camera Feed */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Live Feed</p>
            <p className="text-xs">{camera.resolution}</p>
          </div>
        </div>

        {/* Detection Zones */}
        <div className="absolute inset-4 border-2 border-dashed border-blue-400 opacity-50"></div>
        
        {/* Entry Zone */}
        <div className="absolute left-4 top-1/2 w-1/3 h-16 -translate-y-1/2 bg-green-500 opacity-20 border border-green-400">
          <div className="absolute -top-6 text-xs text-green-400">Eingang</div>
        </div>
        
        {/* Exit Zone */}
        <div className="absolute right-4 top-1/2 w-1/3 h-16 -translate-y-1/2 bg-red-500 opacity-20 border border-red-400">
          <div className="absolute -top-6 text-xs text-red-400">Ausgang</div>
        </div>

        {/* Detected Persons */}
        {detectedPersons.map((person) => (
          <div
            key={person.id}
            className="absolute w-8 h-8 bg-yellow-400 rounded-full border-2 border-yellow-300 animate-pulse"
            style={{ left: person.x, top: person.y }}
          >
            <div className="absolute -top-8 text-xs text-yellow-300 whitespace-nowrap">
              {person.direction === 'in' ? '↓ Ein' : '↑ Aus'}
            </div>
          </div>
        ))}

        {/* Camera Controls */}
        <div className="absolute bottom-2 right-2">
          <button className="p-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors">
            <Settings className="h-4 w-4 text-gray-300" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-white">{camera.todayIn}</div>
            <div className="text-sm text-green-400">Eingänge</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{camera.todayOut}</div>
            <div className="text-sm text-red-400">Ausgänge</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{camera.current}</div>
            <div className="text-sm text-blue-400">Aktuell</div>
          </div>
        </div>
      </div>
    </div>
  );
}