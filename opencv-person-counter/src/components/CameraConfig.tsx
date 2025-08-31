import React, { useState } from 'react';
import { usePersonCount } from '../context/PersonCountContext';
import {
  Camera,
  Plus,
  Settings,
  Trash2,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';

export default function CameraConfig() {
  const { cameras, updateCamera, addCamera, removeCamera } = usePersonCount();
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);

  const handleZoneConfig = (cameraId: string, zoneType: 'entry' | 'exit', enabled: boolean) => {
    const camera = cameras.find(c => c.id === cameraId);
    if (camera) {
      updateCamera(cameraId, {
        ...camera,
        zones: {
          ...camera.zones,
          [zoneType]: { ...camera.zones[zoneType], enabled }
        }
      });
    }
  };

  return (
    <div className="p-6 h-full overflow-y-auto bg-gray-900">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Kamera Konfiguration</h1>
            <p className="text-gray-400">Verwalten Sie Kameras und Erkennungszonen</p>
          </div>
          <button
            onClick={() => addCamera()}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white flex items-center space-x-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Kamera hinzufügen</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Camera List */}
        <div className="space-y-4">
          {cameras.map((camera) => (
            <div
              key={camera.id}
              className={`bg-gray-800 rounded-lg p-4 border transition-colors cursor-pointer ${
                selectedCamera === camera.id ? 'border-blue-500' : 'border-gray-700 hover:border-gray-600'
              }`}
              onClick={() => setSelectedCamera(camera.id)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <Camera className="h-5 w-5 text-blue-400" />
                  <div>
                    <h3 className="text-white font-semibold">{camera.name}</h3>
                    <p className="text-sm text-gray-400">{camera.location}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {camera.status === 'online' ? (
                    <CheckCircle className="h-4 w-4 text-green-400" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-400" />
                  )}
                  <button className="p-1 text-gray-400 hover:text-white transition-colors">
                    <Settings className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCamera(camera.id);
                    }}
                    className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{camera.todayIn}</div>
                  <div className="text-sm text-green-400">Eingänge heute</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-white">{camera.todayOut}</div>
                  <div className="text-sm text-red-400">Ausgänge heute</div>
                </div>
              </div>

              {/* Zone Configuration */}
              <div className="mt-4 pt-4 border-t border-gray-700">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Erkennungszonen</h4>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleZoneConfig(camera.id, 'entry', !camera.zones.entry.enabled);
                      }}
                      className={`p-1 rounded ${camera.zones.entry.enabled ? 'text-green-400' : 'text-gray-500'}`}
                    >
                      {camera.zones.entry.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <span className="text-sm text-gray-400">Eingangszone</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleZoneConfig(camera.id, 'exit', !camera.zones.exit.enabled);
                      }}
                      className={`p-1 rounded ${camera.zones.exit.enabled ? 'text-red-400' : 'text-gray-500'}`}
                    >
                      {camera.zones.exit.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>
                    <span className="text-sm text-gray-400">Ausgangszone</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Configuration Panel */}
        {selectedCamera && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Kamera Einstellungen</h2>
            {(() => {
              const camera = cameras.find(c => c.id === selectedCamera);
              if (!camera) return null;

              return (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Kamera Name
                    </label>
                    <input
                      type="text"
                      value={camera.name}
                      onChange={(e) => updateCamera(camera.id, { ...camera, name: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Standort
                    </label>
                    <input
                      type="text"
                      value={camera.location}
                      onChange={(e) => updateCamera(camera.id, { ...camera, location: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Kamera Typ
                    </label>
                    <select
                      value={camera.type}
                      onChange={(e) => updateCamera(camera.id, { ...camera, type: e.target.value as any })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="both">Ein- und Ausgang</option>
                      <option value="entry">Nur Eingang</option>
                      <option value="exit">Nur Ausgang</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Erkennungsempfindlichkeit
                    </label>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.1"
                      value={camera.sensitivity}
                      onChange={(e) => updateCamera(camera.id, { ...camera, sensitivity: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Niedrig</span>
                      <span>{(camera.sensitivity * 100).toFixed(0)}%</span>
                      <span>Hoch</span>
                    </div>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-300 mb-3">OpenCV Einstellungen</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Min. Personengröße (px)</label>
                        <input
                          type="number"
                          value={camera.minPersonSize}
                          onChange={(e) => updateCamera(camera.id, { ...camera, minPersonSize: parseInt(e.target.value) })}
                          className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1">Max. Personengröße (px)</label>
                        <input
                          type="number"
                          value={camera.maxPersonSize}
                          onChange={(e) => updateCamera(camera.id, { ...camera, maxPersonSize: parseInt(e.target.value) })}
                          className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}