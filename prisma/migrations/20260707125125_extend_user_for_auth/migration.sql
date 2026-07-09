/*
  Warnings:

  - You are about to drop the column `createdAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sc_handle]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[verification_token]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `password` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sc_handle` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `verification_token` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `users_email_key` ON `users`;

-- AlterTable
ALTER TABLE `users` DROP COLUMN `createdAt`,
    DROP COLUMN `email`,
    DROP COLUMN `name`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `failed_attempts` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `password` VARCHAR(191) NOT NULL,
    ADD COLUMN `role` ENUM('GUEST', 'MEMBER', 'ADMIN') NOT NULL DEFAULT 'GUEST',
    ADD COLUMN `sc_handle` VARCHAR(191) NOT NULL,
    ADD COLUMN `status` ENUM('PENDING', 'VERIFIED', 'ACTIVE', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    ADD COLUMN `verification_token` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `users_sc_handle_key` ON `users`(`sc_handle`);

-- CreateIndex
CREATE UNIQUE INDEX `users_verification_token_key` ON `users`(`verification_token`);
