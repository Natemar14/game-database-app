import { NextRequest, NextResponse } from 'next/server';

// This file implements the external API integration for fetching game data
// with proper attribution from reputable sources

export async function GET(
  request: NextRequest,
  { params }: { params: { name: string } }
) {
  try {
    const gameName = decodeURIComponent(params.name);
    
    // First check if the game exists in our cache
    const cachedGame = await DB.prepare(
      'SELECT * FROM popular_games WHERE name LIKE ?'
    ).bind(`%${gameName}%`).first();
    
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
    
    // In a real implementation, we would integrate with external APIs like:
    // - BoardGameGeek API
    // - Open Library API for traditional games
    // - Official game publisher APIs where available
    
    // For this implementation, we'll simulate API responses
    const gameData = await simulateExternalApiCall(gameName);
    
    if (!gameData) {
      return NextResponse.json(
        { success: false, error: 'Game not found in external sources' },
        { status: 404 }
      );
    }
    
    // Cache the result for future searches
    const cacheId = crypto.randomUUID();
    await DB.prepare(
      `INSERT INTO popular_games (id, name, game_data) 
       VALUES (?, ?, ?)`
    ).bind(
      cacheId,
      gameData.name,
      JSON.stringify(gameData)
    ).run();
    
    return NextResponse.json({
      success: true,
      data: gameData
    });
  } catch (error) {
    console.error(`Error fetching game data for ${params.name}:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch game data from external sources' },
      { status: 500 }
    );
  }
}

// Simulate external API calls to fetch game data
// In a real implementation, this would call actual APIs
async function simulateExternalApiCall(gameName: string) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Sample external API data
  const externalGames = [
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
    },
    {
      name: 'Catan',
      description: 'Catan is a multiplayer board game where players collect resources and use them to build roads, settlements, and cities on the island of Catan.',
      minPlayers: 3,
      maxPlayers: 4,
      durationMin: 60,
      durationMax: 120,
      category: 'Strategy',
      complexity: 2.5,
      rules: 'Players take turns rolling dice to determine which hexes produce resources. Players collect these resources to build roads, settlements, and cities...',
      components: ['19 Terrain hexes', '6 Sea frame pieces', '9 Harbor pieces', '18 Circular number tokens', '95 Resource cards', '25 Development cards', '4 Building costs cards', '2 Special cards', '16 Cities', '20 Settlements', '60 Roads', '2 Dice', '1 Robber'],
      setup: 'Build the board using the terrain hexes and number tokens. Each player chooses a color and takes all settlements, cities, and roads of that color...',
      sources: [
        {
          name: 'Catan Official Website',
          url: 'https://www.catan.com/understand-catan/game-rules',
          isOfficial: true,
          licenseInfo: 'Copyright Catan GmbH'
        }
      ],
      legalStatus: {
        canPlay: false,
        reason: 'This game is under copyright protection and cannot be played directly in the app',
        licenseInfo: 'Copyright protected',
        copyrightOwner: 'Catan GmbH',
        playRestrictions: [
          'Scoresheet functionality only',
          'No digital implementation of gameplay',
          'For use with physical game only'
        ]
      }
    },
    {
      name: 'Poker',
      description: 'Poker is a family of card games that combines gambling, strategy, and skill, with players betting into a central pot with the player with the highest hand winning.',
      minPlayers: 2,
      maxPlayers: 10,
      durationMin: 30,
      durationMax: 240,
      category: 'Card Games',
      complexity: 2.0,
      rules: 'Players are dealt cards and bet in rounds based on the strength of their hands. The player with the best hand at showdown wins the pot...',
      components: ['Standard 52-card deck', 'Poker chips'],
      setup: 'Players sit around a table. Chips are distributed. A dealer is chosen and the dealer button is placed...',
      sources: [
        {
          name: 'Wikipedia',
          url: 'https://en.wikipedia.org/wiki/Poker',
          isOfficial: false,
          licenseInfo: 'CC BY-SA 3.0'
        }
      ],
      legalStatus: {
        canPlay: true,
        reason: 'Traditional card game rules are not copyrightable',
        licenseInfo: 'Game rules are not subject to copyright, but specific implementations may be',
        copyrightOwner: null,
        playRestrictions: [
          'No gambling functionality',
          'For entertainment purposes only'
        ]
      }
    }
  ];
  
  // Find a matching game
  const lowercaseQuery = gameName.toLowerCase();
  return externalGames.find(game => game.name.toLowerCase().includes(lowercaseQuery));
}
