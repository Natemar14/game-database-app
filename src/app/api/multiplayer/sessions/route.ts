import { NextRequest, NextResponse } from 'next/server';

// This file implements the multiplayer functionality with legal compliance checks
// as requested by the user

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.gameId || !body.players || !Array.isArray(body.players)) {
      return NextResponse.json(
        { success: false, error: 'Game ID and players array are required' },
        { status: 400 }
      );
    }
    
    // Check legal status first
    const legalStatusResponse = await fetch(`/api/games/${body.gameId}/legal`);
    const legalStatus = await legalStatusResponse.json();
    
    if (!legalStatus.success || !legalStatus.data.canPlay) {
      return NextResponse.json({
        success: false,
        error: 'This game cannot be played due to legal restrictions',
        legalStatus: legalStatus.data
      }, { status: 403 });
    }
    
    // Create multiplayer session
    const sessionId = crypto.randomUUID();
    const roomCode = generateRoomCode();
    
    // In a real implementation, we would get the user ID from the session
    const hostId = body.hostId || 'guest';
    
    await DB.prepare(
      `INSERT INTO multiplayer_sessions 
       (id, game_id, host_id, room_code, max_players, status, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
    ).bind(
      sessionId,
      body.gameId,
      hostId,
      roomCode,
      body.maxPlayers || body.players.length,
      'waiting'
    ).run();
    
    // Add players to session
    for (const player of body.players) {
      const playerId = crypto.randomUUID();
      
      await DB.prepare(
        `INSERT INTO multiplayer_players
         (id, session_id, user_id, player_name, is_host, joined_at)
         VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`
      ).bind(
        playerId,
        sessionId,
        player.userId || null,
        player.name,
        player.userId === hostId
      ).run();
    }
    
    return NextResponse.json({
      success: true,
      data: {
        id: sessionId,
        roomCode,
        gameId: body.gameId,
        hostId,
        status: 'waiting',
        createdAt: new Date().toISOString(),
        players: body.players
      }
    });
  } catch (error) {
    console.error('Error creating multiplayer session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create multiplayer session' },
      { status: 500 }
    );
  }
}

// Generate a 6-character room code
function generateRoomCode(): string {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Omitting similar-looking characters
  let result = '';
  
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  
  return result;
}
