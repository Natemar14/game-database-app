-- Migration number: 0001 	 2025-04-01
-- Game Database App Initial Schema

-- Drop existing tables if they exist
DROP TABLE IF EXISTS tournament_matches;
DROP TABLE IF EXISTS tournament_participants;
DROP TABLE IF EXISTS tournaments;
DROP TABLE IF EXISTS series_sessions;
DROP TABLE IF EXISTS series;
DROP TABLE IF EXISTS session_players;
DROP TABLE IF EXISTS game_sessions;
DROP TABLE IF EXISTS scoresheets;
DROP TABLE IF EXISTS game_rules;
DROP TABLE IF EXISTS games;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS counters;
DROP TABLE IF EXISTS access_logs;

-- Create Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  password_hash TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  is_premium BOOLEAN DEFAULT FALSE
);

-- Create Games table
CREATE TABLE games (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  min_players INTEGER,
  max_players INTEGER,
  duration_min INTEGER,
  duration_max INTEGER,
  category TEXT,
  complexity FLOAT,
  created_by TEXT,
  is_official BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Create Game_Rules table
CREATE TABLE game_rules (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL,
  content TEXT NOT NULL,
  components TEXT,
  setup TEXT,
  version TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES games(id)
);

-- Create Scoresheets table
CREATE TABLE scoresheets (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL,
  name TEXT NOT NULL,
  structure JSON NOT NULL,
  created_by TEXT,
  is_official BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES games(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Create Game_Sessions table
CREATE TABLE game_sessions (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL,
  scoresheet_id TEXT,
  created_by TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES games(id),
  FOREIGN KEY (scoresheet_id) REFERENCES scoresheets(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Create Session_Players table
CREATE TABLE session_players (
  session_id TEXT NOT NULL,
  user_id TEXT,
  player_name TEXT NOT NULL,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  scores JSON,
  FOREIGN KEY (session_id) REFERENCES game_sessions(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  PRIMARY KEY (session_id, player_name)
);

-- Create Series table
CREATE TABLE series (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  game_id TEXT NOT NULL,
  created_by TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES games(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Create Series_Sessions table
CREATE TABLE series_sessions (
  series_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  sequence_number INTEGER NOT NULL,
  FOREIGN KEY (series_id) REFERENCES series(id),
  FOREIGN KEY (session_id) REFERENCES game_sessions(id),
  PRIMARY KEY (series_id, session_id)
);

-- Create Tournaments table
CREATE TABLE tournaments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  game_id TEXT NOT NULL,
  format TEXT NOT NULL,
  status TEXT DEFAULT 'upcoming',
  created_by TEXT NOT NULL,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (game_id) REFERENCES games(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Create Tournament_Participants table
CREATE TABLE tournament_participants (
  tournament_id TEXT NOT NULL,
  user_id TEXT,
  participant_name TEXT NOT NULL,
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'active',
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  PRIMARY KEY (tournament_id, participant_name)
);

-- Create Tournament_Matches table
CREATE TABLE tournament_matches (
  id TEXT PRIMARY KEY,
  tournament_id TEXT NOT NULL,
  round INTEGER NOT NULL,
  match_number INTEGER NOT NULL,
  session_id TEXT,
  status TEXT DEFAULT 'scheduled',
  scheduled_time TIMESTAMP,
  FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
  FOREIGN KEY (session_id) REFERENCES game_sessions(id)
);

-- Create counters table for analytics
CREATE TABLE counters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  value INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create access_logs table for tracking
CREATE TABLE access_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ip TEXT,
  path TEXT,
  user_id TEXT,
  accessed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Initial data
INSERT INTO counters (name, value) VALUES 
  ('page_views', 0),
  ('api_calls', 0),
  ('games_created', 0),
  ('sessions_started', 0);

-- Create indexes for performance
CREATE INDEX idx_games_name ON games(name);
CREATE INDEX idx_games_category ON games(category);
CREATE INDEX idx_game_rules_game_id ON game_rules(game_id);
CREATE INDEX idx_scoresheets_game_id ON scoresheets(game_id);
CREATE INDEX idx_game_sessions_game_id ON game_sessions(game_id);
CREATE INDEX idx_game_sessions_created_by ON game_sessions(created_by);
CREATE INDEX idx_series_game_id ON series(game_id);
CREATE INDEX idx_series_created_by ON series(created_by);
CREATE INDEX idx_tournaments_game_id ON tournaments(game_id);
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_access_logs_accessed_at ON access_logs(accessed_at);
