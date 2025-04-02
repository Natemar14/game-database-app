import React, { useState, useEffect } from 'react';

// This component implements tournament bracket visualization and management
// for the game database app

interface Player {
  id: string;
  name: string;
}

interface Match {
  id: string;
  round: number;
  position: number;
  player1Id: string | null;
  player2Id: string | null;
  winnerId: string | null;
  score1: number | null;
  score2: number | null;
  status: 'pending' | 'in_progress' | 'completed';
}

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
  players: Player[];
}

const TournamentBracket = ({ tournamentId }: { tournamentId: string }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [score1, setScore1] = useState<number | null>(null);
  const [score2, setScore2] = useState<number | null>(null);
  const [updatingScore, setUpdatingScore] = useState(false);
  
  // Fetch tournament details and matches
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch tournament details
        const tournamentResponse = await fetch(`/api/tournaments/${tournamentId}`);
        const tournamentData = await tournamentResponse.json();
        
        if (!tournamentData.success) {
          setError(tournamentData.error || 'Failed to load tournament details');
          return;
        }
        
        setTournament(tournamentData.data);
        
        // Fetch tournament matches
        const matchesResponse = await fetch(`/api/tournaments/${tournamentId}/matches`);
        const matchesData = await matchesResponse.json();
        
        if (!matchesData.success) {
          setError(matchesData.error || 'Failed to load tournament matches');
          return;
        }
        
        setMatches(matchesData.data);
      } catch (err) {
        setError('Error loading tournament data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [tournamentId]);
  
  // Get player name by ID
  const getPlayerName = (playerId: string | null) => {
    if (!playerId || !tournament) return 'TBD';
    const player = tournament.players.find(p => p.id === playerId);
    return player ? player.name : 'Unknown';
  };
  
  // Select a match to update
  const selectMatch = (match: Match) => {
    setSelectedMatch(match);
    setScore1(match.score1);
    setScore2(match.score2);
  };
  
  // Update match score
  const updateMatchScore = async () => {
    if (!selectedMatch) return;
    
    // Validate scores
    if (score1 === null || score2 === null) {
      setError('Both scores are required');
      return;
    }
    
    if (score1 === score2) {
      setError('Scores cannot be equal in a tournament match');
      return;
    }
    
    try {
      setUpdatingScore(true);
      setError(null);
      
      // Determine winner based on scores
      const winnerId = score1 > score2 ? selectedMatch.player1Id : selectedMatch.player2Id;
      
      // In a real implementation, this would be an API call
      const response = await fetch(`/api/tournaments/${tournamentId}/matches/${selectedMatch.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          score1,
          score2,
          winnerId,
          status: 'completed'
        }),
      });
      
      const data = await response.json();
      
      if (!data.success) {
        setError(data.error || 'Failed to update match');
        return;
      }
      
      // Update matches list
      setMatches(matches.map(match => 
        match.id === selectedMatch.id 
          ? { 
              ...match, 
              score1, 
              score2, 
              winnerId, 
              status: 'completed' as const
            } 
          : match
      ));
      
      // Update next round match if applicable
      const nextRoundMatches = matches.filter(m => 
        m.round === selectedMatch.round + 1 && 
        Math.floor(selectedMatch.position / 2) === Math.floor(m.position / 2)
      );
      
      if (nextRoundMatches.length > 0) {
        const nextMatch = nextRoundMatches[0];
        const isFirstMatch = selectedMatch.position % 2 === 0;
        
        const updatedNextMatch = {
          ...nextMatch,
          player1Id: isFirstMatch ? winnerId : nextMatch.player1Id,
          player2Id: !isFirstMatch ? winnerId : nextMatch.player2Id
        };
        
        // Update next match in the bracket
        setMatches(matches.map(match => 
          match.id === nextMatch.id ? updatedNextMatch : match
        ));
        
        // In a real implementation, this would be an API call to update the next match
        await fetch(`/api/tournaments/${tournamentId}/matches/${nextMatch.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            player1Id: updatedNextMatch.player1Id,
            player2Id: updatedNextMatch.player2Id
          }),
        });
      }
      
      // Clear selection
      setSelectedMatch(null);
    } catch (err) {
      setError('Error updating match');
      console.error(err);
    } finally {
      setUpdatingScore(false);
    }
  };
  
  // Organize matches by round
  const matchesByRound = matches.reduce((acc, match) => {
    if (!acc[match.round]) {
      acc[match.round] = [];
    }
    acc[match.round].push(match);
    return acc;
  }, {} as Record<number, Match[]>);
  
  // Sort rounds and matches within rounds
  const sortedRounds = Object.keys(matchesByRound)
    .map(Number)
    .sort((a, b) => a - b);
  
  sortedRounds.forEach(round => {
    matchesByRound[round].sort((a, b) => a.position - b.position);
  });
  
  if (loading) {
    return <div className="text-center py-8">Loading tournament bracket...</div>;
  }
  
  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }
  
  if (!tournament) {
    return <div className="text-center py-8">Tournament not found</div>;
  }
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{tournament.name}</h2>
        <p className="mt-2 text-gray-600">
          {tournament.gameName} - {tournament.typeName}
        </p>
        <div className="mt-2 flex space-x-4 text-sm text-gray-500">
          <div>Start: {new Date(tournament.startDate).toLocaleDateString()}</div>
          <div>End: {new Date(tournament.endDate).toLocaleDateString()}</div>
          <div>
            Status: 
            <span className={`ml-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              tournament.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
              tournament.status === 'active' ? 'bg-green-100 text-green-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1)}
            </span>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Tournament Bracket</h3>
        
        <div className="overflow-auto">
          <div className="flex space-x-8 min-w-max">
            {sortedRounds.map(round => (
              <div key={round} className="flex-shrink-0">
                <div className="mb-4 text-center font-medium text-gray-700">
                  {round === Math.max(...sortedRounds) ? 'Final' : 
                   round === Math.max(...sortedRounds) - 1 ? 'Semi-Finals' :
                   round === Math.max(...sortedRounds) - 2 ? 'Quarter-Finals' :
                   `Round ${round + 1}`}
                </div>
                
                <div className="space-y-8">
                  {matchesByRound[round].map(match => (
                    <div 
                      key={match.id} 
                      className={`border rounded-md overflow-hidden ${
                        selectedMatch?.id === match.id ? 'ring-2 ring-indigo-500' : ''
                      }`}
                      style={{ width: '240px' }}
                    >
                      <div 
                        className={`p-3 cursor-pointer ${
                          match.status === 'completed' ? 'bg-gray-50' : 
                          match.status === 'in_progress' ? 'bg-blue-50' : 'bg-white'
                        }`}
                        onClick={() => match.player1Id && match.player2Id ? selectMatch(match) : null}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <div className="font-medium">{getPlayerName(match.player1Id)}</div>
                          <div className="text-gray-700">{match.score1 !== null ? match.score1 : '-'}</div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="font-medium">{getPlayerName(match.player2Id)}</div>
                          <div className="text-gray-700">{match.score2 !== null ? match.score2 : '-'}</div>
                        </div>
                        
                        {match.status === 'completed' && match.winnerId && (
                          <div className="mt-2 text-xs text-green-600">
                            Winner: {getPlayerName(match.winnerId)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {selectedMatch && (
        <div className="mt-8 bg-gray-50 p-4 rounded-md">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Update Match Result</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {getPlayerName(selectedMatch.player1Id)} Score
              </label>
              <input
                type="number"
                min="0"
                value={score1 === null ? '' : score1}
                onChange={(e) => setScore1(e.target.value ? parseInt(e.target.value) : null)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {getPlayerName(selectedMatch.player2Id)} Score
              </label>
              <input
                type="number"
                min="0"
                value={score2 === null ? '' : score2}
                onChange={(e) => setScore2(e.target.value ? parseInt(e.target.value) : null)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setSelectedMatch(null)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            
            <button
              onClick={updateMatchScore}
              disabled={updatingScore}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {updatingScore ? 'Updating...' : 'Update Result'}
            </button>
          </div>
        </div>
      )}
      
      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Participants</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tournament.players.map(player => (
            <div key={player.id} className="bg-gray-50 p-3 rounded-md">
              {player.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TournamentBracket;
