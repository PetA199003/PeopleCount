import React, { useState, useEffect } from 'react';
import { usePersonCount } from '../context/PersonCountContext';
import CameraFeed from './CameraFeed';
import StatsCard from './StatsCard';
import AlarmPanel from './AlarmPanel';
import {
  Users,
  UserPlus,
  UserMinus,
  AlertTriangle,
  TrendingUp,
  Clock
} from 'lucide-react';

export default function Dashboard() {
  const { totalCount, todayIn, todayOut, cameras, alarms } = usePersonCount();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="p-6 h-full overflow-y-auto bg-gray-900">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-gray-400">Personenzähler System</p>
          </div>
          <div className="text-right text-gray-400">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>{currentTime.toLocaleTimeString('de-DE')}</span>
            </div>
            <div className="text-sm">{currentTime.toLocaleDateString('de-DE')}</div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Aktuelle Personen"
          value={totalCount}
          icon={Users}
          color="blue"
          subtitle="Im Gelände"
        />
        <StatsCard
          title="Heute Eintritte"
          value={todayIn}
          icon={UserPlus}
          color="green"
          subtitle="Seit 00:00 Uhr"
        />
        <StatsCard
          title="Heute Austritte"
          value={todayOut}
          icon={UserMinus}
          color="red"
          subtitle="Seit 00:00 Uhr"
        />
        <StatsCard
          title="Aktive Alarme"
          value={alarms.length}
          icon={AlertTriangle}
          color="orange"
          subtitle="Benötigen Aufmerksamkeit"
        />
      </div>

      {/* Alarms */}
      {alarms.length > 0 && (
        <div className="mb-8">
          <AlarmPanel alarms={alarms} />
        </div>
      )}

      {/* Camera Feeds Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {cameras.map((camera) => (
          <CameraFeed key={camera.id} camera={camera} />
        ))}
      </div>
    </div>
  );
}