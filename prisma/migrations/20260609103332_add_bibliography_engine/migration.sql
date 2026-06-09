-- CreateEnum
CREATE TYPE "BibliographySource" AS ENUM ('CROSSREF', 'GOOGLE_BOOKS', 'OPENAI_WEB', 'MANUAL');

-- CreateTable
CREATE TABLE "BibliographyItem" (
    "id" TEXT NOT NULL,
    "rawInput" TEXT NOT NULL,
    "source" "BibliographySource" NOT NULL,
    "cslJson" JSONB NOT NULL,
    "title" TEXT,
    "itemType" TEXT,
    "doi" TEXT,
    "isbn" TEXT,
    "url" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BibliographyItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BibliographyItem_doi_key" ON "BibliographyItem"("doi");

-- CreateIndex
CREATE INDEX "BibliographyItem_createdById_idx" ON "BibliographyItem"("createdById");

-- CreateIndex
CREATE INDEX "BibliographyItem_itemType_idx" ON "BibliographyItem"("itemType");

-- CreateIndex
CREATE INDEX "BibliographyItem_title_idx" ON "BibliographyItem"("title");

-- CreateIndex
CREATE INDEX "BibliographyItem_isbn_idx" ON "BibliographyItem"("isbn");

-- CreateIndex
CREATE INDEX "BibliographyItem_url_idx" ON "BibliographyItem"("url");

-- AddForeignKey
ALTER TABLE "BibliographyItem" ADD CONSTRAINT "BibliographyItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
