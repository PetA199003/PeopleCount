import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'red' | 'orange';
  subtitle?: string;
}

export default function StatsCard({ title, value, icon: Icon, color, subtitle }: StatsCardProps) {
  const colorClasses = {
    blue: 'text-blue-400 bg-blue-900/20 border-blue-500/30',
    green: 'text-green-400 bg-green-900/20 border-green-500/30',
    red: 'text-red-400 bg-red-900/20 border-red-500/30',
    orange: 'text-orange-400 bg-orange-900/20 border-orange-500/30',
  };

  return (
    <div className={`bg-gray-800 border rounded-lg p-6 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value.toLocaleString()}</p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-opacity-20 ${colorClasses[color]}`}>
          <Icon className={`h-8 w-8 ${colorClasses[color].split(' ')[0]}`} />
        </div>
      </div>
    </div>
  );
}