/*
  Warnings:

  - You are about to drop the `UserPermissions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserPermissions" DROP CONSTRAINT "UserPermissions_permissions_id_fkey";

-- DropForeignKey
ALTER TABLE "UserPermissions" DROP CONSTRAINT "UserPermissions_users_id_fkey";

-- DropTable
DROP TABLE "UserPermissions";

-- CreateTable
CREATE TABLE "user_permissions" (
    "id" TEXT NOT NULL,
    "users_id" TEXT NOT NULL,
    "permissions_id" TEXT NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_permissions_users_id_permissions_id_key" ON "user_permissions"("users_id", "permissions_id");

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_users_id_fkey" FOREIGN KEY ("users_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permissions" ADD CONSTRAINT "user_permissions_permissions_id_fkey" FOREIGN KEY ("permissions_id") REFERENCES "permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
