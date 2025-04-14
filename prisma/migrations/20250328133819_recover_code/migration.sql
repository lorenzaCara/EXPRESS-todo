-- AlterTable
ALTER TABLE `user` ADD COLUMN `recovery_code` VARCHAR(191) NULL,
    ADD COLUMN `recovery_date` DATETIME(3) NULL;
