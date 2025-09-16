-- AlterTable
ALTER TABLE "User" ADD COLUMN "passwordChanged" BOOLEAN DEFAULT false;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AdminSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "displayName" TEXT,
    "businessName" TEXT,
    "businessEmail" TEXT,
    "businessPhone" TEXT,
    "businessAddress" TEXT,
    "businessWebsite" TEXT,
    "defaultClientType" TEXT,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "clientUpdateNotifications" BOOLEAN NOT NULL DEFAULT true,
    "systemAlerts" BOOLEAN NOT NULL DEFAULT true,
    "websiteMonitoringAlerts" BOOLEAN NOT NULL DEFAULT true,
    "monthlyReportEmails" BOOLEAN NOT NULL DEFAULT true,
    "autoBackup" BOOLEAN NOT NULL DEFAULT true,
    "backupFrequency" TEXT NOT NULL DEFAULT 'daily',
    "sessionTimeout" INTEGER NOT NULL DEFAULT 24,
    "compactMode" BOOLEAN NOT NULL DEFAULT false,
    "theme" TEXT NOT NULL DEFAULT 'light',
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "dateFormat" TEXT NOT NULL DEFAULT 'MM/dd/yyyy',
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AdminSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_AdminSettings" ("autoBackup", "backupFrequency", "businessAddress", "businessEmail", "businessName", "businessPhone", "businessWebsite", "clientUpdateNotifications", "compactMode", "createdAt", "currency", "dateFormat", "defaultClientType", "displayName", "emailNotifications", "id", "monthlyReportEmails", "sessionTimeout", "systemAlerts", "theme", "timezone", "updatedAt", "userId", "websiteMonitoringAlerts") SELECT "autoBackup", "backupFrequency", "businessAddress", "businessEmail", "businessName", "businessPhone", "businessWebsite", "clientUpdateNotifications", "compactMode", "createdAt", "currency", "dateFormat", "defaultClientType", "displayName", "emailNotifications", "id", "monthlyReportEmails", "sessionTimeout", "systemAlerts", "theme", "timezone", "updatedAt", "userId", "websiteMonitoringAlerts" FROM "AdminSettings";
DROP TABLE "AdminSettings";
ALTER TABLE "new_AdminSettings" RENAME TO "AdminSettings";
CREATE UNIQUE INDEX "AdminSettings_userId_key" ON "AdminSettings"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
