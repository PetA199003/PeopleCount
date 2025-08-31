import React, { useState } from 'react';
import { Calendar, Download, BarChart3, TrendingUp, Clock } from 'lucide-react';

export default function Reports() {
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [selectedCamera, setSelectedCamera] = useState('all');

  const reportData = {
    today: { entries: 127, exits: 119, peak: '14:30', peakCount: 45 },
    week: { entries: 892, exits: 876, peak: 'Mittwoch', peakCount: 203 },
    month: { entries: 3247, exits: 3201, peak: '15. Januar', peakCount: 267 }
  };

  const currentData = reportData[selectedPeriod as keyof typeof reportData];

  return (
    <div className="p-6 h-full overflow-y-auto bg-gray-900">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Berichte & Analysen</h1>
            <p className="text-gray-400">Auswertung der Personenströme</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white flex items-center space-x-2 transition-colors">
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="mb-8 bg-gray-800 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Zeitraum</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="today">Heute</option>
              <option value="week">Diese Woche</option>
              <option value="month">Dieser Monat</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Kamera</label>
            <select
              value={selectedCamera}
              onChange={(e) => setSelectedCamera(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">Alle Kameras</option>
              <option value="cam1">Haupteingang</option>
              <option value="cam2">Seiteneingang</option>
              <option value="cam3">Notausgang</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="w-full bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded-lg text-white flex items-center justify-center space-x-2 transition-colors">
              <Calendar className="h-4 w-4" />
              <span>Benutzerdef. Datum</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Eingänge</p>
              <p className="text-2xl font-bold text-green-400">{currentData.entries}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Ausgänge</p>
              <p className="text-2xl font-bold text-red-400">{currentData.exits}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-red-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Spitzenzeit</p>
              <p className="text-xl font-bold text-blue-400">{currentData.peak}</p>
            </div>
            <Clock className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Max. Personen</p>
              <p className="text-2xl font-bold text-orange-400">{currentData.peakCount}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Personenstrom Verlauf</h2>
        <div className="h-64 bg-gray-700 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Diagramm wird geladen...</p>
            <p className="text-sm">Echtzeit-Datenvisualisierung</p>
          </div>
        </div>
      </div>
    </div>
  );
}