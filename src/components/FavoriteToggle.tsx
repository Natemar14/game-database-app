import React, { useState, useEffect } from 'react';

// This component implements the game favorites toggle functionality
// to allow users to easily add/remove games from their favorites

interface FavoriteToggleProps {
  gameId: string;
  userId?: string;
  initialIsFavorite?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const FavoriteToggle: React.FC<FavoriteToggleProps> = ({
  gameId,
  userId = 'guest',
  initialIsFavorite = false,
  size = 'medium'
}) => {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if game is in favorites on component mount
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (initialIsFavorite !== undefined) return;
      
      try {
        setLoading(true);
        
        // In a real implementation, this would be an API call
        const response = await fetch(`/api/users/favorites?userId=${userId}`);
        const data = await response.json();
        
        if (data.success) {
          const isFav = data.data.some((fav: any) => fav.game_id === gameId);
          setIsFavorite(isFav);
        }
      } catch (err) {
        console.error('Error checking favorite status:', err);
      } finally {
        setLoading(false);
      }
    };
    
    checkFavoriteStatus();
  }, [gameId, userId, initialIsFavorite]);

  // Toggle favorite status
  const toggleFavorite = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (isFavorite) {
        // Remove from favorites
        const response = await fetch(`/api/users/favorites?gameId=${gameId}&userId=${userId}`, {
          method: 'DELETE',
        });
        
        const data = await response.json();
        
        if (!data.success) {
          setError(data.error || 'Failed to remove from favorites');
          return;
        }
        
        setIsFavorite(false);
      } else {
        // Add to favorites
        const response = await fetch('/api/users/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            gameId,
            userId
          }),
        });
        
        const data = await response.json();
        
        if (!data.success) {
          setError(data.error || 'Failed to add to favorites');
          return;
        }
        
        setIsFavorite(true);
      }
    } catch (err) {
      setError('Error updating favorites');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Determine star size based on prop
  const starSize = size === 'small' ? 'text-xl' : size === 'large' ? 'text-3xl' : 'text-2xl';

  return (
    <div>
      <button
        onClick={toggleFavorite}
        disabled={loading}
        className={`${starSize} focus:outline-none ${
          isFavorite ? 'text-yellow-500 hover:text-yellow-600' : 'text-gray-300 hover:text-yellow-400'
        } transition-colors duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        ★
      </button>
      
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default FavoriteToggle;
