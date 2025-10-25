CREATE TABLE `day_tag_associations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`tag_id` integer NOT NULL,
	`date` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`tag_id`) REFERENCES `day_tags`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_day_tag_assoc_date` ON `day_tag_associations` (`date`);--> statement-breakpoint
CREATE INDEX `idx_day_tag_assoc_tag_id` ON `day_tag_associations` (`tag_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_unique_tag_date` ON `day_tag_associations` (`tag_id`,`date`);--> statement-breakpoint
CREATE TABLE `day_tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`display_name` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`usage_count` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `day_tags_name_unique` ON `day_tags` (`name`);--> statement-breakpoint
CREATE INDEX `idx_day_tags_name` ON `day_tags` (`name`);