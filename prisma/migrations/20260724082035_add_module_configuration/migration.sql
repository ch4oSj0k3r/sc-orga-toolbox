-- CreateTable
CREATE TABLE `module_configurations` (
    `moduleId` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NULL,
    `description` TEXT NULL,
    `enabled` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`moduleId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `module_allowed_roles` (
    `moduleId` VARCHAR(191) NOT NULL,
    `role` ENUM('GUEST', 'MEMBER', 'ADMIN') NOT NULL,

    PRIMARY KEY (`moduleId`, `role`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `module_allowed_roles` ADD CONSTRAINT `module_allowed_roles_moduleId_fkey` FOREIGN KEY (`moduleId`) REFERENCES `module_configurations`(`moduleId`) ON DELETE CASCADE ON UPDATE CASCADE;
