-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" TEXT,
    "resetPasswordToken" TEXT,
    "resetPasswordExpires" DATETIME,
    "lastLogin" DATETIME,
    "workDescription" TEXT,
    "shortTermGoals" TEXT,
    "longTermGoals" TEXT,
    "otherContext" TEXT,
    "onboardingComplete" BOOLEAN NOT NULL DEFAULT false,
    "refreshToken" TEXT
);
INSERT INTO "new_users" ("createdAt", "email", "id", "isEmailVerified", "lastLogin", "longTermGoals", "name", "onboardingComplete", "otherContext", "password", "refreshToken", "resetPasswordExpires", "resetPasswordToken", "shortTermGoals", "updatedAt", "verificationToken", "workDescription") SELECT "createdAt", "email", "id", "isEmailVerified", "lastLogin", "longTermGoals", "name", "onboardingComplete", "otherContext", "password", "refreshToken", "resetPasswordExpires", "resetPasswordToken", "shortTermGoals", "updatedAt", "verificationToken", "workDescription" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
