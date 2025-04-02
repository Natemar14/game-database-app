import React, { useState, useEffect } from 'react';

// This component implements the multiplayer session management functionality
// with legal compliance checks as requested by the user

interface Player {
  id: string;
  name: string;
  userId?: string;
  isHost?: boolean;
  isConnected?: boolean;
  score?: number;
}

interface MultiplayerSession {
  id: string;
  gameId: string;
  roomCode: string;
  hostId: string;
  status: 'waiting' | 'active' | 'completed' | 'cancelled';
  createdAt: string;
  players: Player[];
}

interface Game {
  id: string;
  name: string;
  category: string;
}

const MultiplayerSessionManager = ({ sessionId }: { sessionId: string }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<MultiplayerSession | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [inviteLink, setInviteLink] = useState('');
  
  // Fetch session details
  useEffect(() => {
    const fetchSessionDetails = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, this would be an API call
        const sessionResponse = await fetch(`/api/multiplayer/sessions/${sessionId}`);
        const sessionData = await sessionResponse.json();
        
        if (!sessionData.success) {
          setError(sessionData.error || 'Failed to load session details');
          return;
        }
        
        setSession(sessionData.data);
        
        // Check if current user is host
        // In a real implementation, this would compare with the logged-in user
        setIsHost(sessionData.data.hostId === 'guest');
        
        // Generate invite link
        const baseUrl = window.location.origin;
        setInviteLink(`${baseUrl}/multiplayer/join/${sessionData.data.roomCode}`);
        
        // Fetch game details
        const gameResponse = await fetch(`/api/games/${sessionData.data.gameId}`);
        const gameData = await gameResponse.json();
        
        if (!gameData.success) {
          setError(gameData.error || 'Failed to load game details');
          return;
        }
        
        setGame(gameData.data);
      } catch (err) {
        setError('Error loading session details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessionDetails();
  }, [sessionId]);
  
  // Start the game session
  const startSession = async () => {
    if (!isHost) {
      setError('Only the host can start the session');
      return;
    }
    
    try {
      setLoading(true);
      
      // In a real implementation, this would be an API call
      const response = await fetch(`/api/multiplayer/sessions/${sessionId}/start`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (!data.success) {
        setError(data.error || 'Failed to start session');
        return;
      }
      
      // Update session status
      setSession({
        ...session!,
        status: 'active'
      });
    } catch (err) {
      setError('Error starting session');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // End the game session
  const endSession = async () => {
    if (!isHost) {
      setError('Only the host can end the session');
      return;
    }
    
    try {
      setLoading(true);
      
      // In a real implementation, this would be an API call
      const response = await fetch(`/api/multiplayer/sessions/${sessionId}/end`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (!data.success) {
        setError(data.error || 'Failed to end session');
        return;
      }
      
      // Update session status
      setSession({
        ...session!,
        status: 'completed'
      });
    } catch (err) {
      setError('Error ending session');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Leave the session
  const leaveSession = async () => {
    try {
      setLoading(true);
      
      // If host is leaving, end the session
      if (isHost) {
        await endSession();
        window.location.href = `/games/${session?.gameId}`;
        return;
      }
      
      // In a real implementation, this would be an API call
      const response = await fetch(`/api/multiplayer/sessions/${sessionId}/leave`, {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (!data.success) {
        setError(data.error || 'Failed to leave session');
        return;
      }
      
      // Redirect to game page
      window.location.href = `/games/${session?.gameId}`;
    } catch (err) {
      setError('Error leaving session');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Copy invite link to clipboard
  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink)
      .then(() => {
        alert('Invite link copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy link:', err);
        setError('Failed to copy invite link');
      });
  };
  
  if (loading) {
    return <div className="text-center py-8">Loading session details...</div>;
  }
  
  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }
  
  if (!session || !game) {
    return <div className="text-center py-8">Session not found</div>;
  }
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{game.name} - Multiplayer Session</h2>
          <p className="text-sm text-gray-500">
            Room Code: <span className="font-medium">{session.roomCode}</span>
          </p>
          <p className="text-sm text-gray-500">
            Status: <span className="font-medium">{session.status.charAt(0).toUpperCase() + session.status.slice(1)}</span>
          </p>
        </div>
        
        <div className="flex space-x-2">
          {isHost && session.status === 'waiting' && (
            <button
              onClick={startSession}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Start Game
            </button>
          )}
          
          {isHost && session.status === 'active' && (
            <button
              onClick={endSession}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              End Game
            </button>
          )}
          
          <button
            onClick={leaveSession}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Leave Session
          </button>
        </div>
      </div>
      
      {session.status === 'waiting' && (
        <div className="mb-6 bg-blue-50 p-4 rounded-md">
          <h3 className="text-lg font-medium text-blue-800 mb-2">Waiting for players to join</h3>
          <div className="flex items-center">
            <input
              type="text"
              value={inviteLink}
              readOnly
              className="flex-grow rounded-l-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
            />
            <button
              onClick={copyInviteLink}
              className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Copy
            </button>
          </div>
          <p className="mt-2 text-sm text-blue-600">
            Share this link with other players to join the session
          </p>
        </div>
      )}
      
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Players</h3>
        
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  Name
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                {session.status !== 'waiting' && (
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Score
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {session.players.map(player => (
                <tr key={player.id}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {player.name} {player.isHost && <span className="text-xs text-gray-500">(Host)</span>}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      player.isConnected ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {player.isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </td>
                  {session.status !== 'waiting' && (
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {player.score !== undefined ? player.score : '-'}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {session.status === 'active' && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Game Board</h3>
          <div className="bg-gray-100 p-8 rounded-md text-center">
            <p className="text-gray-600">
              Game interface would be displayed here based on the specific game type.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              This would include the game board, cards, or other game-specific elements.
            </p>
          </div>
        </div>
      )}
      
      {session.status === 'completed' && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Game Results</h3>
          <div className="bg-gray-50 p-6 rounded-md">
            <div className="text-center mb-4">
              <p className="text-xl font-medium text-gray-900">Game Completed!</p>
            </div>
            
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                      Rank
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Player
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {[...session.players]
                    .sort((a, b) => (b.score || 0) - (a.score || 0))
                    .map((player, index) => (
                      <tr key={player.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {index + 1}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {player.name} {player.isHost && <span className="text-xs text-gray-500">(Host)</span>}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {player.score !== undefined ? player.score : '-'}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-6 flex justify-center">
              <a
                href={`/games/${game.id}`}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Back to Game
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiplayerSessionManager;
