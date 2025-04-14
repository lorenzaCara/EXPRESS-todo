-- DropForeignKey
ALTER TABLE `item` DROP FOREIGN KEY `Item_listId_fkey`;

-- DropForeignKey
ALTER TABLE `list` DROP FOREIGN KEY `List_userId_fkey`;

-- DropIndex
DROP INDEX `Item_listId_fkey` ON `item`;

-- DropIndex
DROP INDEX `List_userId_fkey` ON `list`;

-- AddForeignKey
ALTER TABLE `List` ADD CONSTRAINT `List_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Item` ADD CONSTRAINT `Item_listId_fkey` FOREIGN KEY (`listId`) REFERENCES `List`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
