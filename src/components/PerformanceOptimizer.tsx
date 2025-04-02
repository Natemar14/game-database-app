import React, { useState, useEffect } from 'react';

// This component implements performance optimization for the game database app

interface PerformanceMetric {
  id: string;
  name: string;
  category: string;
  value: number;
  unit: string;
  threshold: number;
  status: 'good' | 'warning' | 'critical';
  timestamp: string;
}

const PerformanceOptimizer = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [optimizing, setOptimizing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Define metric categories
  const categories = [
    'Load Time',
    'Network',
    'Memory',
    'Storage',
    'Rendering',
    'API Response'
  ];
  
  // Fetch performance metrics
  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, this would be an API call
        const response = await fetch('/api/performance/metrics');
        const data = await response.json();
        
        if (!data.success) {
          setError(data.error || 'Failed to load performance metrics');
          return;
        }
        
        setMetrics(data.data);
      } catch (err) {
        setError('Error loading performance metrics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMetrics();
  }, []);
  
  // Initialize with default metrics if none exist
  useEffect(() => {
    if (!loading && metrics.length === 0) {
      const defaultMetrics: PerformanceMetric[] = [
        // Load Time
        {
          id: crypto.randomUUID(),
          name: 'Initial Load Time',
          category: 'Load Time',
          value: 2.3,
          unit: 's',
          threshold: 3,
          status: 'good',
          timestamp: new Date().toISOString()
        },
        {
          id: crypto.randomUUID(),
          name: 'Time to Interactive',
          category: 'Load Time',
          value: 3.5,
          unit: 's',
          threshold: 5,
          status: 'good',
          timestamp: new Date().toISOString()
        },
        {
          id: crypto.randomUUID(),
          name: 'First Contentful Paint',
          category: 'Load Time',
          value: 1.2,
          unit: 's',
          threshold: 2,
          status: 'good',
          timestamp: new Date().toISOString()
        },
        
        // Network
        {
          id: crypto.randomUUID(),
          name: 'API Request Size',
          category: 'Network',
          value: 245,
          unit: 'KB',
          threshold: 500,
          status: 'good',
          timestamp: new Date().toISOString()
        },
        {
          id: crypto.randomUUID(),
          name: 'Image Download Size',
          category: 'Network',
          value: 1.8,
          unit: 'MB',
          threshold: 2,
          status: 'warning',
          timestamp: new Date().toISOString()
        },
        {
          id: crypto.randomUUID(),
          name: 'Asset Caching Efficiency',
          category: 'Network',
          value: 85,
          unit: '%',
          threshold: 80,
          status: 'good',
          timestamp: new Date().toISOString()
        },
        
        // Memory
        {
          id: crypto.randomUUID(),
          name: 'Memory Usage',
          category: 'Memory',
          value: 120,
          unit: 'MB',
          threshold: 150,
          status: 'good',
          timestamp: new Date().toISOString()
        },
        {
          id: crypto.randomUUID(),
          name: 'Memory Leaks',
          category: 'Memory',
          value: 2,
          unit: 'count',
          threshold: 0,
          status: 'warning',
          timestamp: new Date().toISOString()
        },
        {
          id: crypto.randomUUID(),
          name: 'DOM Elements',
          category: 'Memory',
          value: 1250,
          unit: 'count',
          threshold: 1500,
          status: 'good',
          timestamp: new Date().toISOString()
        },
        
        // Storage
        {
          id: crypto.randomUUID(),
          name: 'LocalStorage Usage',
          category: 'Storage',
          value: 2.1,
          unit: 'MB',
          threshold: 5,
          status: 'good',
          timestamp: new Date().toISOString()
        },
        {
          id: crypto.randomUUID(),
          name: 'IndexedDB Size',
          category: 'Storage',
          value: 15.5,
          unit: 'MB',
          threshold: 20,
          status: 'good',
          timestamp: new Date().toISOString()
        },
        {
          id: crypto.randomUUID(),
          name: 'Cache Storage',
          category: 'Storage',
          value: 28.7,
          unit: 'MB',
          threshold: 30,
          status: 'warning',
          timestamp: new Date().toISOString()
        },
        
        // Rendering
        {
          id: crypto.randomUUID(),
          name: 'Frame Rate',
          category: 'Rendering',
          value: 55,
          unit: 'fps',
          threshold: 50,
          status: 'good',
          timestamp: new Date().toISOString()
        },
        {
          id: crypto.randomUUID(),
          name: 'Layout Shifts',
          category: 'Rendering',
          value: 0.12,
          unit: 'CLS',
          threshold: 0.1,
          status: 'warning',
          timestamp: new Date().toISOString()
        },
        {
          id: crypto.randomUUID(),
          name: 'Render Blocking Resources',
          category: 'Rendering',
          value: 3,
          unit: 'count',
          threshold: 5,
          status: 'good',
          timestamp: new Date().toISOString()
        },
        
        // API Response
        {
          id: crypto.randomUUID(),
          name: 'Game Search Response Time',
          category: 'API Response',
          value: 350,
          unit: 'ms',
          threshold: 500,
          status: 'good',
          timestamp: new Date().toISOString()
        },
        {
          id: crypto.randomUUID(),
          name: 'Tournament Creation Time',
          category: 'API Response',
          value: 620,
          unit: 'ms',
          threshold: 600,
          status: 'warning',
          timestamp: new Date().toISOString()
        },
        {
          id: crypto.randomUUID(),
          name: 'Multiplayer Session Join',
          category: 'API Response',
          value: 280,
          unit: 'ms',
          threshold: 300,
          status: 'good',
          timestamp: new Date().toISOString()
        }
      ];
      
      setMetrics(defaultMetrics);
    }
  }, [loading, metrics]);
  
  // Run optimization
  const runOptimization = async () => {
    try {
      setOptimizing(true);
      setError(null);
      
      // Simulate optimization process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update metrics with improved values
      setMetrics(metrics.map(metric => {
        // Improve metrics that are in warning or critical status
        if (metric.status === 'warning' || metric.status === 'critical') {
          const improvement = Math.random() * 0.3 + 0.1; // 10-40% improvement
          let newValue;
          
          // For metrics where lower is better
          if (['s', 'ms', 'MB', 'KB', 'count', 'CLS'].includes(metric.unit)) {
            newValue = metric.value * (1 - improvement);
          } 
          // For metrics where higher is better
          else {
            newValue = metric.value * (1 + improvement);
          }
          
          // Round to 1 decimal place
          newValue = Math.round(newValue * 10) / 10;
          
          // Determine new status
          let newStatus: 'good' | 'warning' | 'critical';
          if (['%', 'fps'].includes(metric.unit)) {
            newStatus = newValue >= metric.threshold ? 'good' : 'warning';
          } else {
            newStatus = newValue <= metric.threshold ? 'good' : 'warning';
          }
          
          return {
            ...metric,
            value: newValue,
            status: newStatus,
            timestamp: new Date().toISOString()
          };
        }
        
        return metric;
      }));
      
      // In a real implementation, this would be an API call to save optimized metrics
      await fetch('/api/performance/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ metrics }),
      });
    } catch (err) {
      setError('Error running optimization');
      console.error(err);
    } finally {
      setOptimizing(false);
    }
  };
  
  // Filter metrics by category
  const filteredMetrics = selectedCategory === 'all' 
    ? metrics 
    : metrics.filter(metric => metric.category === selectedCategory);
  
  // Count metrics by status
  const goodCount = metrics.filter(m => m.status === 'good').length;
  const warningCount = metrics.filter(m => m.status === 'warning').length;
  const criticalCount = metrics.filter(m => m.status === 'critical').length;
  
  if (loading) {
    return <div className="text-center py-8">Loading performance metrics...</div>;
  }
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Performance Optimizer</h2>
          <p className="mt-2 text-gray-600">
            Monitor and optimize application performance
          </p>
        </div>
        
        <button
          onClick={runOptimization}
          disabled={optimizing}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {optimizing ? 'Optimizing...' : 'Run Optimization'}
        </button>
      </div>
      
      {error && (
        <div className="mb-6 bg-red-50 p-4 rounded-md text-red-700">
          {error}
        </div>
      )}
      
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-green-800">Good</h3>
          <p className="text-3xl font-bold text-green-600">{goodCount}</p>
          <p className="text-sm text-green-700">
            {metrics.length > 0 ? Math.round((goodCount / metrics.length) * 100) : 0}% of metrics
          </p>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-yellow-800">Warning</h3>
          <p className="text-3xl font-bold text-yellow-600">{warningCount}</p>
          <p className="text-sm text-yellow-700">
            {metrics.length > 0 ? Math.round((warningCount / metrics.length) * 100) : 0}% of metrics
          </p>
        </div>
        
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-red-800">Critical</h3>
          <p className="text-3xl font-bold text-red-600">{criticalCount}</p>
          <p className="text-sm text-red-700">
            {metrics.length > 0 ? Math.round((criticalCount / metrics.length) * 100) : 0}% of metrics
          </p>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Performance Metrics</h3>
          
          <div>
            <label htmlFor="category" className="sr-only">Category</label>
            <select
              id="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  Metric
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Category
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Value
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Threshold
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredMetrics.map(metric => (
                <tr key={metric.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {metric.name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {metric.category}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    {metric.value} {metric.unit}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {metric.threshold} {metric.unit}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      metric.status === 'good' ? 'bg-green-100 text-green-800' : 
                      metric.status === 'warning' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {metric.status.charAt(0).toUpperCase() + metric.status.slice(1)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {new Date(metric.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Optimization Recommendations</h3>
        
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="text-md font-medium text-gray-900 mb-2">Automatic Optimizations</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• <strong>Image Compression:</strong> Optimize images to reduce download size</li>
            <li>• <strong>Code Splitting:</strong> Split JavaScript bundles to improve initial load time</li>
            <li>• <strong>Memory Leak Detection:</strong> Identify and fix memory leaks in components</li>
            <li>• <strong>Cache Optimization:</strong> Improve caching strategy for frequently accessed data</li>
     
(Content truncated due to size limit. Use line ranges to read in chunks)