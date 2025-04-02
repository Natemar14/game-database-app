import React, { useState, useEffect } from 'react';

// This component implements the multiplayer session creation functionality
// with legal compliance checks as requested by the user

interface Player {
  id: string;
  name: string;
  userId?: string;
  isHost?: boolean;
}

interface LegalStatus {
  canPlay: boolean;
  reason?: string;
  licenseInfo?: string;
  copyrightOwner?: string;
  playRestrictions?: string[];
}

interface Game {
  id: string;
  name: string;
  category: string;
  legalStatus?: LegalStatus;
}

const MultiplayerSessionCreator = ({ gameId }: { gameId: string }) => {
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [legalStatus, setLegalStatus] = useState<LegalStatus | null>(null);
  const [players, setPlayers] = useState<Player[]>([
    { id: crypto.randomUUID(), name: 'Player 1 (You)', isHost: true }
  ]);
  const [maxPlayers, setMaxPlayers] = useState(4);
  
  // Fetch game details and legal status
  useEffect(() => {
    const fetchGameDetails = async () => {
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
        
        // Fetch legal status
        const legalResponse = await fetch(`/api/games/${gameId}/legal`);
        const legalData = await legalResponse.json();
        
        if (!legalData.success) {
          setError(legalData.error || 'Failed to check legal status');
          return;
        }
        
        setLegalStatus(legalData.data);
      } catch (err) {
        setError('Error loading game details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGameDetails();
  }, [gameId]);
  
  // Add a new player
  const addPlayer = () => {
    if (players.length >= maxPlayers) {
      setError(`Maximum ${maxPlayers} players allowed`);
      return;
    }
    
    setPlayers([
      ...players,
      { id: crypto.randomUUID(), name: `Player ${players.length + 1}` }
    ]);
  };
  
  // Remove a player
  const removePlayer = (id: string) => {
    if (players.length <= 1) {
      setError('At least one player is required');
      return;
    }
    
    setPlayers(players.filter(player => player.id !== id));
  };
  
  // Update player name
  const updatePlayerName = (id: string, name: string) => {
    setPlayers(players.map(player => 
      player.id === id ? { ...player, name } : player
    ));
  };
  
  // Create multiplayer session
  const createSession = async () => {
    // Check if game can be played based on legal status
    if (legalStatus && !legalStatus.canPlay) {
      setError(`Cannot create multiplayer session: ${legalStatus.reason}`);
      return;
    }
    
    try {
      setCreating(true);
      setError(null);
      
      // In a real implementation, this would be an API call
      const response = await fetch('/api/multiplayer/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gameId,
          players,
          maxPlayers
        }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        setError(data.error || 'Failed to create multiplayer session');
        return;
      }
      
      // Redirect to the session page
      window.location.href = `/multiplayer/sessions/${data.data.id}`;
    } catch (err) {
      setError('Error creating multiplayer session');
      console.error(err);
    } finally {
      setCreating(false);
    }
  };
  
  if (loading) {
    return <div className="text-center py-8">Loading game details...</div>;
  }
  
  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }
  
  if (!game) {
    return <div className="text-center py-8">Game not found</div>;
  }
  
  // If game cannot be played due to legal restrictions
  if (legalStatus && !legalStatus.canPlay) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Multiplayer Not Available</h2>
          <p className="mt-2 text-red-600">{legalStatus.reason}</p>
        </div>
        
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Legal Information</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>{legalStatus.licenseInfo}</p>
                {legalStatus.copyrightOwner && (
                  <p className="mt-1">Copyright Owner: {legalStatus.copyrightOwner}</p>
                )}
                {legalStatus.playRestrictions && legalStatus.playRestrictions.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium">Restrictions:</p>
                    <ul className="list-disc pl-5 mt-1">
                      {legalStatus.playRestrictions.map((restriction, index) => (
                        <li key={index}>{restriction}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <p className="text-gray-600">
            While multiplayer gameplay is not available due to legal restrictions, 
            you can still use the scoresheet functionality to track scores for physical gameplay.
          </p>
          <div className="mt-4">
            <a
              href={`/games/${gameId}/scoresheets`}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              View Scoresheets
            </a>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create Multiplayer Session</h2>
        <p className="mt-2 text-gray-600">
          Create a new multiplayer session for {game.name}
        </p>
      </div>
      
      {legalStatus && legalStatus.playRestrictions && legalStatus.playRestrictions.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Legal Information</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>{legalStatus.licenseInfo}</p>
                <div className="mt-2">
                  <p className="font-medium">Restrictions:</p>
                  <ul className="list-disc pl-5 mt-1">
                    {legalStatus.playRestrictions.map((restriction, index) => (
                      <li key={index}>{restriction}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700">Maximum Players</label>
        <select
          value={maxPlayers}
          onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          {[2, 3, 4, 5, 6, 8, 10].map(num => (
            <option key={num} value={num}>
              {num} players
            </option>
          ))}
        </select>
      </div>
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Players</h3>
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
          <div key={player.id} className="flex items-center space-x-4 mb-4">
            <div className="flex-grow">
              <label className="block text-sm font-medium text-gray-700">
                {index === 0 ? 'Your Name' : `Player ${index + 1}`}
              </label>
              <input
                type="text"
                value={player.name}
                onChange={(e) => updatePlayerName(player.id, e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            {index > 0 && (
              <button
                onClick={() => removePlayer(player.id)}
                className="mt-6 text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-8 flex justify-end">
        <button
          onClick={createSession}
          disabled={creating}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {creating ? 'Creating...' : 'Create Session'}
        </button>
      </div>
    </div>
  );
};

export default MultiplayerSessionCreator;
