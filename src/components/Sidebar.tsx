import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Monitor,
  Camera,
  BarChart3,
  Settings as SettingsIcon,
  Users,
  Activity
} from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();

  const navItems = [
    { icon: Monitor, label: 'Dashboard', path: '/' },
    { icon: Camera, label: 'Kameras', path: '/cameras' },
    { icon: BarChart3, label: 'Berichte', path: '/reports' },
    { icon: SettingsIcon, label: 'Einstellungen', path: '/settings' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <Users className="h-8 w-8 text-blue-400" />
          <div>
            <h1 className="text-xl font-bold">PersonCounter</h1>
            <p className="text-sm text-gray-400">OpenCV System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-700">
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Activity className="h-4 w-4 text-green-400" />
          <span>System Online</span>
        </div>
      </div>
    </div>
  );
}