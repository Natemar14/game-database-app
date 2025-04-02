import React, { useState, useEffect } from 'react';

// This component implements the multiplayer join functionality
// with legal compliance checks as requested by the user

interface MultiplayerSession {
  id: string;
  gameId: string;
  roomCode: string;
  hostId: string;
  status: 'waiting' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
  players: any[];
  maxPlayers: number;
}

interface Game {
  id: string;
  name: string;
  category: string;
}

const MultiplayerJoin = ({ roomCode }: { roomCode: string }) => {
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<MultiplayerSession | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [playerName, setPlayerName] = useState('');
  
  // Fetch session details by room code
  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, this would be an API call
        const sessionResponse = await fetch(`/api/multiplayer/sessions/code/${roomCode}`);
        const sessionData = await sessionResponse.json();
        
        if (!sessionData.success) {
          setError(sessionData.error || 'Failed to load session details');
          return;
        }
        
        // Check if session is joinable
        if (sessionData.data.status !== 'waiting') {
          setError('This session is no longer accepting new players');
          return;
        }
        
        // Check if session is full
        if (sessionData.data.players.length >= sessionData.data.maxPlayers) {
          setError('This session is full');
          return;
        }
        
        setSession(sessionData.data);
        
        // Fetch game details
        const gameResponse = await fetch(`/api/games/${sessionData.data.gameId}`);
        const gameData = await gameResponse.json();
        
        if (!gameData.success) {
          setError(gameData.error || 'Failed to load game details');
          return;
        }
        
        setGame(gameData.data);
        
        // Check legal status
        const legalResponse = await fetch(`/api/games/${sessionData.data.gameId}/legal`);
        const legalData = await legalResponse.json();
        
        if (!legalData.success || !legalData.data.canPlay) {
          setError('This game cannot be played due to legal restrictions');
          return;
        }
      } catch (err) {
        setError('Error loading session details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    if (roomCode) {
      fetchSessionDetails();
    }
  }, [roomCode]);
  
  // Join the session
  const joinSession = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    
    try {
      setJoining(true);
      setError(null);
      
      // In a real implementation, this would be an API call
      const response = await fetch(`/api/multiplayer/sessions/${session?.id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerName
        }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        setError(data.error || 'Failed to join session');
        return;
      }
      
      // Redirect to the session page
      window.location.href = `/multiplayer/sessions/${session?.id}`;
    } catch (err) {
      setError('Error joining session');
      console.error(err);
    } finally {
      setJoining(false);
    }
  };
  
  if (loading) {
    return <div className="text-center py-8">Loading session details...</div>;
  }
  
  if (error) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">{error}</div>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }
  
  if (!session || !game) {
    return <div className="text-center py-8">Session not found</div>;
  }
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Join Multiplayer Session</h2>
        <p className="mt-2 text-gray-600">
          You're joining a {game.name} session hosted by {session.players.find(p => p.isHost)?.name || 'Unknown'}
        </p>
      </div>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700">Your Name</label>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter your name"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Session Details</h3>
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Game</p>
              <p className="font-medium">{game.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Category</p>
              <p className="font-medium">{game.category}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Room Code</p>
              <p className="font-medium">{session.roomCode}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Players</p>
              <p className="font-medium">{session.players.length} / {session.maxPlayers}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Current Players</h3>
        <ul className="bg-gray-50 rounded-md divide-y divide-gray-200">
          {session.players.map(player => (
            <li key={player.id} className="px-4 py-3">
              {player.name} {player.isHost && <span className="text-xs text-gray-500">(Host)</span>}
            </li>
          ))}
        </ul>
      </div>
      
      <div className="mt-8 flex justify-end space-x-4">
        <a
          href="/"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Cancel
        </a>
        <button
          onClick={joinSession}
          disabled={joining}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {joining ? 'Joining...' : 'Join Session'}
        </button>
      </div>
    </div>
  );
};

export default MultiplayerJoin;
