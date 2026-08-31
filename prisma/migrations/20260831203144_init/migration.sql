-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastLoginAt" DATETIME
);

-- CreateTable
CREATE TABLE "WatchZone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "centerLat" REAL NOT NULL,
    "centerLng" REAL NOT NULL,
    "radiusKm" REAL NOT NULL DEFAULT 300,
    "minMagnitude" REAL NOT NULL DEFAULT 4,
    "color" TEXT NOT NULL DEFAULT '#38bdf8',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WatchZone_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Bookmark" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "magnitude" REAL,
    "place" TEXT,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "depthKm" REAL,
    "occurredAt" DATETIME NOT NULL,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SeismicEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "magnitude" REAL,
    "place" TEXT,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "depthKm" REAL,
    "occurredAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "magType" TEXT,
    "type" TEXT NOT NULL DEFAULT 'earthquake',
    "tsunami" INTEGER NOT NULL DEFAULT 0,
    "felt" INTEGER,
    "alert" TEXT,
    "significance" INTEGER,
    "url" TEXT,
    "source" TEXT NOT NULL DEFAULT 'usgs',
    "syncedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AlertLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "watchZoneId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "magnitude" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" DATETIME,
    CONSTRAINT "AlertLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AlertLog_watchZoneId_fkey" FOREIGN KEY ("watchZoneId") REFERENCES "WatchZone" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AlertLog_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "SeismicEvent" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "WatchZone_userId_idx" ON "WatchZone"("userId");

-- CreateIndex
CREATE INDEX "Bookmark_userId_idx" ON "Bookmark"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Bookmark_userId_eventId_key" ON "Bookmark"("userId", "eventId");

-- CreateIndex
CREATE INDEX "SeismicEvent_occurredAt_idx" ON "SeismicEvent"("occurredAt");

-- CreateIndex
CREATE INDEX "SeismicEvent_magnitude_idx" ON "SeismicEvent"("magnitude");

-- CreateIndex
CREATE INDEX "AlertLog_userId_idx" ON "AlertLog"("userId");

-- CreateIndex
CREATE INDEX "AlertLog_userId_readAt_idx" ON "AlertLog"("userId", "readAt");

-- CreateIndex
CREATE UNIQUE INDEX "AlertLog_watchZoneId_eventId_key" ON "AlertLog"("watchZoneId", "eventId");
