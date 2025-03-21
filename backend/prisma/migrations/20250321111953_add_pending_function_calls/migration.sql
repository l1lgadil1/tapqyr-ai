/*
  Warnings:

  - You are about to drop the column `toolCalls` on the `pending_function_calls` table. All the data in the column will be lost.
  - Added the required column `functionArgs` to the `pending_function_calls` table without a default value. This is not possible if the table is not empty.
  - Added the required column `functionName` to the `pending_function_calls` table without a default value. This is not possible if the table is not empty.
  - Added the required column `toolCallId` to the `pending_function_calls` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_pending_function_calls" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "threadId" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "functionName" TEXT NOT NULL,
    "functionArgs" TEXT NOT NULL,
    "toolCallId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "pending_function_calls_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_pending_function_calls" ("createdAt", "id", "runId", "status", "threadId", "updatedAt", "userId") SELECT "createdAt", "id", "runId", "status", "threadId", "updatedAt", "userId" FROM "pending_function_calls";
DROP TABLE "pending_function_calls";
ALTER TABLE "new_pending_function_calls" RENAME TO "pending_function_calls";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
