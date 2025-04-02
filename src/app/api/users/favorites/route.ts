import { NextRequest, NextResponse } from 'next/server';

// This file implements the user favorites system for saving games
// as requested by the user

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'guest';
    
    // Get user's favorite games
    const favorites = await DB.prepare(
      `SELECT f.id, f.game_id, f.added_at, g.name, g.description, g.category
       FROM user_favorites f
       JOIN games g ON f.game_id = g.id
       WHERE f.user_id = ?
       ORDER BY f.added_at DESC`
    ).bind(userId).all();
    
    return NextResponse.json({
      success: true,
      data: favorites.results
    });
  } catch (error) {
    console.error('Error fetching user favorites:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user favorites' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.gameId) {
      return NextResponse.json(
        { success: false, error: 'Game ID is required' },
        { status: 400 }
      );
    }
    
    // In a real implementation, we would get the user ID from the session
    const userId = body.userId || 'guest';
    const id = crypto.randomUUID();
    
    // Check if already favorited
    const existing = await DB.prepare(
      'SELECT * FROM user_favorites WHERE user_id = ? AND game_id = ?'
    ).bind(userId, body.gameId).first();
    
    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Game is already in favorites',
        data: existing
      });
    }
    
    // Add to favorites
    await DB.prepare(
      'INSERT INTO user_favorites (id, user_id, game_id) VALUES (?, ?, ?)'
    ).bind(id, userId, body.gameId).run();
    
    return NextResponse.json({
      success: true,
      message: 'Game added to favorites',
      data: {
        id,
        user_id: userId,
        game_id: body.gameId,
        added_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error adding game to favorites:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add game to favorites' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get('gameId');
    const userId = searchParams.get('userId') || 'guest';
    
    if (!gameId) {
      return NextResponse.json(
        { success: false, error: 'Game ID is required' },
        { status: 400 }
      );
    }
    
    // Remove from favorites
    await DB.prepare(
      'DELETE FROM user_favorites WHERE user_id = ? AND game_id = ?'
    ).bind(userId, gameId).run();
    
    return NextResponse.json({
      success: true,
      message: 'Game removed from favorites'
    });
  } catch (error) {
    console.error('Error removing game from favorites:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove game from favorites' },
      { status: 500 }
    );
  }
}
