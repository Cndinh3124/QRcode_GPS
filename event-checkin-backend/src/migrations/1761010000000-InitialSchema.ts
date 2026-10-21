import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1761010000000 implements MigrationInterface {
  name = 'InitialSchema1761010000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    // Tao bang theo thu tu de cac khoa ngoai co the tham chieu dung.
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS `roles` (
        `id` int NOT NULL AUTO_INCREMENT,
        `name` varchar(50) NOT NULL,
        `description` varchar(255) NULL,
        `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`),
        UNIQUE KEY `UQ_roles_name` (`name`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS `users` (
        `id` varchar(36) NOT NULL,
        `studentCode` varchar(50) NOT NULL,
        `fullName` varchar(100) NOT NULL,
        `email` varchar(100) NOT NULL,
        `password` varchar(255) NOT NULL,
        `isActive` tinyint NOT NULL DEFAULT 1,
        `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        `roleId` int NOT NULL,
        PRIMARY KEY (`id`),
        UNIQUE KEY `UQ_users_studentCode` (`studentCode`),
        UNIQUE KEY `UQ_users_email` (`email`),
        KEY `IDX_users_roleId` (`roleId`),
        CONSTRAINT `FK_users_role` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS `events` (
        `id` varchar(36) NOT NULL,
        `title` varchar(200) NOT NULL,
        `description` text NULL,
        `locationName` varchar(255) NOT NULL,
        `latitude` decimal(10,7) NOT NULL,
        `longitude` decimal(10,7) NOT NULL,
        `radius` int NOT NULL,
        `startTime` datetime NOT NULL,
        `endTime` datetime NOT NULL,
        `status` enum('DRAFT','PUBLISHED','CHECKING_IN','FINISHED','CANCELLED') NOT NULL DEFAULT 'DRAFT',
        `qrToken` varchar(255) NOT NULL,
        `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        `createdById` varchar(36) NULL,
        PRIMARY KEY (`id`),
        UNIQUE KEY `UQ_events_qrToken` (`qrToken`),
        KEY `IDX_events_createdById` (`createdById`),
        CONSTRAINT `FK_events_createdBy` FOREIGN KEY (`createdById`) REFERENCES `users` (`id`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS `attendance` (
        `id` varchar(36) NOT NULL,
        `participantCode` varchar(50) NOT NULL,
        `fullName` varchar(100) NOT NULL,
        `email` varchar(100) NULL,
        `latitude` decimal(10,7) NOT NULL,
        `longitude` decimal(10,7) NOT NULL,
        `distance` decimal(10,2) NOT NULL,
        `checkInTime` datetime NOT NULL,
        `device` varchar(255) NULL,
        `ipAddress` varchar(50) NULL,
        `status` enum('PRESENT','LATE','REJECTED') NOT NULL DEFAULT 'PRESENT',
        `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        `event_id` varchar(36) NOT NULL,
        PRIMARY KEY (`id`),
        UNIQUE KEY `IDX_ATTENDANCE_EVENT_PARTICIPANT` (`event_id`, `participantCode`),
        CONSTRAINT `FK_attendance_event` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS `attendance_risk_assessments` (
        `id` varchar(36) NOT NULL,
        `analysisStatus` enum('PENDING','PROCESSING','SCORED','RETRY','FAILED') NOT NULL DEFAULT 'PENDING',
        `anomalyScore` decimal(8,6) NULL,
        `riskLevel` enum('LOW','MEDIUM','HIGH') NULL,
        `reasonCodes` json NULL,
        `featureSnapshot` json NULL,
        `featureVersion` varchar(64) NOT NULL DEFAULT 'v1',
        `modelVersion` varchar(64) NULL,
        `attemptCount` smallint unsigned NOT NULL DEFAULT 0,
        `nextAttemptAt` datetime NULL,
        `lockedUntil` datetime NULL,
        `lastErrorCode` varchar(64) NULL,
        `reviewDecision` enum('LEGITIMATE','CONFIRMED_FRAUD','NEEDS_FOLLOW_UP') NULL,
        `reviewedAt` datetime NULL,
        `reviewNote` varchar(1000) NULL,
        `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        `attendance_id` varchar(36) NOT NULL,
        `reviewed_by` varchar(36) NULL,
        PRIMARY KEY (`id`),
        UNIQUE KEY `UQ_risk_attendance` (`attendance_id`),
        KEY `IDX_RISK_QUEUE` (`analysisStatus`, `nextAttemptAt`),
        KEY `IDX_RISK_REVIEW` (`riskLevel`, `reviewDecision`, `createdAt`),
        KEY `IDX_risk_reviewed_by` (`reviewed_by`),
        CONSTRAINT `FK_risk_attendance` FOREIGN KEY (`attendance_id`) REFERENCES `attendance` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_risk_reviewed_by` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS `attendance_risk_reviews` (
        `id` varchar(36) NOT NULL,
        `decision` enum('LEGITIMATE','CONFIRMED_FRAUD','NEEDS_FOLLOW_UP') NOT NULL,
        `note` varchar(1000) NULL,
        `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        `assessment_id` varchar(36) NOT NULL,
        `reviewer_id` varchar(36) NULL,
        PRIMARY KEY (`id`),
        KEY `IDX_RISK_REVIEW_HISTORY` (`assessment_id`, `createdAt`),
        KEY `IDX_risk_reviews_reviewer` (`reviewer_id`),
        CONSTRAINT `FK_risk_reviews_assessment` FOREIGN KEY (`assessment_id`) REFERENCES `attendance_risk_assessments` (`id`) ON DELETE CASCADE,
        CONSTRAINT `FK_risk_reviews_reviewer` FOREIGN KEY (`reviewer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // Them cac role can co de tao tai khoan qua giao dien quan tri.
    await queryRunner.query(`
      INSERT IGNORE INTO `roles` (`name`, `description`)
      VALUES
        ('ADMIN', 'Quan tri vien'),
        ('ORGANIZER', 'Nguoi to chuc su kien'),
        ('PARTICIPANT', 'Nguoi tham gia')
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    // Xoa bang con truoc de tranh loi khoa ngoai.
    await queryRunner.query('DROP TABLE IF EXISTS `attendance_risk_reviews`');
    await queryRunner.query('DROP TABLE IF EXISTS `attendance_risk_assessments`');
    await queryRunner.query('DROP TABLE IF EXISTS `attendance`');
    await queryRunner.query('DROP TABLE IF EXISTS `events`');
    await queryRunner.query('DROP TABLE IF EXISTS `users`');
    await queryRunner.query('DROP TABLE IF EXISTS `roles`');
  }
}
