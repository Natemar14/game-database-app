"use client";

import React, { useState, useEffect } from 'react';

export default function MultiplayerPage() {
  const [multiplayerGames, setMultiplayerGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMultiplayerGames() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('https://scoresheet-api.kammyswag.workers.dev/api/multiplayer');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setMultiplayerGames(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    }

    fetchMultiplayerGames();
  }, []);

  if (loading) {
    return <div>Loading multiplayer games...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Multiplayer Games</h1>
      <ul>
        {multiplayerGames.map((game) => (
          <li key={game.id}>{game.name}</li>
        ))}
      </ul>
    </div>
  );
}