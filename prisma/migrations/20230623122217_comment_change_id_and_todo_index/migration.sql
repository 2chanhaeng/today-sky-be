/*
  Warnings:

  - The primary key for the `Comment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `Comment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Comment` DROP PRIMARY KEY,
    DROP COLUMN `id`,
    ADD PRIMARY KEY (`todo_id`);

-- CreateIndex
CREATE INDEX `todosOnMonth` ON `Todo`(`year`, `month`, `user_id`);

-- RenameIndex
ALTER TABLE `Todo` RENAME INDEX `Todo_user_id_fkey` TO `Todo_user_id_idx`;

-- RenameIndex
ALTER TABLE `Todo` RENAME INDEX `Todo_year_month_date_user_id_idx` TO `todosOnDate`;
