-- DropForeignKey
ALTER TABLE "Document" DROP CONSTRAINT "Document_authorId_fkey";

-- AlterTable
ALTER TABLE "Document" ALTER COLUMN "authorId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
