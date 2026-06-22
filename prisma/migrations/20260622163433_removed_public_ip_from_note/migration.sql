/*
  Warnings:

  - You are about to drop the column `publicId` on the `Note` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Note_publicId_key";

-- AlterTable
ALTER TABLE "Note" DROP COLUMN "publicId";
