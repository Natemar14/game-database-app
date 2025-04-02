import { NextRequest, NextResponse } from 'next/server';

// This file implements the game rules integration with proper attribution
// It provides detailed game rules with source attribution

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gameId = params.id;
    
    // Get game details
    const game = await DB.prepare(
      'SELECT * FROM games WHERE id = ?'
    ).bind(gameId).first();
    
    if (!game) {
      return NextResponse.json(
        { success: false, error: 'Game not found' },
        { status: 404 }
      );
    }
    
    // Get game rules
    const rules = await DB.prepare(
      'SELECT * FROM game_rules WHERE game_id = ?'
    ).bind(gameId).first();
    
    // Get sources for attribution
    const sources = await DB.prepare(
      'SELECT * FROM game_sources WHERE game_id = ? ORDER BY is_official DESC'
    ).bind(gameId).all();
    
    // Get legal status
    const legalStatus = await DB.prepare(
      'SELECT * FROM game_legal_status WHERE game_id = ?'
    ).bind(gameId).first();
    
    // Format response with proper attribution
    const response = {
      game: {
        id: game.id,
        name: game.name,
        description: game.description,
        players: `${game.min_players}-${game.max_players}`,
        duration: `${game.duration_min}-${game.duration_max} minutes`,
        category: game.category,
        complexity: game.complexity
      },
      rules: rules ? {
        content: rules.content,
        components: rules.components ? JSON.parse(rules.components) : [],
        setup: rules.setup,
        version: rules.version
      } : null,
      sources: sources.results,
      legalStatus: legalStatus ? {
        canPlay: legalStatus.can_play === 1,
        reason: legalStatus.reason,
        licenseInfo: legalStatus.license_info,
        copyrightOwner: legalStatus.copyright_owner,
        playRestrictions: legalStatus.play_restrictions ? 
          JSON.parse(legalStatus.play_restrictions) : []
      } : null,
      attribution: {
        message: "Game information is provided with proper attribution to original sources.",
        disclaimer: "This app respects intellectual property rights and provides game information for educational purposes only."
      }
    };
    
    return NextResponse.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error(`Error fetching game rules for ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch game rules' },
      { status: 500 }
    );
  }
}
