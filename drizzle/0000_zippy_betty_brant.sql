CREATE TABLE `admission_notifications` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`school_id` int NOT NULL,
	`student_id` int NOT NULL,
	`student_name` varchar(255),
	`class_name` varchar(100),
	`section_name` varchar(50),
	`admitted_by` varchar(255),
	`is_read` boolean DEFAULT false,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `admission_notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `attendance` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`school_id` int NOT NULL,
	`student_id` int NOT NULL,
	`attendance_date` date NOT NULL,
	`status` enum('Present','Absent','Late','Holiday') DEFAULT 'Present',
	`remarks` varchar(255),
	`marked_by` int,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `attendance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bank_accounts` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`school_id` int NOT NULL,
	`bank_name` varchar(255),
	`account_number` varchar(50),
	`ifsc_code` varchar(20),
	`account_holder` varchar(255),
	`balance` decimal(14,2) DEFAULT '0',
	`is_active` boolean DEFAULT true,
	CONSTRAINT `bank_accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `classes` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`school_id` int NOT NULL,
	`class_name` varchar(100) NOT NULL,
	CONSTRAINT `classes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `employees` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`school_id` int NOT NULL,
	`name` varchar(255),
	`email` varchar(255),
	`mobile` varchar(20),
	`designation` varchar(100),
	`department` varchar(100),
	`salary` decimal(12,2),
	`joining_date` date,
	`gender` enum('Male','Female','Other'),
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `employees_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `enquiries` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`school_id` int NOT NULL,
	`name` varchar(255),
	`mobile` varchar(20),
	`class_for` varchar(50),
	`source` varchar(100),
	`status` enum('Pending','Converted','Rejected','Follow-up') DEFAULT 'Pending',
	`follow_up_date` date,
	`remarks` varchar(500),
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `enquiries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exam_results` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`school_id` int NOT NULL,
	`student_id` int NOT NULL,
	`exam_type_id` int NOT NULL,
	`subject_id` int NOT NULL,
	`class_id` int,
	`session_id` int,
	`max_marks` decimal(8,2),
	`obtain_marks` decimal(8,2),
	`grade` varchar(5),
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `exam_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exam_types` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`school_id` int NOT NULL,
	`exam_type_name` varchar(100) NOT NULL,
	`session_id` int,
	CONSTRAINT `exam_types_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `expenses` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`school_id` int NOT NULL,
	`title` varchar(255),
	`amount` decimal(12,2) DEFAULT '0',
	`expense_date` date,
	`category` varchar(100),
	`vendor` varchar(255),
	`remarks` varchar(255),
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `expenses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fee_details` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`school_id` int NOT NULL,
	`student_id` int NOT NULL,
	`session_id` int,
	`grand_total` decimal(12,2) DEFAULT '0',
	`discount` decimal(12,2) DEFAULT '0',
	`net_payable` decimal(12,2) DEFAULT '0',
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `fee_details_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gate_pass` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`school_id` int NOT NULL,
	`student_id` int NOT NULL,
	`pass_no` varchar(50),
	`reason` varchar(255),
	`out_time` datetime,
	`in_time` datetime,
	`issued_by` int,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `gate_pass_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `id_cards` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`school_id` int NOT NULL,
	`student_id` int,
	`teacher_id` int,
	`card_type` enum('student','teacher') DEFAULT 'student',
	`issued_date` date,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `id_cards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `incomes` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`school_id` int NOT NULL,
	`title` varchar(255),
	`amount` decimal(12,2) DEFAULT '0',
	`income_date` date,
	`category` varchar(100),
	`remarks` varchar(255),
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `incomes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`school_id` int NOT NULL,
	`title` varchar(255),
	`body` text,
	`target_role` enum('all','students','teachers','parents') DEFAULT 'all',
	`sent_by` int,
	`sent_at` datetime,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `monthly_fees` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`school_id` int NOT NULL,
	`student_id` int NOT NULL,
	`session_id` int,
	`month` varchar(20),
	`paid_amount` decimal(12,2) DEFAULT '0',
	`late_fee` decimal(12,2) DEFAULT '0',
	`discount` decimal(12,2) DEFAULT '0',
	`payment_date` datetime,
	`receipt_no` varchar(50),
	`payment_mode` enum('Cash','Online','Cheque','UPI') DEFAULT 'Cash',
	`remarks` varchar(255),
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `monthly_fees_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `old_fee_payments` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`school_id` int NOT NULL,
	`student_id` int NOT NULL,
	`paid_amount` decimal(12,2) DEFAULT '0',
	`payment_date` datetime,
	`receipt_no` varchar(50),
	`remarks` varchar(255),
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `old_fee_payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `old_students` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`school_id` int NOT NULL,
	`student_id` int NOT NULL,
	`received_amount` decimal(12,2) DEFAULT '0',
	`payment_date` datetime,
	`receipt_no` varchar(50),
	`remarks` varchar(255),
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `old_students_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reminder_notification_oldfee` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`school_id` int NOT NULL,
	`student_id` int NOT NULL,
	`reminder_date` date,
	`is_read` boolean DEFAULT false,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `reminder_notification_oldfee_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reminder_notifications` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`school_id` int NOT NULL,
	`student_id` int NOT NULL,
	`reminder_date` date,
	`is_read` boolean DEFAULT false,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `reminder_notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `schools` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`school_name` varchar(255),
	`school_code` varchar(50),
	`email` varchar(255),
	`password` varchar(255),
	`phone` varchar(20),
	`address` varchar(500),
	`plan` varchar(50) DEFAULT 'Basic',
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `schools_id` PRIMARY KEY(`id`),
	CONSTRAINT `schools_school_code_unique` UNIQUE(`school_code`)
);
--> statement-breakpoint
CREATE TABLE `sections` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`class_id` int NOT NULL,
	`school_id` int NOT NULL,
	`section_name` varchar(50) NOT NULL,
	CONSTRAINT `sections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`school_id` int NOT NULL,
	`session_year` varchar(20) NOT NULL,
	`is_active` boolean DEFAULT false,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `student_siblings` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`student_id` int NOT NULL,
	`sibling_id` int,
	`folio_no` varchar(100),
	`relation_to_main` varchar(50),
	CONSTRAINT `student_siblings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `students` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`school_id` int NOT NULL,
	`session_id` int,
	`class_id` int,
	`section_id` int,
	`name` varchar(255),
	`father_name` varchar(255),
	`mother_name` varchar(255),
	`mobile` varchar(20),
	`alt_mobile` varchar(20),
	`email` varchar(255),
	`password` varchar(255),
	`folio_no` varchar(100),
	`roll_no` varchar(50),
	`photo` varchar(255),
	`gender` enum('Male','Female','Other'),
	`dob` date,
	`address` varchar(500),
	`religion` varchar(50),
	`caste` varchar(50),
	`aadhaar` varchar(20),
	`admission_date` date,
	`is_main_student` boolean DEFAULT true,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `students_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subjects` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`school_id` int NOT NULL,
	`subject_name` varchar(100) NOT NULL,
	`code` varchar(20),
	CONSTRAINT `subjects_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `teachers` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`school_id` int NOT NULL,
	`name` varchar(255),
	`email` varchar(255),
	`mobile` varchar(20),
	`password` varchar(255),
	`subject` varchar(100),
	`photo` varchar(255),
	`gender` enum('Male','Female','Other'),
	`joining_date` date,
	`is_active` boolean DEFAULT true,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `teachers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_logins` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`school_id` int NOT NULL,
	`user_id` int NOT NULL,
	`role` enum('admin','teacher','student','accountant','clerk'),
	`login_time` datetime,
	`logout_time` datetime,
	`ip_address` varchar(45),
	`user_agent` text,
	`session_id` varchar(255),
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `user_logins_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` serial AUTO_INCREMENT NOT NULL,
	`school_id` int NOT NULL,
	`name` varchar(255),
	`email` varchar(255),
	`password` varchar(255),
	`role` enum('accountant','clerk','admin'),
	`is_active` boolean DEFAULT true,
	`last_login` datetime,
	`created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`)
);
