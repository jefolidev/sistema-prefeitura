/*
  Warnings:

  - You are about to drop the column `secretaria_id` on the `produtos` table. All the data in the column will be lost.
  - You are about to drop the `secretarias` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "produtos" DROP CONSTRAINT "produtos_secretaria_id_fkey";

-- AlterTable
ALTER TABLE "produtos" DROP COLUMN "secretaria_id";

-- DropTable
DROP TABLE "secretarias";
