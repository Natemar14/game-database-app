import React, { useState, useEffect } from 'react';

// This component implements tournament series management functionality
// for the game database app

interface Series {
  id: string;
  name: string;
  description: string;
  gameId: string;
  gameName: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed';
  tournamentCount: number;
  createdBy: string;
  createdAt: string;
}

interface Tournament {
  id: string;
  name: string;
  seriesId: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed';
  playerCount: number;
}

const SeriesManager = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [series, setSeries] = useState<Series[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [games, setGames] = useState<{id: string, name: string}[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    gameId: '',
    startDate: '',
    endDate: ''
  });
  const [creating, setCreating] = useState(false);
  
  // Fetch series and games
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch series
        const seriesResponse = await fetch('/api/series');
        const seriesData = await seriesResponse.json();
        
        if (!seriesData.success) {
          setError(seriesData.error || 'Failed to load series');
          return;
        }
        
        setSeries(seriesData.data);
        
        // Fetch games
        const gamesResponse = await fetch('/api/games?limit=100');
        const gamesData = await gamesResponse.json();
        
        if (gamesData.success) {
          setGames(gamesData.data.map((game: any) => ({
            id: game.id,
            name: game.name
          })));
        }
      } catch (err) {
        setError('Error loading series data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Fetch tournaments for selected series
  useEffect(() => {
    if (!selectedSeries) {
      setTournaments([]);
      return;
    }
    
    const fetchTournaments = async () => {
      try {
        setLoading(true);
        
        // Fetch tournaments for the selected series
        const response = await fetch(`/api/series/${selectedSeries.id}/tournaments`);
        const data = await response.json();
        
        if (!data.success) {
          setError(data.error || 'Failed to load tournaments');
          return;
        }
        
        setTournaments(data.data);
      } catch (err) {
        setError('Error loading tournaments');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTournaments();
  }, [selectedSeries]);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Create new series
  const createSeries = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    if (!formData.name.trim()) {
      setError('Series name is required');
      return;
    }
    
    if (!formData.gameId) {
      setError('Game is required');
      return;
    }
    
    if (!formData.startDate || !formData.endDate) {
      setError('Start and end dates are required');
      return;
    }
    
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError('End date must be after start date');
      return;
    }
    
    try {
      setCreating(true);
      setError(null);
      
      // In a real implementation, this would be an API call
      const response = await fetch('/api/series', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        setError(data.error || 'Failed to create series');
        return;
      }
      
      // Add new series to the list
      const newSeries = {
        ...data.data,
        gameName: games.find(game => game.id === formData.gameId)?.name || 'Unknown',
        tournamentCount: 0,
        status: 'upcoming' as const
      };
      
      setSeries([...series, newSeries]);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        gameId: '',
        startDate: '',
        endDate: ''
      });
      
      setShowCreateForm(false);
    } catch (err) {
      setError('Error creating series');
      console.error(err);
    } finally {
      setCreating(false);
    }
  };
  
  // Add tournament to series
  const addTournamentToSeries = async () => {
    if (!selectedSeries) return;
    
    try {
      // Redirect to tournament creation page with series ID
      window.location.href = `/tournaments/create?seriesId=${selectedSeries.id}`;
    } catch (err) {
      setError('Error navigating to tournament creation');
      console.error(err);
    }
  };
  
  // Delete series
  const deleteSeries = async (seriesId: string) => {
    if (!confirm('Are you sure you want to delete this series? This will not delete the tournaments in the series.')) {
      return;
    }
    
    try {
      // In a real implementation, this would be an API call
      const response = await fetch(`/api/series/${seriesId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (!data.success) {
        setError(data.error || 'Failed to delete series');
        return;
      }
      
      // Remove series from the list
      setSeries(series.filter(s => s.id !== seriesId));
      
      // Clear selection if the deleted series was selected
      if (selectedSeries && selectedSeries.id === seriesId) {
        setSelectedSeries(null);
      }
    } catch (err) {
      setError('Error deleting series');
      console.error(err);
    }
  };
  
  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-yellow-100 text-yellow-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (loading && !selectedSeries) {
    return <div className="text-center py-8">Loading series data...</div>;
  }
  
  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Series Manager</h2>
          <p className="mt-2 text-gray-600">
            Manage your game tournament series
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {showCreateForm ? 'Cancel' : 'Create Series'}
        </button>
      </div>
      
      {showCreateForm && (
        <div className="mb-8 bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Series</h3>
          
          <form onSubmit={createSeries}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Series Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Game</label>
                <select
                  name="gameId"
                  value={formData.gameId}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select a game</option>
                  {games.map(game => (
                    <option key={game.id} value={game.id}>{game.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {creating ? 'Creating...' : 'Create Series'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Your Series</h3>
          
          {series.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No series found. Create your first series to get started.
            </div>
          ) : (
            <div className="space-y-3">
              {series.map(s => (
                <div 
                  key={s.id} 
                  className={`border rounded-md p-3 cursor-pointer ${
                    selectedSeries?.id === s.id ? 'border-indigo-500 bg-indigo-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedSeries(s)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{s.name}</h4>
                      <p className="text-sm text-gray-500">{s.gameName}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(s.status)}`}>
                      {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    {new Date(s.startDate).toLocaleDateString()} - {new Date(s.endDate).toLocaleDateString()}
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {s.tournamentCount} tournament{s.tournamentCount !== 1 ? 's' : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="md:col-span-2">
          {selectedSeries ? (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">{selectedSeries.name} Details</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={addTournamentToSeries}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Add Tournament
                  </button>
                  <button
                    onClick={() => deleteSeries(selectedSeries.id)}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-red-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Delete Series
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Game</p>
                    <p className="font-medium">{selectedSeries.gameName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-medium">{selectedSeries.status.charAt(0).toUpperCase() + selectedSeries.status.slice(1)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="font-medium">{new Date(selectedSeries.startDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">End Date</p>
                    <p className="font-medium">{new Date(selectedSeries.endDate).toLocaleDateString()}</p>
                  </div>
                </div>
                
                {selectedSeries.description && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">Description</p>
                    <p className="mt-1">{selectedSeries.description}</p>
                  </div>
                )}
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tournaments in this Series</h3>
              
              {loading ? (
                <div className="text-center py-8">Loading tournaments...</div>
(Content truncated due to size limit. Use line ranges to read in chunks)