/*
  Warnings:

  - You are about to drop the column `permissions_id` on the `user_permissions` table. All the data in the column will be lost.
  - You are about to drop the column `users_id` on the `user_permissions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[user_id,permission_id]` on the table `user_permissions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `permission_id` to the `user_permissions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `user_permissions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "user_permissions" DROP CONSTRAINT "user_permissions_permissions_id_fkey";

-- DropForeignKey
ALTER TABLE "user_permissions" DROP CONSTRAINT "user_permissions_users_id_fkey";

-- DropIndex
DROP INDEX "user_permissions_users_id_permissions_id_key";

-- AlterTable
ALTER TABLE "user_permissions" DROP COLUMN "permissions_id",
DROP COLUMN "users_id",
ADD COLUMN     "permission_id" TEXT NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "user_permissions_user_id_permission_id_key" ON "user_permissions"("user_id", "permission_id");

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
