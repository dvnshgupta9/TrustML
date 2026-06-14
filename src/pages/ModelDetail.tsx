import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { ArrowLeft, Plus, GitBranch, TrendingUp, Shield } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export function ModelDetail() {
  const { modelId } = useParams();
  const [model, setModel] = useState<any>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVersionForm, setShowVersionForm] = useState(false);
  const [versionForm, setVersionForm] = useState({
    version: '',
    framework: '',
  });

  useEffect(() => {
    loadData();
  }, [modelId]);

  const loadData = async () => {
    try {
      const [modelData, versionsData] = await Promise.all([
        api.get(`/models/${modelId}`),
        api.get(`/models/${modelId}/versions`),
      ]);
      setModel(modelData);
      setVersions(versionsData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVersion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/model-versions', {
        model_id: modelId,
        ...versionForm,
        training_data_info: {},
        hyperparameters: {},
      });
      setShowVersionForm(false);
      setVersionForm({ version: '', framework: '' });
      loadData();
    } catch (error: any) {
      alert('Failed to create version: ' + error.message);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      training: 'bg-yellow-100 text-yellow-800',
      testing: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      deployed: 'bg-purple-100 text-purple-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <Link
        to="/models"
        className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Models
      </Link>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{model?.name}</h1>
            <p className="text-gray-600 mt-2">{model?.description}</p>
          </div>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium uppercase">
            {model?.model_type}
          </span>
        </div>
        {model?.use_case && (
          <p className="text-sm text-gray-600">
            <span className="font-medium">Use Case:</span> {model.use_case}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Versions</h2>
        <button
          onClick={() => setShowVersionForm(!showVersionForm)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Version
        </button>
      </div>

      {showVersionForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Create New Version</h3>
          <form onSubmit={handleCreateVersion} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Version
                </label>
                <input
                  type="text"
                  value={versionForm.version}
                  onChange={(e) => setVersionForm({ ...versionForm, version: e.target.value })}
                  placeholder="v1.0.0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Framework
                </label>
                <input
                  type="text"
                  value={versionForm.framework}
                  onChange={(e) => setVersionForm({ ...versionForm, framework: e.target.value })}
                  placeholder="scikit-learn, tensorflow, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Create Version
              </button>
              <button
                type="button"
                onClick={() => setShowVersionForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-4">
        {versions.map((version) => (
          <div key={version.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <GitBranch className="h-5 w-5 text-gray-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-gray-900">{version.version}</h3>
                  <p className="text-sm text-gray-500">
                    Created {new Date(version.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(version.status)}`}>
                {version.status}
              </span>
            </div>
            {version.framework && (
              <p className="text-sm text-gray-600 mb-3">
                <span className="font-medium">Framework:</span> {version.framework}
              </p>
            )}
            <div className="flex gap-2">
              <Link
                to={`/versions/${version.id}/metrics`}
                className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
              >
                <TrendingUp className="h-4 w-4 mr-1" />
                View Metrics
              </Link>
              <Link
                to={`/versions/${version.id}/fairness`}
                className="inline-flex items-center px-3 py-1.5 text-sm bg-green-50 text-green-700 rounded-md hover:bg-green-100"
              >
                <Shield className="h-4 w-4 mr-1" />
                Fairness
              </Link>
            </div>
          </div>
        ))}
      </div>

      {versions.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <GitBranch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No versions yet</h3>
          <p className="text-gray-600">Create your first model version to get started</p>
        </div>
      )}
    </div>
  );
}
