import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import {
  Plus,
  Box,
  Search,
  Filter,
  TrendingUp,
  Calendar,
  Tag,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface Model {
  id: string;
  name: string;
  description: string;
  model_type: string;
  use_case: string;
  created_at: string;
}

export function Models() {
  const [models, setModels] = useState<Model[]>([]);
  const [filteredModels, setFilteredModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    model_type: 'classification',
    use_case: '',
  });

  useEffect(() => {
    loadModels();
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  useEffect(() => {
    filterModels();
  }, [models, searchQuery, selectedType]);

  const loadModels = async () => {
    try {
      const data = await api.get('/models');
      setModels(data);
    } catch (error) {
      console.error('Failed to load models:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterModels = () => {
    let filtered = models;

    if (searchQuery) {
      filtered = filtered.filter(
        (m) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.use_case?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter((m) => m.model_type === selectedType);
    }

    setFilteredModels(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/models', formData);
      setShowForm(false);
      setFormData({ name: '', description: '', model_type: 'classification', use_case: '' });
      loadModels();
    } catch (error: any) {
      alert('Failed to create model: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const modelTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'classification', label: 'Classification' },
    { value: 'regression', label: 'Regression' },
    { value: 'clustering', label: 'Clustering' },
    { value: 'ranking', label: 'Ranking' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Models
          </h1>
          <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage and monitor your machine learning models
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Model
        </button>
      </div>

      {showForm && (
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md p-8 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <h2 className={`text-2xl font-semibold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Create New Model
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Model Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Model Type
                </label>
                <select
                  value={formData.model_type}
                  onChange={(e) => setFormData({ ...formData, model_type: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg border ${
                    isDark
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  } focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="classification">Classification</option>
                  <option value="regression">Regression</option>
                  <option value="clustering">Clustering</option>
                  <option value="ranking">Ranking</option>
                </select>
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500`}
                rows={3}
              />
            </div>
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Use Case
              </label>
              <input
                type="text"
                value={formData.use_case}
                onChange={(e) => setFormData({ ...formData, use_case: e.target.value })}
                className={`w-full px-4 py-2 rounded-lg border ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500`}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-colors"
              >
                Create Model
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                  isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md p-6 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className={`absolute left-3 top-3 h-5 w-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="Search models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
              } focus:ring-2 focus:ring-blue-500`}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className={`px-4 py-2 rounded-lg border ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500`}
            >
              {modelTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModels.map((model) => (
          <Link
            key={model.id}
            to={`/models/${model.id}`}
            className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md p-6 border ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            } hover:shadow-lg hover:border-blue-400 transition-all duration-300 group cursor-pointer`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-blue-100'}`}>
                <Box className={`h-6 w-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                model.model_type === 'classification'
                  ? `${isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-800'}`
                  : model.model_type === 'regression'
                  ? `${isDark ? 'bg-green-900/30 text-green-300' : 'bg-green-100 text-green-800'}`
                  : model.model_type === 'clustering'
                  ? `${isDark ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-100 text-purple-800'}`
                  : `${isDark ? 'bg-orange-900/30 text-orange-300' : 'bg-orange-100 text-orange-800'}`
              }`}>
                {model.model_type.charAt(0).toUpperCase() + model.model_type.slice(1)}
              </span>
            </div>
            <h3 className={`font-semibold text-lg mb-2 group-hover:text-blue-600 transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {model.name}
            </h3>
            {model.description && (
              <p className={`text-sm mb-3 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {model.description}
              </p>
            )}
            {model.use_case && (
              <div className={`flex items-center gap-2 text-xs mb-4 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                <Tag className="h-4 w-4" />
                <span>{model.use_case}</span>
              </div>
            )}
            <div className={`flex items-center gap-2 text-xs pt-4 border-t ${isDark ? 'border-gray-700 text-gray-500' : 'border-gray-200 text-gray-600'}`}>
              <Calendar className="h-4 w-4" />
              <span>{new Date(model.created_at).toLocaleDateString()}</span>
            </div>
          </Link>
        ))}
      </div>

      {filteredModels.length === 0 && (
        <div className={`text-center py-16 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <Box className={`h-16 w-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
            {models.length === 0 ? 'No models yet' : 'No models match your search'}
          </h3>
          <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {models.length === 0
              ? 'Get started by creating your first ML model'
              : 'Try adjusting your search or filters'}
          </p>
          {models.length === 0 && (
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Model
            </button>
          )}
        </div>
      )}
    </div>
  );
}
