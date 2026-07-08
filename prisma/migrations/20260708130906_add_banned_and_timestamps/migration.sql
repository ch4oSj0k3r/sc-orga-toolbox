-- AlterTable
ALTER TABLE `users` ADD COLUMN `bannedAt` DATETIME(3) NULL,
    ADD COLUMN `rejectedAt` DATETIME(3) NULL;
