-- Update to the migration file to include tables for new requirements

-- Add table for game sources (attribution)
CREATE TABLE game_sources (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  is_official BOOLEAN DEFAULT FALSE,
  retrieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  license_info TEXT,
  FOREIGN KEY (game_id) REFERENCES games(id)
);

-- Add table for game legal status
CREATE TABLE game_legal_status (
  id TEXT PRIMARY KEY,
  game_id TEXT UNIQUE NOT NULL,
  can_play BOOLEAN DEFAULT FALSE,
  reason TEXT,
  license_info TEXT,
  copyright_owner TEXT,
  play_restrictions TEXT, -- JSON array
  FOREIGN KEY (game_id) REFERENCES games(id)
);

-- Add table for scoresheet subcategories
CREATE TABLE scoresheet_subcategories (
  id TEXT PRIMARY KEY,
  scoresheet_id TEXT NOT NULL,
  name TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  FOREIGN KEY (scoresheet_id) REFERENCES scoresheets(id)
);

-- Add table for scoresheet fields
CREATE TABLE scoresheet_fields (
  id TEXT PRIMARY KEY,
  subcategory_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  default_value TEXT,
  options TEXT, -- JSON array for dropdown options
  formula TEXT, -- For calculation fields
  min_value FLOAT,
  max_value FLOAT,
  display_order INTEGER NOT NULL,
  FOREIGN KEY (subcategory_id) REFERENCES scoresheet_subcategories(id)
);

-- Add table for popular games (caching)
CREATE TABLE popular_games (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  game_data TEXT NOT NULL, -- JSON string with all game details
  search_count INTEGER DEFAULT 1 NOT NULL,
  last_searched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add table for user favorites
CREATE TABLE user_favorites (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  game_id TEXT NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (game_id) REFERENCES games(id),
  UNIQUE(user_id, game_id)
);

-- Create indexes for performance
CREATE INDEX idx_game_sources_game_id ON game_sources(game_id);
CREATE INDEX idx_scoresheet_subcategories_scoresheet_id ON scoresheet_subcategories(scoresheet_id);
CREATE INDEX idx_scoresheet_fields_subcategory_id ON scoresheet_fields(subcategory_id);
CREATE INDEX idx_popular_games_search_count ON popular_games(search_count);
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
