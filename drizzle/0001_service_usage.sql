CREATE TABLE IF NOT EXISTS `service_usage` (
  `key` text PRIMARY KEY NOT NULL,
  `count` integer NOT NULL DEFAULT 0
);
