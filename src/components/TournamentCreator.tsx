import React, { useState, useEffect } from 'react';

// This component implements tournament creation functionality
// for the game database app

interface Game {
  id: string;
  name: string;
  category: string;
}

interface TournamentType {
  id: string;
  name: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
}

const TournamentCreator = ({ gameId }: { gameId: string }) => {
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [tournamentTypes, setTournamentTypes] = useState<TournamentType[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [tournamentName, setTournamentName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(8);
  const [players, setPlayers] = useState<string[]>(['']);
  
  // Fetch game details and tournament types
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch game details
        const gameResponse = await fetch(`/api/games/${gameId}`);
        const gameData = await gameResponse.json();
        
        if (!gameData.success) {
          setError(gameData.error || 'Failed to load game details');
          return;
        }
        
        setGame(gameData.data);
        setTournamentName(`${gameData.data.name} Tournament`);
        
        // Fetch tournament types
        const typesResponse = await fetch('/api/tournaments/types');
        const typesData = await typesResponse.json();
        
        if (!typesData.success) {
          setError(typesData.error || 'Failed to load tournament types');
          return;
        }
        
        setTournamentTypes(typesData.data);
        if (typesData.data.length > 0) {
          setSelectedType(typesData.data[0].id);
        }
        
        // Set default dates
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);
        
        setStartDate(today.toISOString().split('T')[0]);
        setEndDate(nextWeek.toISOString().split('T')[0]);
      } catch (err) {
        setError('Error loading data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [gameId]);
  
  // Add player field
  const addPlayer = () => {
    if (players.length >= maxPlayers) {
      setError(`Maximum ${maxPlayers} players allowed`);
      return;
    }
    
    setPlayers([...players, '']);
  };
  
  // Remove player field
  const removePlayer = (index: number) => {
    if (players.length <= 1) {
      setError('At least one player is required');
      return;
    }
    
    const newPlayers = [...players];
    newPlayers.splice(index, 1);
    setPlayers(newPlayers);
  };
  
  // Update player name
  const updatePlayer = (index: number, name: string) => {
    const newPlayers = [...players];
    newPlayers[index] = name;
    setPlayers(newPlayers);
  };
  
  // Create tournament
  const createTournament = async () => {
    // Validate inputs
    if (!tournamentName.trim()) {
      setError('Tournament name is required');
      return;
    }
    
    if (!selectedType) {
      setError('Tournament type is required');
      return;
    }
    
    if (!startDate || !endDate) {
      setError('Start and end dates are required');
      return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
      setError('End date must be after start date');
      return;
    }
    
    // Filter out empty player names
    const validPlayers = players.filter(name => name.trim());
    if (validPlayers.length < 2) {
      setError('At least 2 players are required');
      return;
    }
    
    const selectedTournamentType = tournamentTypes.find(type => type.id === selectedType);
    if (selectedTournamentType && validPlayers.length < selectedTournamentType.minPlayers) {
      setError(`This tournament type requires at least ${selectedTournamentType.minPlayers} players`);
      return;
    }
    
    try {
      setCreating(true);
      setError(null);
      
      // In a real implementation, this would be an API call
      const response = await fetch('/api/tournaments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId,
          name: tournamentName,
          description,
          typeId: selectedType,
          startDate,
          endDate,
          players: validPlayers.map(name => ({ name })),
          maxPlayers
        }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        setError(data.error || 'Failed to create tournament');
        return;
      }
      
      // Redirect to the tournament page
      window.location.href = `/tournaments/${data.data.id}`;
    } catch (err) {
      setError('Error creating tournament');
      console.error(err);
    } finally {
      setCreating(false);
    }
  };
  
  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }
  
  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }
  
  if (!game) {
    return <div className="text-center py-8">Game not found</div>;
  }
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create Tournament</h2>
        <p className="mt-2 text-gray-600">
          Create a new tournament for {game.name}
        </p>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Tournament Name</label>
          <input
            type="text"
            value={tournamentName}
            onChange={(e) => setTournamentName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Tournament Type</label>
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            {tournamentTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.name} ({type.minPlayers}-{type.maxPlayers} players)
              </option>
            ))}
          </select>
          
          {selectedType && (
            <p className="mt-2 text-sm text-gray-500">
              {tournamentTypes.find(type => type.id === selectedType)?.description}
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Maximum Players</label>
          <select
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            {[4, 8, 16, 32, 64].map(num => (
              <option key={num} value={num}>
                {num} players
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-700">Players</label>
            <button
              onClick={addPlayer}
              disabled={players.length >= maxPlayers}
              className={`inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                players.length >= maxPlayers
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
              }`}
            >
              Add Player
            </button>
          </div>
          
          {players.map((player, index) => (
            <div key={index} className="flex items-center space-x-4 mb-4">
              <div className="flex-grow">
                <label className="block text-sm font-medium text-gray-700">
                  {index === 0 ? 'Player 1 (You)' : `Player ${index + 1}`}
                </label>
                <input
                  type="text"
                  value={player}
                  onChange={(e) => updatePlayer(index, e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
              {index > 0 && (
                <button
                  onClick={() => removePlayer(index)}
                  className="mt-6 text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-8 flex justify-end">
        <button
          onClick={createTournament}
          disabled={creating}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {creating ? 'Creating...' : 'Create Tournament'}
        </button>
      </div>
    </div>
  );
};

export default TournamentCreator;
