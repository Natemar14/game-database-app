import React, { useState, useEffect } from 'react';

// This component implements tournament management functionality
// for the game database app

interface Tournament {
  id: string;
  name: string;
  gameId: string;
  gameName: string;
  typeId: string;
  typeName: string;
  startDate: string;
  endDate: string;
  status: 'upcoming' | 'active' | 'completed';
  playerCount: number;
  createdBy: string;
  createdAt: string;
}

interface TournamentFilters {
  status: 'all' | 'upcoming' | 'active' | 'completed';
  game: string;
  type: string;
}

const TournamentManager = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [filteredTournaments, setFilteredTournaments] = useState<Tournament[]>([]);
  const [games, setGames] = useState<{id: string, name: string}[]>([]);
  const [tournamentTypes, setTournamentTypes] = useState<{id: string, name: string}[]>([]);
  const [filters, setFilters] = useState<TournamentFilters>({
    status: 'all',
    game: '',
    type: ''
  });
  
  // Fetch tournaments, games, and tournament types
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch tournaments
        const tournamentsResponse = await fetch('/api/tournaments');
        const tournamentsData = await tournamentsResponse.json();
        
        if (!tournamentsData.success) {
          setError(tournamentsData.error || 'Failed to load tournaments');
          return;
        }
        
        setTournaments(tournamentsData.data);
        setFilteredTournaments(tournamentsData.data);
        
        // Fetch games
        const gamesResponse = await fetch('/api/games?limit=100');
        const gamesData = await gamesResponse.json();
        
        if (gamesData.success) {
          setGames(gamesData.data.map((game: any) => ({
            id: game.id,
            name: game.name
          })));
        }
        
        // Fetch tournament types
        const typesResponse = await fetch('/api/tournaments/types');
        const typesData = await typesResponse.json();
        
        if (typesData.success) {
          setTournamentTypes(typesData.data.map((type: any) => ({
            id: type.id,
            name: type.name
          })));
        }
      } catch (err) {
        setError('Error loading tournaments');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Apply filters when they change
  useEffect(() => {
    let filtered = [...tournaments];
    
    if (filters.status !== 'all') {
      filtered = filtered.filter(tournament => tournament.status === filters.status);
    }
    
    if (filters.game) {
      filtered = filtered.filter(tournament => tournament.gameId === filters.game);
    }
    
    if (filters.type) {
      filtered = filtered.filter(tournament => tournament.typeId === filters.type);
    }
    
    setFilteredTournaments(filtered);
  }, [filters, tournaments]);
  
  // Update filter value
  const updateFilter = (key: keyof TournamentFilters, value: string) => {
    setFilters({
      ...filters,
      [key]: value
    });
  };
  
  // Start a tournament
  const startTournament = async (tournamentId: string) => {
    try {
      // In a real implementation, this would be an API call
      const response = await fetch(`/api/tournaments/${tournamentId}/start`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (!data.success) {
        setError(data.error || 'Failed to start tournament');
        return;
      }
      
      // Update tournament status in the list
      setTournaments(tournaments.map(tournament => 
        tournament.id === tournamentId 
          ? { ...tournament, status: 'active' as const } 
          : tournament
      ));
    } catch (err) {
      setError('Error starting tournament');
      console.error(err);
    }
  };
  
  // Complete a tournament
  const completeTournament = async (tournamentId: string) => {
    try {
      // In a real implementation, this would be an API call
      const response = await fetch(`/api/tournaments/${tournamentId}/complete`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (!data.success) {
        setError(data.error || 'Failed to complete tournament');
        return;
      }
      
      // Update tournament status in the list
      setTournaments(tournaments.map(tournament => 
        tournament.id === tournamentId 
          ? { ...tournament, status: 'completed' as const } 
          : tournament
      ));
    } catch (err) {
      setError('Error completing tournament');
      console.error(err);
    }
  };
  
  // Delete a tournament
  const deleteTournament = async (tournamentId: string) => {
    if (!confirm('Are you sure you want to delete this tournament? This action cannot be undone.')) {
      return;
    }
    
    try {
      // In a real implementation, this would be an API call
      const response = await fetch(`/api/tournaments/${tournamentId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (!data.success) {
        setError(data.error || 'Failed to delete tournament');
        return;
      }
      
      // Remove tournament from the list
      setTournaments(tournaments.filter(tournament => tournament.id !== tournamentId));
    } catch (err) {
      setError('Error deleting tournament');
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
  
  if (loading) {
    return <div className="text-center py-8">Loading tournaments...</div>;
  }
  
  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tournament Manager</h2>
          <p className="mt-2 text-gray-600">
            Manage your game tournaments
          </p>
        </div>
        
        <a
          href="/tournaments/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Create Tournament
        </a>
      </div>
      
      <div className="mb-6 bg-gray-50 p-4 rounded-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={filters.status}
              onChange={(e) => updateFilter('status', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="upcoming">Upcoming</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Game</label>
            <select
              value={filters.game}
              onChange={(e) => updateFilter('game', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">All Games</option>
              {games.map(game => (
                <option key={game.id} value={game.id}>{game.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Tournament Type</label>
            <select
              value={filters.type}
              onChange={(e) => updateFilter('type', e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">All Types</option>
              {tournamentTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {filteredTournaments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No tournaments found matching your filters.
        </div>
      ) : (
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  Tournament
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Game
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Type
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Dates
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Players
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredTournaments.map(tournament => (
                <tr key={tournament.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {tournament.name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {tournament.gameName}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {tournament.typeName}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <div>{new Date(tournament.startDate).toLocaleDateString()}</div>
                    <div>{new Date(tournament.endDate).toLocaleDateString()}</div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(tournament.status)}`}>
                      {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {tournament.playerCount}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex space-x-2 justify-end">
                      <a
                        href={`/tournaments/${tournament.id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View
                      </a>
                      
                      {tournament.status === 'upcoming' && (
                        <button
                          onClick={() => startTournament(tournament.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Start
                        </button>
                      )}
                      
                      {tournament.status === 'active' && (
                        <button
                          onClick={() => completeTournament(tournament.id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Complete
                        </button>
                      )}
                      
                      <button
                        onClick={() => deleteTournament(tournament.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TournamentManager;
