"use client";

import React, { useState, useEffect } from 'react';

export default function SeriesPage() {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSeries() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('https://scoresheet-api.kammyswag.workers.dev/api/series');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setSeries(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    }

    fetchSeries();
  }, []);

  if (loading) {
    return <div>Loading series...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Series</h1>
      <ul>
        {series.map((item) => (
          <li key={item.id}>{item.name}</li>
        ))}
      </ul>
    </div>
  );
}