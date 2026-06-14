import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Lock,
  Bell,
  Shield,
  Database,
  ToggleRight,
  ToggleLeft,
  Save
} from 'lucide-react';

export function Settings() {
  const [isDark, setIsDark] = useState(false);
  const [settings, setSettings] = useState({
    notifications: true,
    emailAlerts: true,
    twoFactor: false,
    dataRetention: '90',
    autoBackup: true,
    performanceMonitoring: true,
  });

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const handleSettingChange = (key: string, value: any) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSave = () => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    alert('Settings saved successfully!');
  };

  const SettingToggle = ({ label, description, value, onChange }: any) => (
    <div className={`flex items-center justify-between p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div>
        <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{label}</p>
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`transition-colors ${value ? 'text-blue-600' : isDark ? 'text-gray-500' : 'text-gray-400'}`}
      >
        {value ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
      </button>
    </div>
  );

  const SettingSelect = ({ label, description, value, onChange, options }: any) => (
    <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <label className={`block font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {label}
      </label>
      <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{description}</p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-2 rounded-lg border ${
          isDark
            ? 'bg-gray-700 border-gray-600 text-white'
            : 'bg-white border-gray-300 text-gray-900'
        } focus:ring-2 focus:ring-blue-500`}
      >
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Settings
        </h1>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Manage your preferences and system configuration
        </p>
      </div>

      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md p-8 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-blue-100'}`}>
            <Moon className={`h-6 w-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          </div>
          <h2 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Theme
          </h2>
        </div>

        <div className={`flex items-center justify-between p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-3 px-4 py-2 rounded-lg ${isDark ? 'bg-gray-600' : 'bg-white'}`}>
              <Sun className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-yellow-500'}`} />
              <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Light</span>
            </div>
            <div className={`flex items-center gap-3 px-4 py-2 rounded-lg ${!isDark ? 'bg-gray-200' : 'bg-blue-600'}`}>
              <Moon className={`h-5 w-5 ${isDark ? 'text-white' : 'text-gray-500'}`} />
              <span className={isDark ? 'text-white' : 'text-gray-700'}>Dark</span>
            </div>
          </div>
          <button
            onClick={() => setIsDark(!isDark)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
          >
            Switch Theme
          </button>
        </div>
      </div>

      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md p-8 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-green-100'}`}>
            <Bell className={`h-6 w-6 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
          </div>
          <h2 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Notifications
          </h2>
        </div>

        <div className="space-y-4">
          <SettingToggle
            label="Enable Notifications"
            description="Receive real-time notifications about model performance and alerts"
            value={settings.notifications}
            onChange={(value: boolean) => handleSettingChange('notifications', value)}
          />
          <SettingToggle
            label="Email Alerts"
            description="Get email notifications for critical events"
            value={settings.emailAlerts}
            onChange={(value: boolean) => handleSettingChange('emailAlerts', value)}
          />
        </div>
      </div>

      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md p-8 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-purple-100'}`}>
            <Lock className={`h-6 w-6 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
          </div>
          <h2 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Security
          </h2>
        </div>

        <div className="space-y-4">
          <SettingToggle
            label="Two-Factor Authentication"
            description="Add an extra layer of security to your account"
            value={settings.twoFactor}
            onChange={(value: boolean) => handleSettingChange('twoFactor', value)}
          />
        </div>
      </div>

      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md p-8 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-orange-100'}`}>
            <Database className={`h-6 w-6 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
          </div>
          <h2 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Data Management
          </h2>
        </div>

        <div className="space-y-4">
          <SettingSelect
            label="Data Retention Period"
            description="How long to retain historical data and metrics"
            value={settings.dataRetention}
            onChange={(value: string) => handleSettingChange('dataRetention', value)}
            options={[
              { value: '30', label: '30 days' },
              { value: '60', label: '60 days' },
              { value: '90', label: '90 days' },
              { value: '180', label: '180 days' },
              { value: '365', label: '1 year' },
            ]}
          />
          <SettingToggle
            label="Auto Backup"
            description="Automatically backup your model data daily"
            value={settings.autoBackup}
            onChange={(value: boolean) => handleSettingChange('autoBackup', value)}
          />
        </div>
      </div>

      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md p-8 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-cyan-100'}`}>
            <Shield className={`h-6 w-6 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
          </div>
          <h2 className={`text-2xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Monitoring
          </h2>
        </div>

        <div className="space-y-4">
          <SettingToggle
            label="Performance Monitoring"
            description="Enable detailed performance tracking and analytics"
            value={settings.performanceMonitoring}
            onChange={(value: boolean) => handleSettingChange('performanceMonitoring', value)}
          />
        </div>
      </div>

      <div className={`${isDark ? 'bg-gradient-to-r from-blue-900/30 to-purple-900/30' : 'bg-gradient-to-r from-blue-50 to-indigo-50'} rounded-xl shadow-md p-8 border ${isDark ? 'border-blue-800' : 'border-blue-200'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Save Your Preferences
            </h3>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Click the button below to save all your settings
            </p>
          </div>
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors shadow-lg"
          >
            <Save className="h-5 w-5" />
            Save Settings
          </button>
        </div>
      </div>

      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md p-8 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <h2 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          About
        </h2>
        <div className={`space-y-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          <p className="flex justify-between">
            <span>Application Version:</span>
            <span className="font-semibold">1.0.0</span>
          </p>
          <p className="flex justify-between">
            <span>Backend API:</span>
            <span className="font-semibold">FastAPI 0.104+</span>
          </p>
          <p className="flex justify-between">
            <span>Database:</span>
            <span className="font-semibold">PostgreSQL via Supabase</span>
          </p>
          <p className="flex justify-between">
            <span>Last Updated:</span>
            <span className="font-semibold">{new Date().toLocaleDateString()}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
