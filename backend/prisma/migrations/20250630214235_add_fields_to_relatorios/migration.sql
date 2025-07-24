-- AlterTable
ALTER TABLE "relatorios" ADD COLUMN "seq" SERIAL;
ALTER TABLE "relatorios" ADD COLUMN "retirado_por" TEXT;
ALTER TABLE "relatorios" ADD COLUMN "observacao" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "relatorios_seq_key" ON "relatorios"("seq");
