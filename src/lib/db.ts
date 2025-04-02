import { D1Database } from '@cloudflare/workers-types';

declare global {
  var DB: D1Database;
}

export async function getGames(options: {
  category?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const { category, search, limit = 10, offset = 0 } = options;
  
  let query = 'SELECT * FROM games';
  const params: any[] = [];
  
  if (category || search) {
    query += ' WHERE';
    
    if (category) {
      query += ' category = ?';
      params.push(category);
    }
    
    if (search) {
      if (category) query += ' AND';
      query += ' name LIKE ?';
      params.push(`%${search}%`);
    }
  }
  
  query += ' ORDER BY name ASC LIMIT ? OFFSET ?';
  params.push(limit, offset);
  
  const result = await DB.prepare(query).bind(...params).all();
  return result.results;
}

export async function getGameById(id: string) {
  const game = await DB.prepare('SELECT * FROM games WHERE id = ?').bind(id).first();
  return game;
}

export async function getGameRules(gameId: string) {
  const rules = await DB.prepare('SELECT * FROM game_rules WHERE game_id = ?').bind(gameId).first();
  return rules;
}

export async function getScoresheets(gameId: string) {
  const scoresheets = await DB.prepare('SELECT * FROM scoresheets WHERE game_id = ?').bind(gameId).all();
  return scoresheets.results;
}

export async function createGameSession(data: {
  gameId: string;
  scoresheetId?: string;
  createdBy: string;
}) {
  const { gameId, scoresheetId, createdBy } = data;
  const id = crypto.randomUUID();
  
  await DB.prepare(
    'INSERT INTO game_sessions (id, game_id, scoresheet_id, created_by) VALUES (?, ?, ?, ?)'
  ).bind(id, gameId, scoresheetId || null, createdBy).run();
  
  await DB.prepare('UPDATE counters SET value = value + 1 WHERE name = ?')
    .bind('sessions_started').run();
    
  return { id };
}

export async function getUserSessions(userId: string) {
  const sessions = await DB.prepare(
    `SELECT gs.*, g.name as game_name 
     FROM game_sessions gs
     JOIN games g ON gs.game_id = g.id
     WHERE gs.created_by = ?
     ORDER BY gs.started_at DESC`
  ).bind(userId).all();
  
  return sessions.results;
}

export async function createUser(data: {
  username: string;
  email?: string;
  passwordHash: string;
}) {
  const { username, email, passwordHash } = data;
  const id = crypto.randomUUID();
  
  await DB.prepare(
    'INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)'
  ).bind(id, username, email || null, passwordHash).run();
  
  return { id };
}

export async function getUserByUsername(username: string) {
  const user = await DB.prepare('SELECT * FROM users WHERE username = ?').bind(username).first();
  return user;
}

export async function logAccess(data: {
  ip?: string;
  path: string;
  userId?: string;
}) {
  const { ip, path, userId } = data;
  
  await DB.prepare(
    'INSERT INTO access_logs (ip, path, user_id) VALUES (?, ?, ?)'
  ).bind(ip || null, path, userId || null).run();
  
  await DB.prepare('UPDATE counters SET value = value + 1 WHERE name = ?')
    .bind('page_views').run();
}

export async function incrementCounter(name: string) {
  await DB.prepare('UPDATE counters SET value = value + 1 WHERE name = ?')
    .bind(name).run();
}
