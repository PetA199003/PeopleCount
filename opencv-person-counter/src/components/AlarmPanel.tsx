import React from 'react';
import { AlertTriangle, X, ExternalLink } from 'lucide-react';
import { Alarm } from '../types';

interface AlarmPanelProps {
  alarms: Alarm[];
}

export default function AlarmPanel({ alarms }: AlarmPanelProps) {
  return (
    <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-red-400" />
        <h2 className="text-lg font-semibold text-red-400">Aktive Alarme</h2>
      </div>
      
      <div className="space-y-3">
        {alarms.map((alarm) => (
          <div key={alarm.id} className="bg-gray-800 rounded-lg p-4 border border-red-500/20">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-white font-medium">{alarm.title}</h3>
                <p className="text-gray-400 text-sm mt-1">{alarm.description}</p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                  <span>Kamera: {alarm.camera}</span>
                  <span>Zeit: {alarm.timestamp.toLocaleTimeString('de-DE')}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <button className="p-1 text-gray-400 hover:text-white transition-colors">
                  <ExternalLink className="h-4 w-4" />
                </button>
                <button className="p-1 text-gray-400 hover:text-white transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}