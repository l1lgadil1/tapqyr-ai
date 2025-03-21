/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `assistant_threads` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "user_memories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "taskPreferences" JSONB,
    "workPatterns" JSONB,
    "interactionHistory" JSONB,
    "userPersona" JSONB,
    "memoryText" TEXT,
    CONSTRAINT "user_memories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "user_memories_userId_key" ON "user_memories"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "assistant_threads_userId_key" ON "assistant_threads"("userId");
