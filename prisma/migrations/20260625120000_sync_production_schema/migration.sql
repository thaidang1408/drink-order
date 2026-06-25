-- AlterTable
ALTER TABLE `stores` ADD COLUMN `bank_qr_image` VARCHAR(191) NULL,
    ADD COLUMN `bank_name` VARCHAR(191) NULL,
    ADD COLUMN `bank_account_no` VARCHAR(191) NULL,
    ADD COLUMN `bank_account_name` VARCHAR(191) NULL,
    ADD COLUMN `table_count` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `products` ADD COLUMN `has_options` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `is_best_seller` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `orders` ADD COLUMN `payment_method` ENUM('CASH', 'BANK_TRANSFER') NOT NULL DEFAULT 'CASH';

-- AlterTable
ALTER TABLE `order_items` ADD COLUMN `options_json` TEXT NULL,
    ADD COLUMN `options_label` TEXT NULL;

-- CreateTable
CREATE TABLE `product_option_groups` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('SINGLE', 'MULTIPLE') NOT NULL DEFAULT 'SINGLE',
    `required` BOOLEAN NOT NULL DEFAULT true,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `store_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `product_option_groups_store_id_idx`(`store_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_options` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `price_adjust` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `is_default` BOOLEAN NOT NULL DEFAULT false,
    `sort_order` INTEGER NOT NULL DEFAULT 0,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `group_id` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `product_options_group_id_idx`(`group_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_option_assignments` (
    `product_id` VARCHAR(191) NOT NULL,
    `group_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`product_id`, `group_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `product_option_groups` ADD CONSTRAINT `product_option_groups_store_id_fkey` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_options` ADD CONSTRAINT `product_options_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `product_option_groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_option_assignments` ADD CONSTRAINT `product_option_assignments_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_option_assignments` ADD CONSTRAINT `product_option_assignments_group_id_fkey` FOREIGN KEY (`group_id`) REFERENCES `product_option_groups`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
