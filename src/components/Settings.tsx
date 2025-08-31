import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Wifi,
  Bell,
  ExternalLink,
  Server,
  Shield,
  Save
} from 'lucide-react';

export default function Settings() {
  const [apiEndpoint, setApiEndpoint] = useState('http://localhost:3001/api');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [alertEnabled, setAlertEnabled] = useState(true);
  const [companionIP, setCompanionIP] = useState('192.168.1.100');

  return (
    <div className="p-6 h-full overflow-y-auto bg-gray-900">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">Systemeinstellungen</h1>
        <p className="text-gray-400">Konfiguration und externe Schnittstellen</p>
      </div>

      <div className="space-y-8">
        {/* System Configuration */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
            <SettingsIcon className="h-5 w-5 text-blue-400" />
            <span>System Konfiguration</span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                API Endpoint
              </label>
              <input
                type="text"
                value={apiEndpoint}
                onChange={(e) => setApiEndpoint(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Webhook URL
              </label>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://beispiel.de/webhook"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* External Integrations */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
            <ExternalLink className="h-5 w-5 text-green-400" />
            <span>Externe Schnittstellen</span>
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-white mb-3">Companion Integration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Companion IP-Adresse
                  </label>
                  <input
                    type="text"
                    value={companionIP}
                    onChange={(e) => setCompanionIP(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex items-end">
                  <button className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white transition-colors">
                    Verbindung testen
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-white mb-3">HTTP API Befehle</h3>
              <div className="bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-300 mb-2">Verfügbare Endpoints:</p>
                <div className="space-y-1 text-xs text-gray-400 font-mono">
                  <div>POST /api/announcement - Durchsage abspielen</div>
                  <div>POST /api/led-display - LED-Wand steuern</div>
                  <div>GET /api/count - Aktuelle Personenzahl abrufen</div>
                  <div>POST /api/reset - Zähler zurücksetzen</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts Configuration */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
            <Bell className="h-5 w-5 text-orange-400" />
            <span>Benachrichtigungen</span>
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">Alarm bei falscher Nutzung</h3>
                <p className="text-sm text-gray-400">Warnung wenn Ein-/Ausgang falsch genutzt wird</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={alertEnabled}
                  onChange={(e) => setAlertEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
            <Shield className="h-5 w-5 text-purple-400" />
            <span>Sicherheit</span>
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                API Token
              </label>
              <div className="flex space-x-2">
                <input
                  type="password"
                  value="••••••••••••••••"
                  readOnly
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                />
                <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white transition-colors">
                  Neu generieren
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg text-white flex items-center space-x-2 transition-colors">
            <Save className="h-4 w-4" />
            <span>Einstellungen speichern</span>
          </button>
        </div>
      </div>
    </div>
  );
}