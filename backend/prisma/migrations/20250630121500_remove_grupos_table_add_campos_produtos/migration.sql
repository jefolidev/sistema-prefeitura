-- DropForeignKey
ALTER TABLE "produtos" DROP CONSTRAINT IF EXISTS "produtos_grupo_id_fkey";

-- AlterTable
ALTER TABLE "produtos"
    DROP COLUMN IF EXISTS "grupo_id",
    ADD COLUMN "unidade_medida" TEXT NOT NULL,
    ADD COLUMN "valor" DOUBLE PRECISION NOT NULL,
    ADD COLUMN "grupo" TEXT NOT NULL;

-- DropTable
DROP TABLE IF EXISTS "grupos";
