"use client";

import React, { useState, useEffect } from 'react';

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTournaments() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('https://scoresheet-api.kammyswag.workers.dev/api/tournaments');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTournaments(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    }

    fetchTournaments();
  }, []);

  if (loading) {
    return <div>Loading tournaments...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Tournaments</h1>
      <ul>
        {tournaments.map((tournament) => (
          <li key={tournament.id}>{tournament.name}</li>
        ))}
      </ul>
    </div>
  );
}