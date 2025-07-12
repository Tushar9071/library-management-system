/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `book_master` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "book_master_title_key" ON "book_master"("title");
