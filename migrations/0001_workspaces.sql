CREATE TABLE IF NOT EXISTS sk_workspaces(owner TEXT PRIMARY KEY,payload TEXT NOT NULL,revision INTEGER NOT NULL,updated INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS sk_reviews(token TEXT PRIMARY KEY,owner TEXT NOT NULL,snapshot TEXT NOT NULL,expires INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS sk_reviews_owner ON sk_reviews(owner);
CREATE TABLE IF NOT EXISTS sk_events(id TEXT PRIMARY KEY,review TEXT NOT NULL,kind TEXT NOT NULL,author TEXT NOT NULL,body TEXT NOT NULL,target TEXT NOT NULL,created INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS sk_events_review ON sk_events(review,created);
CREATE TABLE IF NOT EXISTS sk_monitors(owner TEXT PRIMARY KEY,root TEXT NOT NULL,urls TEXT NOT NULL,enabled INTEGER NOT NULL,next_at INTEGER NOT NULL,last_at INTEGER NOT NULL,baseline TEXT NOT NULL,result TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS sk_monitors_due ON sk_monitors(enabled,next_at);
