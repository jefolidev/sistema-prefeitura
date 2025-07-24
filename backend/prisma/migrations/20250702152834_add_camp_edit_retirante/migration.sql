/*
  Warnings:

  - You are about to drop the column `retirado_por` on the `relatorios` table. All the data in the column will be lost.
  - You are about to drop the `user_logs` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `grupo_id` on table `produtos` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "relatorios" DROP CONSTRAINT "relatorios_retirado_por_fkey";

-- DropForeignKey
ALTER TABLE "user_logs" DROP CONSTRAINT "user_logs_user_id_fkey";

-- AlterTable
ALTER TABLE "produtos" ALTER COLUMN "grupo_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "relatorios" DROP COLUMN "retirado_por",
ADD COLUMN     "name_retirante" TEXT;

-- DropTable
DROP TABLE "user_logs";
