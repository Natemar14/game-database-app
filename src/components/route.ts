import React, { useState, useEffect } from 'react';

// This component implements the API endpoints for tournament management
// to be used in the game database app

interface TournamentType {
  id: string;
  name: string;
  description: string;
  minPlayers: number;
  maxPlayers: number;
}

const tournamentTypes: TournamentType[] = [
  {
    id: 'single-elimination',
    name: 'Single Elimination',
    description: 'A knockout tournament where the loser of each match is eliminated',
    minPlayers: 4,
    maxPlayers: 64
  },
  {
    id: 'double-elimination',
    name: 'Double Elimination',
    description: 'Players are eliminated after losing two matches',
    minPlayers: 4,
    maxPlayers: 32
  },
  {
    id: 'round-robin',
    name: 'Round Robin',
    description: 'Each participant plays against all other participants',
    minPlayers: 3,
    maxPlayers: 16
  },
  {
    id: 'swiss',
    name: 'Swiss System',
    description: 'Non-elimination format with a set number of rounds',
    minPlayers: 6,
    maxPlayers: 32
  }
];

// API route handler for /api/tournaments/types
export async function GET() {
  try {
    return new Response(
      JSON.stringify({
        success: true,
        data: tournamentTypes
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to fetch tournament types'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

// API route handler for /api/tournaments/types
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.description || !body.minPlayers || !body.maxPlayers) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Missing required fields'
        }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    // Create a new tournament type (in a real implementation, this would be saved to a database)
    const newType: TournamentType = {
      id: crypto.randomUUID(),
      name: body.name,
      description: body.description,
      minPlayers: body.minPlayers,
      maxPlayers: body.maxPlayers
    };
    
    return new Response(
      JSON.stringify({
        success: true,
        data: newType
      }),
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to create tournament type'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}
