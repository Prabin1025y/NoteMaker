/*
  Warnings:

  - A unique constraint covering the columns `[publicId]` on the table `Block` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[publicId]` on the table `Note` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `publicId` to the `Block` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publicId` to the `Note` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Block" ADD COLUMN     "publicId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "publicId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Block_publicId_key" ON "Block"("publicId");

-- CreateIndex
CREATE UNIQUE INDEX "Note_publicId_key" ON "Note"("publicId");
