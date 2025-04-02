import { NextRequest, NextResponse } from 'next/server';

// This file implements the legal compliance check for game play functionality
// as requested by the user

export interface LegalStatus {
  canPlay: boolean;
  reason?: string;
  licenseInfo?: string;
  copyrightOwner?: string;
  playRestrictions?: string[];
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const gameId = params.id;
    
    // Get game
    const game = await DB.prepare(
      'SELECT * FROM games WHERE id = ?'
    ).bind(gameId).first();
    
    if (!game) {
      return NextResponse.json(
        { success: false, error: 'Game not found' },
        { status: 404 }
      );
    }
    
    // Get legal status
    const legalStatus = await DB.prepare(
      'SELECT * FROM game_legal_status WHERE game_id = ?'
    ).bind(gameId).first();
    
    // If no specific legal status is found, determine based on game category
    let status: LegalStatus;
    
    if (legalStatus) {
      status = {
        canPlay: legalStatus.can_play === 1,
        reason: legalStatus.reason,
        licenseInfo: legalStatus.license_info,
        copyrightOwner: legalStatus.copyright_owner,
        playRestrictions: legalStatus.play_restrictions ? 
          JSON.parse(legalStatus.play_restrictions) : []
      };
    } else {
      // Default legal status based on game category
      // This is a simplified implementation - in a real app, this would be more comprehensive
      status = determineLegalStatus(game);
    }
    
    return NextResponse.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error(`Error checking legal status for game ${params.id}:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to check legal status' },
      { status: 500 }
    );
  }
}

// Helper function to determine legal status based on game properties
function determineLegalStatus(game: any): LegalStatus {
  // Traditional games like chess, checkers, etc. are in the public domain
  const publicDomainGames = [
    'chess', 'checkers', 'backgammon', 'go', 'mancala', 'dominoes',
    'tic-tac-toe', 'connect four', 'battleship', 'yahtzee'
  ];
  
  // Check if game name contains any public domain game names
  const isPublicDomain = publicDomainGames.some(pdGame => 
    game.name.toLowerCase().includes(pdGame.toLowerCase())
  );
  
  if (isPublicDomain) {
    return {
      canPlay: true,
      reason: 'Game is in the public domain',
      licenseInfo: 'Public Domain'
    };
  }
  
  // For traditional card games
  if (game.category === 'Card Games' && !game.is_official) {
    return {
      canPlay: true,
      reason: 'Traditional card game rules are not copyrightable',
      licenseInfo: 'Game rules are not subject to copyright, but specific implementations may be',
      playRestrictions: ['No commercial use without proper licensing']
    };
  }
  
  // For role-playing games, only basic mechanics can be implemented
  if (game.category === 'Role Playing') {
    return {
      canPlay: true,
      reason: 'Basic game mechanics are implemented, but proprietary content is not included',
      licenseInfo: 'Game mechanics are not subject to copyright, but specific content is protected',
      copyrightOwner: game.created_by || 'Unknown',
      playRestrictions: [
        'No proprietary content included',
        'For personal use only',
        'Players should own the official game materials'
      ]
    };
  }
  
  // For modern board games with copyright protection
  return {
    canPlay: false,
    reason: 'This game is under copyright protection and cannot be played directly in the app',
    licenseInfo: 'Copyright protected',
    copyrightOwner: game.created_by || 'Unknown',
    playRestrictions: [
      'Scoresheet functionality only',
      'No digital implementation of gameplay',
      'For use with physical game only'
    ]
  };
}
