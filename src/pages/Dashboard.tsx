import React, { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Link } from 'react-router-dom';
import {
  Box,
  GitBranch,
  Rocket,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    loadStats();
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const loadStats = async () => {
    try {
      const data = await api.get('/dashboard/stats');
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Models',
      value: stats?.total_models || 0,
      icon: Box,
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
      trend: '+12%',
      positive: true,
    },
    {
      title: 'Model Versions',
      value: stats?.total_versions || 0,
      icon: GitBranch,
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      iconColor: 'text-green-600 dark:text-green-400',
      trend: '+8%',
      positive: true,
    },
    {
      title: 'Deployed Models',
      value: stats?.deployed_models || 0,
      icon: Rocket,
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
      trend: '+5%',
      positive: true,
    },
    {
      title: 'Active Alerts',
      value: stats?.unacknowledged_alerts || 0,
      icon: AlertTriangle,
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      iconColor: 'text-red-600 dark:text-red-400',
      trend: '-2%',
      positive: false,
    },
  ];

  const performanceChartData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
    datasets: [
      {
        label: 'Accuracy',
        data: [85, 87, 86, 88, 89],
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
      {
        label: 'F1 Score',
        data: [82, 84, 85, 87, 88],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };

  const deploymentChartData = {
    labels: ['Production', 'Staging', 'Testing', 'Rejected'],
    datasets: [
      {
        label: 'Models',
        data: [12, 8, 5, 3],
        backgroundColor: ['#3b82f6', '#8b5cf6', '#ec4899', '#ef4444'],
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Dashboard
        </h1>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Monitor your ML models and fairness metrics in real-time
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={`${card.bgColor} rounded-xl p-6 border ${
                isDark ? 'border-gray-700' : 'border-gray-200'
              } hover:shadow-lg transition-all duration-300 group cursor-pointer`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {card.title}
                  </p>
                  <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {card.value}
                  </p>
                </div>
                <div className={`${card.bgColor} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-6 w-6 ${card.iconColor}`} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                {card.positive ? (
                  <ArrowUpRight className="h-4 w-4 text-green-600" />
                ) : (
                  <ArrowDownLeft className="h-4 w-4 text-green-600" />
                )}
                <span className={`text-sm font-semibold ${card.positive ? 'text-green-600' : 'text-green-600'}`}>
                  {card.trend}
                </span>
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  from last week
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md p-6 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="mb-6">
            <h2 className={`text-xl font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Model Performance Trends
            </h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Accuracy and F1 Score progression over 5 weeks
            </p>
          </div>
          <Line
            data={performanceChartData}
            options={{
              responsive: true,
              maintainAspectRatio: true,
              plugins: {
                legend: {
                  labels: {
                    color: isDark ? '#9ca3af' : '#6b7280',
                    usePointStyle: true,
                  },
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  grid: {
                    color: isDark ? '#374151' : '#f3f4f6',
                  },
                  ticks: {
                    color: isDark ? '#9ca3af' : '#6b7280',
                  },
                },
                x: {
                  grid: {
                    display: false,
                  },
                  ticks: {
                    color: isDark ? '#9ca3af' : '#6b7280',
                  },
                },
              },
            }}
          />
        </div>

        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md p-6 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="mb-6">
            <h2 className={`text-xl font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Deployment Status
            </h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Models by environment
            </p>
          </div>
          <Bar
            data={deploymentChartData}
            options={{
              responsive: true,
              maintainAspectRatio: true,
              indexAxis: 'y',
              plugins: {
                legend: {
                  display: false,
                },
              },
              scales: {
                x: {
                  beginAtZero: true,
                  grid: {
                    color: isDark ? '#374151' : '#f3f4f6',
                  },
                  ticks: {
                    color: isDark ? '#9ca3af' : '#6b7280',
                  },
                },
                y: {
                  grid: {
                    display: false,
                  },
                  ticks: {
                    color: isDark ? '#9ca3af' : '#6b7280',
                  },
                },
              },
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md p-6 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Performance
            </h3>
          </div>
          <p className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            89%
          </p>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Average accuracy across all models
          </p>
        </div>

        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md p-6 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Fairness
            </h3>
          </div>
          <p className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            94%
          </p>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Models passing fairness checks
          </p>
        </div>

        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md p-6 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Uptime
            </h3>
          </div>
          <p className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            99.8%
          </p>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            System availability this month
          </p>
        </div>
      </div>

      <div className={`${isDark ? 'bg-gradient-to-r from-gray-800 to-gray-700' : 'bg-gradient-to-r from-blue-50 to-indigo-50'} rounded-xl shadow-md p-8 border ${isDark ? 'border-gray-600' : 'border-blue-200'}`}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className={`text-2xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Ready to Get Started?
            </h2>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} mb-4`}>
              Create your first model, add metrics, and deploy with confidence using our policy-based gating system.
            </p>
            <Link
              to="/models"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Explore Models
            </Link>
          </div>
          <Box className={`h-24 w-24 ${isDark ? 'text-gray-700' : 'text-blue-200'} opacity-50`} />
        </div>
      </div>
    </div>
  );
}
