/*
  Warnings:

  - You are about to drop the column `publicId` on the `Block` table. All the data in the column will be lost.
  - You are about to drop the column `publicId` on the `Note` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[noteId,order]` on the table `Block` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- DropIndex
DROP INDEX "Block_publicId_key";

-- DropIndex
DROP INDEX "Note_publicId_key";

-- AlterTable
ALTER TABLE "Block" DROP COLUMN "publicId",
ALTER COLUMN "title" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Note" DROP COLUMN "publicId";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "refreshToken" TEXT,
ADD COLUMN     "refreshTokenCreatedAt" TIMESTAMP(3),
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

-- CreateIndex
CREATE UNIQUE INDEX "Block_noteId_order_key" ON "Block"("noteId", "order");
