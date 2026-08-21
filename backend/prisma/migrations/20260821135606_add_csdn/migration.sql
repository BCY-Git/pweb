-- CreateTable
CREATE TABLE "CsdnSnapshot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" TEXT NOT NULL,
    "totalViews" INTEGER NOT NULL,
    "originalCount" INTEGER NOT NULL,
    "fansCount" INTEGER NOT NULL,
    "followingCount" INTEGER NOT NULL,
    "articleCount" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "CsdnArticle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "articleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "postTime" DATETIME NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "diggCount" INTEGER NOT NULL DEFAULT 0,
    "commentCount" INTEGER NOT NULL DEFAULT 0,
    "isTop" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "CsdnSnapshot_date_key" ON "CsdnSnapshot"("date");

-- CreateIndex
CREATE INDEX "CsdnSnapshot_date_idx" ON "CsdnSnapshot"("date");

-- CreateIndex
CREATE UNIQUE INDEX "CsdnArticle_articleId_key" ON "CsdnArticle"("articleId");

-- CreateIndex
CREATE INDEX "CsdnArticle_viewCount_idx" ON "CsdnArticle"("viewCount");

-- CreateIndex
CREATE INDEX "CsdnArticle_postTime_idx" ON "CsdnArticle"("postTime");
