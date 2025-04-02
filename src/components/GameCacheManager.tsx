import React, { useState, useEffect } from 'react';

// This component implements the game caching and favorites system
// as requested by the user

interface Game {
  id: string;
  name: string;
  description: string;
  category: string;
  complexity: number;
}

interface CacheStats {
  totalCached: number;
  topSearched: Game[];
  cacheSize: string;
  hitRate: number;
}

const GameCacheManager = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);
  const [cachedGames, setCachedGames] = useState<Game[]>([]);
  
  // Fetch cache statistics and cached games
  useEffect(() => {
    const fetchCacheData = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, these would be API calls
        const statsResponse = await fetch('/api/cache/stats');
        const statsData = await statsResponse.json();
        
        if (!statsData.success) {
          setError(statsData.error || 'Failed to load cache statistics');
          return;
        }
        
        setCacheStats(statsData.data);
        
        const gamesResponse = await fetch('/api/cache/games');
        const gamesData = await gamesResponse.json();
        
        if (!gamesData.success) {
          setError(gamesData.error || 'Failed to load cached games');
          return;
        }
        
        setCachedGames(gamesData.data);
      } catch (err) {
        setError('Error loading cache data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCacheData();
  }, []);
  
  // Clear the entire cache
  const clearCache = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, this would be an API call
      const response = await fetch('/api/cache/clear', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (!data.success) {
        setError(data.error || 'Failed to clear cache');
        return;
      }
      
      // Refresh cache data
      setCachedGames([]);
      setCacheStats({
        totalCached: 0,
        topSearched: [],
        cacheSize: '0 KB',
        hitRate: 0
      });
    } catch (err) {
      setError('Error clearing cache');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Remove a specific game from cache
  const removeFromCache = async (gameId: string) => {
    try {
      setLoading(true);
      
      // In a real implementation, this would be an API call
      const response = await fetch(`/api/cache/games/${gameId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!data.success) {
        setError(data.error || 'Failed to remove game from cache');
        return;
      }
      
      // Update cached games list
      setCachedGames(cachedGames.filter(game => game.id !== gameId));
      
      // Update cache stats
      if (cacheStats) {
        setCacheStats({
          ...cacheStats,
          totalCached: cacheStats.totalCached - 1,
          topSearched: cacheStats.topSearched.filter(game => game.id !== gameId)
        });
      }
    } catch (err) {
      setError('Error removing game from cache');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <div className="text-center py-8">Loading cache data...</div>;
  }
  
  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Game Cache Manager</h2>
        
        <button
          onClick={clearCache}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Clear Cache
        </button>
      </div>
      
      {cacheStats && (
        <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900">Total Cached</h3>
            <p className="text-3xl font-bold text-indigo-600">{cacheStats.totalCached}</p>
            <p className="text-sm text-gray-500">Games in cache</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900">Cache Size</h3>
            <p className="text-3xl font-bold text-indigo-600">{cacheStats.cacheSize}</p>
            <p className="text-sm text-gray-500">Total storage used</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900">Hit Rate</h3>
            <p className="text-3xl font-bold text-indigo-600">{cacheStats.hitRate}%</p>
            <p className="text-sm text-gray-500">Cache efficiency</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900">Top Searched</h3>
            <ul className="mt-2 text-sm text-gray-600">
              {cacheStats.topSearched.slice(0, 3).map(game => (
                <li key={game.id} className="truncate">{game.name}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Cached Games</h3>
        
        {cachedGames.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No games in cache</div>
        ) : (
          <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                    Game
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Category
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Complexity
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {cachedGames.map(game => (
                  <tr key={game.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                      {game.name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {game.category}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {game.complexity}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button
                        onClick={() => removeFromCache(game.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameCacheManager;
