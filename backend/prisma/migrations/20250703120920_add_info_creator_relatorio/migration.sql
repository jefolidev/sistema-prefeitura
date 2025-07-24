-- AlterTable
ALTER TABLE "relatorios" ADD COLUMN     "creator_id" TEXT;

-- AddForeignKey
ALTER TABLE "relatorios" ADD CONSTRAINT "relatorios_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
