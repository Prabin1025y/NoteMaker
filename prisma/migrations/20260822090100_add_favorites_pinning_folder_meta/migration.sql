-- AlterTable
ALTER TABLE "Note" ADD COLUMN     "isFavorite" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPinned" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Folder" ADD COLUMN     "color" TEXT,
ADD COLUMN     "icon" TEXT,
ADD COLUMN     "isFavorite" BOOLEAN NOT NULL DEFAULT false;
