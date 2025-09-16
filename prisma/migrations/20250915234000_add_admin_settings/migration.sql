-- CreateTable
CREATE TABLE "AdminSettings" (
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
    FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminSettings_userId_key" ON "AdminSettings"("userId");
