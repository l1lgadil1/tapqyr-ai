-- This is an empty migration.

-- Create Priority enum type
-- SQLite doesn't support enums directly, so we'll use a CHECK constraint
-- to enforce the values

-- First, create a temporary table with the new schema
CREATE TABLE "new_todos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "dueDate" DATETIME,
    "priority" TEXT NOT NULL DEFAULT 'medium' CHECK ("priority" IN ('high', 'medium', 'low')),
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    "isAIGenerated" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "todos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Copy data from the old table to the new one
INSERT INTO "new_todos" ("id", "title", "description", "completed", "dueDate", "priority", "createdAt", "userId", "isAIGenerated")
SELECT "id", "title", "description", "completed", "dueDate", "priority", "createdAt", "userId", "isAIGenerated"
FROM "todos";

-- Drop the old table
DROP TABLE "todos";

-- Rename the new table to the original name
ALTER TABLE "new_todos" RENAME TO "todos";