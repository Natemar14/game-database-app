import React, { useState, useEffect } from 'react';

// This component implements the user favorites system
// as requested by the user for easier access to games

interface Game {
  id: string;
  name: string;
  description: string;
  category: string;
  complexity: number;
}

interface FavoriteGame extends Game {
  addedAt: string;
}

const UserFavorites = ({ userId = 'guest' }: { userId?: string }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<FavoriteGame[]>([]);
  
  // Fetch user's favorite games
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        
        // In a real implementation, this would be an API call
        const response = await fetch(`/api/users/favorites?userId=${userId}`);
        const data = await response.json();
        
        if (!data.success) {
          setError(data.error || 'Failed to load favorites');
          return;
        }
        
        setFavorites(data.data);
      } catch (err) {
        setError('Error loading favorites');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchFavorites();
  }, [userId]);
  
  // Remove a game from favorites
  const removeFromFavorites = async (gameId: string) => {
    try {
      setLoading(true);
      
      // In a real implementation, this would be an API call
      const response = await fetch(`/api/users/favorites?gameId=${gameId}&userId=${userId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!data.success) {
        setError(data.error || 'Failed to remove from favorites');
        return;
      }
      
      // Update favorites list
      setFavorites(favorites.filter(game => game.id !== gameId));
    } catch (err) {
      setError('Error removing from favorites');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <div className="text-center py-8">Loading favorites...</div>;
  }
  
  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }
  
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Favorite Games</h2>
      </div>
      
      {favorites.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>You haven't added any games to your favorites yet.</p>
          <p className="mt-2">Search for games and click the star icon to add them to your favorites.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map(game => (
            <div key={game.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium text-gray-900">{game.name}</h3>
                  <button
                    onClick={() => removeFromFavorites(game.id)}
                    className="text-yellow-500 hover:text-yellow-700"
                  >
                    ★
                  </button>
                </div>
                <p className="mt-1 text-sm text-gray-500">{game.category}</p>
                <p className="mt-2 text-sm text-gray-600 line-clamp-2">{game.description}</p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    Added: {new Date(game.addedAt).toLocaleDateString()}
                  </span>
                  <a
                    href={`/games/${game.id}`}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    View
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserFavorites;
