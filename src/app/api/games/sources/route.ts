import { NextRequest, NextResponse } from 'next/server';

// This file implements the source attribution system as requested by the user
// It ensures all game data includes proper attribution to reputable sources

export interface GameSource {
  name: string;
  url: string;
  isOfficial: boolean;
  retrievedAt: string;
  licenseInfo?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');
    
    if (!gameId) {
      return NextResponse.json(
        { success: false, error: 'Game ID is required' },
        { status: 400 }
      );
    }
    
    // Get sources for the game
    const sources = await DB.prepare(
      'SELECT * FROM game_sources WHERE game_id = ?'
    ).bind(gameId).all();
    
    return NextResponse.json({
      success: true,
      data: sources.results
    });
  } catch (error) {
    console.error('Error fetching game sources:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch game sources' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.gameId || !body.source || !body.source.name || !body.source.url) {
      return NextResponse.json(
        { success: false, error: 'Game ID and source details (name, url) are required' },
        { status: 400 }
      );
    }
    
    const id = crypto.randomUUID();
    
    // Add source to the game
    await DB.prepare(
      `INSERT INTO game_sources (id, game_id, name, url, is_official, retrieved_at, license_info) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      id,
      body.gameId,
      body.source.name,
      body.source.url,
      body.source.isOfficial || false,
      body.source.retrievedAt || new Date().toISOString(),
      body.source.licenseInfo || null
    ).run();
    
    return NextResponse.json({
      success: true,
      data: {
        id,
        game_id: body.gameId,
        ...body.source
      }
    });
  } catch (error) {
    console.error('Error adding game source:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add game source' },
      { status: 500 }
    );
  }
}


