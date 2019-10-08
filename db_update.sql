ALTER TABLE `maintenancedb` ADD `mailBody` LONGTEXT NULL DEFAULT NULL AFTER `betroffeneCIDs`;
ALTER TABLE `maintenancedb` CHANGE `notes` `notes` LONGTEXT CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL;

ALTER DATABASE maintenance_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
ALTER TABLE authentication CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
ALTER TABLE companies CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
ALTER TABLE kundenCID CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
ALTER TABLE lieferantCID CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
ALTER TABLE maintenancedb CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
ALTER TABLE notificationSubs CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
ALTER TABLE persistence CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
ALTER TABLE reschedule CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

ALTER TABLE `maintenancedb` CHANGE `done` `done` TINYTEXT NOT NULL DEFAULT '0';
ALTER TABLE `maintenancedb` CHANGE `cancelled` `cancelled` TINYTEXT NOT NULL DEFAULT '0';
ALTER TABLE `maintenancedb` CHANGE `emergency` `emergency` TINYTEXT NOT NULL DEFAULT '0';