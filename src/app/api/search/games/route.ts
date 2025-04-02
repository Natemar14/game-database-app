import { NextRequest, NextResponse } from 'next/server';
import { isReputableSource } from '@/lib/utils'; 


// This file implements the game database integration with proper attribution
// It fetches game data from reputable sources and stores it with attribution

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    
    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Search query is required' },
        { status: 400 }
      );
    }
    
    // First check if the game exists in our cache
    const cachedGame = await DB.prepare(
      'SELECT * FROM popular_games WHERE name LIKE ?'
    ).bind(`%${query}%`).first();
    
    if (cachedGame) {
      // Update search count
      await DB.prepare(
        'UPDATE popular_games SET search_count = search_count + 1, last_searched_at = CURRENT_TIMESTAMP WHERE id = ?'
      ).bind(cachedGame.id).run();
      
      return NextResponse.json({
        success: true,
        data: {
          ...JSON.parse(cachedGame.game_data),
          cached: true,
          search_count: cachedGame.search_count + 1
        }
      });
    }
    
    // If not in cache, we would fetch from external APIs
    // For this implementation, we'll simulate fetching from external sources
    const gameData = await simulateFetchGameData(query);
    
    if (!gameData) {
      return NextResponse.json(
        { success: false, error: 'Game not found' },
        { status: 404 }
      );
    }
    
    // Store in database with proper attribution
    const gameId = crypto.randomUUID();
    
    // Insert game
    await DB.prepare(
      `INSERT INTO games (id, name, description, min_players, max_players, 
                         duration_min, duration_max, category, complexity, 
                         is_official) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      gameId,
      gameData.name,
      gameData.description,
      gameData.minPlayers,
      gameData.maxPlayers,
      gameData.durationMin,
      gameData.durationMax,
      gameData.category,
      gameData.complexity,
      false
    ).run();
    
    // Insert game rules
    const rulesId = crypto.randomUUID();
    await DB.prepare(
      `INSERT INTO game_rules (id, game_id, content, components, setup, version) 
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(
      rulesId,
      gameId,
      gameData.rules,
      JSON.stringify(gameData.components),
      gameData.setup,
      '1.0'
    ).run();
    
    // Insert source attribution
    for (const source of gameData.sources) {
      if (isReputableSource(source.url)) {
        const sourceId = crypto.randomUUID();
        await DB.prepare(
          `INSERT INTO game_sources (id, game_id, name, url, is_official, license_info) 
           VALUES (?, ?, ?, ?, ?, ?)`
        ).bind(
          sourceId,
          gameId,
          source.name,
          source.url,
          source.isOfficial,
          source.licenseInfo
        ).run();
      }
    }
    
    // Insert legal status
    const legalId = crypto.randomUUID();
    await DB.prepare(
      `INSERT INTO game_legal_status (id, game_id, can_play, reason, license_info, copyright_owner) 
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(
      legalId,
      gameId,
      gameData.legalStatus.canPlay,
      gameData.legalStatus.reason,
      gameData.legalStatus.licenseInfo,
      gameData.legalStatus.copyrightOwner
    ).run();
    
    // Cache the game for future searches
    const cacheId = crypto.randomUUID();
    await DB.prepare(
      `INSERT INTO popular_games (id, name, game_data) 
       VALUES (?, ?, ?)`
    ).bind(
      cacheId,
      gameData.name,
      JSON.stringify({
        id: gameId,
        ...gameData
      })
    ).run();
    
    return NextResponse.json({
      success: true,
      data: {
        id: gameId,
        ...gameData
      }
    });
  } catch (error) {
    console.error('Error searching for game:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to search for game' },
      { status: 500 }
    );
  }
}

// Simulate fetching game data from external sources
// In a real implementation, this would call actual APIs
async function simulateFetchGameData(query: string) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Sample games data
  const games = [
    {
      name: 'Chess',
      description: 'Chess is a two-player strategy board game played on a checkered board with 64 squares arranged in an 8×8 grid.',
      minPlayers: 2,
      maxPlayers: 2,
      durationMin: 10,
      durationMax: 60,
      category: 'Strategy',
      complexity: 3.0,
      rules: 'Chess is played on a square board of eight rows and eight columns. Each player starts with 16 pieces...',
      components: ['1 Chess board', '16 White pieces', '16 Black pieces'],
      setup: 'Place the board so that a white square is in the right corner. Place pieces as follows...',
      sources: [
        {
          name: 'Wikipedia',
          url: 'https://en.wikipedia.org/wiki/Chess',
          isOfficial: false,
          licenseInfo: 'CC BY-SA 3.0'
        },
        {
          name: 'World Chess Federation',
          url: 'https://www.fide.com/rules',
          isOfficial: true,
          licenseInfo: 'Official Rules'
        }
      ],
      legalStatus: {
        canPlay: true,
        reason: 'Game is in the public domain',
        licenseInfo: 'Public Domain',
        copyrightOwner: null
      }
    },
    {
      name: 'Monopoly',
      description: 'Monopoly is a board game where players roll dice to move around the board, buying and trading properties.',
      minPlayers: 2,
      maxPlayers: 8,
      durationMin: 60,
      durationMax: 180,
      category: 'Board Games',
      complexity: 2.0,
      rules: 'Each player is given $1500 to start. Players take turns rolling dice and moving clockwise around the board...',
      components: ['1 Game board', '8 Tokens', 'Houses and Hotels', 'Chance and Community Chest cards', 'Money'],
      setup: 'Place the board in the center of the table. Each player selects a token and places it on GO...',
      sources: [
        {
          name: 'Hasbro',
          url: 'https://www.hasbro.com/en-us/product/monopoly-game:7EABAF97-5056-9047-F577-8F4663C79E75',
          isOfficial: true,
          licenseInfo: 'Copyright Hasbro'
        }
      ],
      legalStatus: {
        canPlay: false,
        reason: 'This game is under copyright protection and cannot be played directly in the app',
        licenseInfo: 'Copyright protected',
        copyrightOwner: 'Hasbro'
      }
    },
    {
      name: 'Dungeons & Dragons',
      description: 'Dungeons & Dragons is a fantasy tabletop role-playing game where players create characters to embark on imaginary adventures.',
      minPlayers: 3,
      maxPlayers: 8,
      durationMin: 120,
      durationMax: 240,
      category: 'Role Playing',
      complexity: 4.0,
      rules: 'Players create characters by determining ability scores, choosing a race, class, and background...',
      components: ['Player\'s Handbook', 'Dungeon Master\'s Guide', 'Monster Manual', 'Character sheets', 'Dice'],
      setup: 'The Dungeon Master prepares an adventure. Players create characters using the character creation rules...',
      sources: [
        {
          name: 'Wizards of the Coast',
          url: 'https://dnd.wizards.com/',
          isOfficial: true,
          licenseInfo: 'Copyright Wizards of the Coast'
        }
      ],
      legalStatus: {
        canPlay: true,
        reason: 'Basic game mechanics are implemented, but proprietary content is not included',
        licenseInfo: 'Game mechanics are not subject to copyright, but specific content is protected',
        copyrightOwner: 'Wizards of the Coast',
        playRestrictions: [
          'No proprietary content included',
          'For personal use only',
          'Players should own the official game materials'
        ]
      }
    }
  ];
  
  // Find a matching game
  const lowercaseQuery = query.toLowerCase();
  return games.find(game => game.name.toLowerCase().includes(lowercaseQuery));
}
