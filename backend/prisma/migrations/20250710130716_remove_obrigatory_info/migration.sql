-- DropForeignKey
ALTER TABLE "produtos" DROP CONSTRAINT "produtos_departamento_id_fkey";

-- AlterTable
ALTER TABLE "departamentos" ALTER COLUMN "cpf" DROP NOT NULL;

-- AlterTable
ALTER TABLE "produtos" ALTER COLUMN "departamento_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "relatorios" ADD COLUMN     "departamento_id" TEXT;

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_departamento_id_fkey" FOREIGN KEY ("departamento_id") REFERENCES "departamentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relatorios" ADD CONSTRAINT "relatorios_departamento_id_fkey" FOREIGN KEY ("departamento_id") REFERENCES "departamentos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
