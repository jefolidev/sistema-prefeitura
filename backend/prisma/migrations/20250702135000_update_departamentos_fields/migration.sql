-- AlterTable
ALTER TABLE "departamentos" DROP CONSTRAINT IF EXISTS "departamentos_user_id_fkey";
ALTER TABLE "departamentos" DROP COLUMN IF EXISTS "user_id";
ALTER TABLE "departamentos" ADD COLUMN     "responsavel" TEXT NOT NULL;
ALTER TABLE "departamentos" ADD COLUMN     "cpf" TEXT NOT NULL;

