CREATE TABLE users (id INTEGER PRIMARY KEY CHECK(id=1), username TEXT NOT NULL UNIQUE COLLATE NOCASE, password_hash TEXT NOT NULL, salt TEXT NOT NULL, iterations INTEGER NOT NULL, created_at INTEGER NOT NULL);
CREATE TABLE sessions (token_hash TEXT PRIMARY KEY, user_id INTEGER NOT NULL REFERENCES users(id), expires_at INTEGER NOT NULL);
CREATE INDEX sessions_expiry ON sessions(expires_at);
CREATE TABLE attempts (scope TEXT PRIMARY KEY, count INTEGER NOT NULL, expires_at INTEGER NOT NULL);
CREATE TABLE content (name TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at INTEGER NOT NULL);
