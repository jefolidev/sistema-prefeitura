-- CreateTable
CREATE TABLE "grupos" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "grupos_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "produtos" ADD COLUMN "grupo_id" TEXT;
ALTER TABLE "produtos" DROP COLUMN IF EXISTS "grupo";

-- CreateIndex
CREATE UNIQUE INDEX "grupos_name_key" ON "grupos"("name");

-- AddForeignKey
ALTER TABLE "produtos" ADD CONSTRAINT "produtos_grupo_id_fkey" FOREIGN KEY ("grupo_id") REFERENCES "grupos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
