-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `refresh` VARCHAR(255) NULL,

    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Emotion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `feel` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Diary` (
    `content` TEXT NOT NULL,
    `year` INTEGER NOT NULL,
    `month` INTEGER NOT NULL,
    `date` INTEGER NOT NULL,
    `emotion_id` INTEGER NULL,
    `user_id` VARCHAR(191) NOT NULL,

    INDEX `Diary_emotion_id_idx`(`emotion_id`),
    INDEX `Diary_user_id_idx`(`user_id`),
    PRIMARY KEY (`year`, `month`, `date`, `user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Todo` (
    `id` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `year` INTEGER NOT NULL,
    `month` INTEGER NOT NULL,
    `date` INTEGER NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `checked` BOOLEAN NOT NULL DEFAULT false,

    INDEX `Todo_year_month_date_user_id_idx`(`year`, `month`, `date`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Comment` (
    `id` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `todo_id` VARCHAR(191) NOT NULL,
    `emotion_id` INTEGER NULL,

    INDEX `Comment_emotion_id_idx`(`emotion_id`),
    INDEX `Comment_todo_id_idx`(`todo_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Diary` ADD CONSTRAINT `Diary_emotion_id_fkey` FOREIGN KEY (`emotion_id`) REFERENCES `Emotion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Diary` ADD CONSTRAINT `Diary_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Todo` ADD CONSTRAINT `Todo_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_todo_id_fkey` FOREIGN KEY (`todo_id`) REFERENCES `Todo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Comment` ADD CONSTRAINT `Comment_emotion_id_fkey` FOREIGN KEY (`emotion_id`) REFERENCES `Emotion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
