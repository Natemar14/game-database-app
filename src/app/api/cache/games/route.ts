import { NextRequest, NextResponse } from 'next/server';

// This file implements the game caching system as requested by the user
// It stores frequently searched games to improve performance and reduce API calls

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Game name is required' },
        { status: 400 }
      );
    }
    
    // Check if game exists in cache
    const cachedGame = await DB.prepare(
      'SELECT * FROM popular_games WHERE name = ?'
    ).bind(name).first();
    
    if (cachedGame) {
      // Update search count and last searched timestamp
      await DB.prepare(
        'UPDATE popular_games SET search_count = search_count + 1, last_searched_at = CURRENT_TIMESTAMP WHERE name = ?'
      ).bind(name).run();
      
      return NextResponse.json({
        success: true,
        data: {
          ...JSON.parse(cachedGame.game_data),
          cached: true,
          search_count: cachedGame.search_count + 1
        }
      });
    }
    
    // Return not found if game is not in cache
    return NextResponse.json(
      { success: false, error: 'Game not found in cache' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error fetching cached game:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cached game' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.name || !body.gameData) {
      return NextResponse.json(
        { success: false, error: 'Game name and data are required' },
        { status: 400 }
      );
    }
    
    // Check if game already exists in cache
    const existingGame = await DB.prepare(
      'SELECT * FROM popular_games WHERE name = ?'
    ).bind(body.name).first();
    
    if (existingGame) {
      // Update existing game
      await DB.prepare(
        'UPDATE popular_games SET game_data = ?, search_count = search_count + 1, last_searched_at = CURRENT_TIMESTAMP WHERE name = ?'
      ).bind(JSON.stringify(body.gameData), body.name).run();
    } else {
      // Insert new game
      await DB.prepare(
        'INSERT INTO popular_games (name, game_data, last_searched_at) VALUES (?, ?, CURRENT_TIMESTAMP)'
      ).bind(body.name, JSON.stringify(body.gameData)).run();
    }
    
    return NextResponse.json({
      success: true,
      message: 'Game cached successfully'
    });
  } catch (error) {
    console.error('Error caching game:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cache game' },
      { status: 500 }
    );
  }
}
