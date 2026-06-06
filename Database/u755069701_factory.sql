-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Apr 23, 2026 at 03:27 AM
-- Server version: 11.8.6-MariaDB-log
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `u755069701_factory`
--

-- --------------------------------------------------------

--
-- Table structure for table `accounts_ledger`
--

CREATE TABLE `accounts_ledger` (
  `id` int(11) NOT NULL,
  `entry_date` date DEFAULT curdate(),
  `reference_no` varchar(50) DEFAULT NULL,
  `description` varchar(512) DEFAULT NULL,
  `account_type` varchar(20) DEFAULT NULL,
  `side` varchar(10) DEFAULT NULL,
  `amount` decimal(14,2) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `is_deleted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `accounts_report_log`
--

CREATE TABLE `accounts_report_log` (
  `id` int(11) NOT NULL,
  `report_type` varchar(50) DEFAULT NULL,
  `from_date` date DEFAULT NULL,
  `to_date` date DEFAULT NULL,
  `generated_by` int(11) DEFAULT NULL,
  `generated_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `account_payments`
--

CREATE TABLE `account_payments` (
  `id` int(11) NOT NULL,
  `bill_type` varchar(50) NOT NULL,
  `bill_id` int(11) NOT NULL,
  `party_name` varchar(255) DEFAULT NULL,
  `payment_amount` decimal(15,2) NOT NULL,
  `payment_date` date DEFAULT curdate(),
  `remarks` varchar(512) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `payment_method` varchar(50) DEFAULT 'CASH',
  `bank_account_id` int(11) DEFAULT NULL,
  `gst_enabled` tinyint(1) DEFAULT 1,
  `tally_push_status` varchar(20) DEFAULT 'PENDING',
  `is_deleted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `admin_profile`
--

CREATE TABLE `admin_profile` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `name` varchar(512) NOT NULL,
  `gst_number` varchar(512) DEFAULT NULL,
  `address` varchar(512) DEFAULT NULL,
  `phone_number` varchar(512) DEFAULT NULL,
  `alternate_phone_number` varchar(512) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admin_profile`
--

INSERT INTO `admin_profile` (`id`, `user_id`, `name`, `gst_number`, `address`, `phone_number`, `alternate_phone_number`, `created_at`, `updated_at`) VALUES
(1, 7, 'Adhi Mangala Industries', '33AATFA4119K1ZB', '18C/6, New Ramnad Road, \\nRAMA BHAVAN\\nOPP TO ZONE 3  CORPORATION BULIDING MADURAI\\nKAMARAJA SALAI\\nMADURAI-625009', '+918056600666', '', '2026-03-28 01:17:17', '2026-04-08 08:32:49');

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `id` int(11) NOT NULL,
  `staff_id` varchar(50) NOT NULL,
  `staff_name` varchar(100) NOT NULL,
  `attendance_date` date DEFAULT curdate(),
  `shift` varchar(20) NOT NULL,
  `status` varchar(10) DEFAULT 'Absent',
  `is_checked_in` tinyint(1) DEFAULT 0,
  `last_check_in` datetime DEFAULT NULL,
  `total_minutes` int(11) DEFAULT 0,
  `od_minutes` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`id`, `staff_id`, `staff_name`, `attendance_date`, `shift`, `status`, `is_checked_in`, `last_check_in`, `total_minutes`, `od_minutes`) VALUES
(1, 'OP010', 'Diwakar', '2026-04-02', 'Night', 'Absent', 0, '2026-04-02 07:38:27', 0, 0),
(2, 'OP006', 'Kalaiarasan T', '2026-04-02', 'Night', 'Absent', 0, '2026-04-02 07:38:45', 0, 0),
(3, 'OP009', 'Nethaji', '2026-04-02', 'Night', 'Absent', 0, '2026-04-02 07:38:47', 0, 0),
(4, 'WA002', 'Andiappan', '2026-04-08', 'Day', 'Present', 1, '2026-04-08 16:19:34', 720, 0),
(5, 'VA001', 'Arumugam', '2026-04-08', 'Day', 'Absent', 0, '2026-04-08 15:40:07', 0, 0),
(6, 'SA001', 'ganesh pandian', '2026-04-08', 'Day', 'Absent', 0, '2026-04-08 15:40:08', 0, 0),
(7, 'AC002', 'Preethi ', '2026-04-08', 'Day', 'Absent', 0, '2026-04-08 15:40:10', 0, 0),
(8, 'WA001', 'testwa', '2026-04-08', 'Day', 'Absent', 0, '2026-04-08 15:40:11', 0, 0),
(9, 'AC001', 'Thangam', '2026-04-08', 'Day', 'Absent', 0, '2026-04-08 15:40:12', 0, 0),
(10, 'SE001', 'vala vanthan', '2026-04-08', 'Day', 'Absent', 0, '2026-04-08 15:40:13', 0, 0),
(11, 'PA001', 'Amika', '2026-04-08', 'Day', 'Absent', 0, '2026-04-08 15:59:05', 13, 0),
(12, 'WA002', 'Andiappan', '2026-04-09', 'Day', 'Present', 0, NULL, 720, 0),
(13, 'PA001', 'Amika', '2026-04-09', 'Day', 'Present', 0, '2026-04-09 12:37:03', 15796, 15196),
(14, 'WA002', 'Andiappan', '2026-04-20', 'Day', 'Present', 0, NULL, 720, 0),
(15, 'PA001', 'Amika', '2026-04-22', 'Day', 'Absent', 1, '2026-04-22 08:19:50', 0, 0),
(16, 'WA002', 'Andiappan', '2026-04-22', 'Day', 'Present', 0, NULL, 720, 0);

-- --------------------------------------------------------

--
-- Table structure for table `bank_accounts`
--

CREATE TABLE `bank_accounts` (
  `id` int(11) NOT NULL,
  `profile_id` int(11) DEFAULT NULL,
  `account_name` varchar(512) NOT NULL,
  `account_number` varchar(512) NOT NULL,
  `bank_name` varchar(512) NOT NULL,
  `ifsc_code` varchar(512) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `is_deleted` tinyint(1) DEFAULT 0,
  `balance` decimal(15,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bank_accounts`
--

INSERT INTO `bank_accounts` (`id`, `profile_id`, `account_name`, `account_number`, `bank_name`, `ifsc_code`, `created_at`, `is_deleted`, `balance`) VALUES
(1, 1, 'Adhi Mangala Industires', '002530310875667', 'TMB BANK', 'TMBL0000002', '2026-04-08 08:32:49', 0, 5500.00);

-- --------------------------------------------------------

--
-- Table structure for table `customer_product_prices`
--

CREATE TABLE `customer_product_prices` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp(),
  `price_with_gst` decimal(15,2) DEFAULT NULL,
  `price_without_gst` decimal(15,2) DEFAULT NULL,
  `product_name` varchar(512) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customer_product_prices`
--

INSERT INTO `customer_product_prices` (`id`, `customer_id`, `product_id`, `created_at`, `updated_at`, `price_with_gst`, `price_without_gst`, `product_name`) VALUES
(3, 83, 100, '2026-04-01 20:50:02', '2026-04-01 20:50:02', 100.00, 1000.00, '1test');

-- --------------------------------------------------------

--
-- Table structure for table `day_book`
--

CREATE TABLE `day_book` (
  `id` int(11) NOT NULL,
  `date` date DEFAULT curdate(),
  `voucher_type` varchar(50) DEFAULT NULL,
  `party_name` varchar(255) DEFAULT NULL,
  `reference_no` varchar(100) DEFAULT NULL,
  `debit_amount` decimal(15,2) DEFAULT 0.00,
  `credit_amount` decimal(15,2) DEFAULT 0.00,
  `description` varchar(512) DEFAULT NULL,
  `linked_id` int(11) DEFAULT NULL,
  `linked_type` varchar(50) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `payment_method` varchar(50) DEFAULT NULL,
  `bank_account_id` int(11) DEFAULT NULL,
  `gst_type` varchar(20) DEFAULT 'with',
  `reason` varchar(512) DEFAULT NULL,
  `gst_enabled` tinyint(1) DEFAULT 1,
  `is_deleted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `dispatch`
--

CREATE TABLE `dispatch` (
  `id` int(11) NOT NULL,
  `batch_number` varchar(20) NOT NULL,
  `packing_list_id` int(11) DEFAULT NULL,
  `packing_sticker_id` int(11) DEFAULT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `customer_name` varchar(255) DEFAULT NULL,
  `dispatched_by` int(11) DEFAULT NULL,
  `dispatched_at` datetime DEFAULT current_timestamp(),
  `pdf_path` varchar(512) DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  `sales_history_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `dispatch_item`
--

CREATE TABLE `dispatch_item` (
  `id` int(11) NOT NULL,
  `dispatch_id` int(11) NOT NULL,
  `product_id` int(11) DEFAULT NULL,
  `product_name` varchar(255) DEFAULT NULL,
  `quantity` decimal(12,3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `finished_goods_box_records`
--

CREATE TABLE `finished_goods_box_records` (
  `id` int(11) NOT NULL,
  `product_id` int(11) DEFAULT NULL,
  `product_name` varchar(512) DEFAULT NULL,
  `batch_number` varchar(512) DEFAULT NULL,
  `weight` decimal(15,2) DEFAULT NULL,
  `sticker_number` varchar(512) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `box_size` varchar(255) DEFAULT NULL,
  `color` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `head_attendance`
--

CREATE TABLE `head_attendance` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL,
  `login_time` datetime DEFAULT current_timestamp(),
  `date_only` date DEFAULT curdate()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `head_attendance`
--

INSERT INTO `head_attendance` (`id`, `email`, `role`, `login_time`, `date_only`) VALUES
(1, 'phead', 'PRODUCTION HEAD', '2026-03-27 07:18:40', '2026-03-27'),
(2, 'head', 'PRODUCTION HEAD', '2026-03-30 15:03:36', '2026-03-30'),
(3, 'pack', 'PACKING', '2026-03-30 15:05:53', '2026-03-30'),
(4, 'quality', 'QUALITY', '2026-03-30 15:19:41', '2026-03-30'),
(5, 'head', 'PRODUCTION HEAD', '2026-03-31 16:26:03', '2026-03-31'),
(6, 'head', 'PRODUCTION HEAD', '2026-04-01 08:10:08', '2026-04-01'),
(7, 'head', 'PRODUCTION HEAD', '2026-04-02 07:38:14', '2026-04-02'),
(8, 'pack', 'PACKING', '2026-04-02 11:23:13', '2026-04-02'),
(9, 'head', 'PRODUCTION HEAD', '2026-04-03 12:06:13', '2026-04-03'),
(10, 'head', 'PRODUCTION HEAD', '2026-04-04 11:41:03', '2026-04-04'),
(11, 'head', 'PRODUCTION HEAD', '2026-04-05 09:09:54', '2026-04-05'),
(12, 'pack', 'PACKING', '2026-04-05 20:29:19', '2026-04-05'),
(13, 'pack', 'PACKING', '2026-04-06 11:14:42', '2026-04-06'),
(14, 'head', 'PRODUCTION HEAD', '2026-04-06 11:17:50', '2026-04-06'),
(15, 'quality', 'QUALITY', '2026-04-06 14:09:13', '2026-04-06'),
(16, 'swetha', 'QUALITY', '2026-04-06 14:28:15', '2026-04-06'),
(17, 'head', 'PRODUCTION HEAD', '2026-04-08 12:45:46', '2026-04-08'),
(18, 'pack', 'PACKING', '2026-04-08 17:12:30', '2026-04-08'),
(19, 'gemini', 'PRODUCTION HEAD', '2026-04-09 07:58:35', '2026-04-09'),
(20, 'pack', 'PACKING', '2026-04-09 08:32:35', '2026-04-09'),
(21, 'head', 'PRODUCTION HEAD', '2026-04-09 12:06:01', '2026-04-09'),
(22, 'swetha', 'QUALITY', '2026-04-09 13:29:09', '2026-04-09'),
(23, 'gemini', 'PRODUCTION HEAD', '2026-04-15 19:48:01', '2026-04-15'),
(24, 'gemini', 'PRODUCTION HEAD', '2026-04-17 13:27:23', '2026-04-17'),
(25, 'maha', 'PACKING', '2026-04-17 13:43:40', '2026-04-17'),
(26, 'Gemini', 'PRODUCTION HEAD', '2026-04-18 04:52:46', '2026-04-18'),
(27, 'swetha', 'QUALITY', '2026-04-18 09:27:36', '2026-04-18'),
(28, 'maha', 'PACKING', '2026-04-18 15:29:42', '2026-04-18'),
(29, 'maha', 'PACKING', '2026-04-19 08:23:54', '2026-04-19'),
(30, 'gemini', 'PRODUCTION HEAD', '2026-04-19 09:12:43', '2026-04-19'),
(31, 'gemini', 'PRODUCTION HEAD', '2026-04-20 11:23:50', '2026-04-20'),
(32, 'maha', 'PACKING', '2026-04-20 11:25:43', '2026-04-20'),
(33, 'gemini', 'PRODUCTION HEAD', '2026-04-21 13:05:09', '2026-04-21'),
(34, 'maha', 'PACKING', '2026-04-21 13:51:21', '2026-04-21'),
(35, 'gemini', 'PRODUCTION HEAD', '2026-04-22 08:17:20', '2026-04-22');

-- --------------------------------------------------------

--
-- Table structure for table `hourly_production_logs`
--

CREATE TABLE `hourly_production_logs` (
  `id` int(11) NOT NULL,
  `machine_id` varchar(50) DEFAULT NULL,
  `machine_name` varchar(255) DEFAULT NULL,
  `shift` varchar(50) DEFAULT NULL,
  `total_output` int(11) DEFAULT NULL,
  `hourly_output` int(11) DEFAULT NULL,
  `chiller_check` tinyint(1) DEFAULT 0,
  `compressor_check` tinyint(1) DEFAULT 0,
  `mould_check` tinyint(1) DEFAULT 0,
  `machine_check` tinyint(1) DEFAULT 0,
  `remarks` varchar(512) DEFAULT NULL,
  `timestamp` datetime DEFAULT current_timestamp(),
  `operator_id` varchar(50) DEFAULT NULL,
  `hour_range` varchar(50) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'pending',
  `total_count_at_end` int(11) DEFAULT NULL,
  `down_time` varchar(50) DEFAULT NULL,
  `down_reason` varchar(512) DEFAULT NULL,
  `semi_finished_product` varchar(255) DEFAULT NULL,
  `production_date` date DEFAULT NULL,
  `hour_slot_from` varchar(10) DEFAULT NULL,
  `hour_slot_to` varchar(10) DEFAULT NULL,
  `good_parts` int(11) DEFAULT 0,
  `rejects` int(11) DEFAULT 0,
  `submitted_at` timestamp NULL DEFAULT NULL,
  `is_missed` tinyint(1) DEFAULT 0,
  `is_edited_by_head` tinyint(1) DEFAULT 0,
  `edited_by` varchar(255) DEFAULT NULL,
  `edited_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hourly_production_logs`
--

INSERT INTO `hourly_production_logs` (`id`, `machine_id`, `machine_name`, `shift`, `total_output`, `hourly_output`, `chiller_check`, `compressor_check`, `mould_check`, `machine_check`, `remarks`, `timestamp`, `operator_id`, `hour_range`, `status`, `total_count_at_end`, `down_time`, `down_reason`, `semi_finished_product`, `production_date`, `hour_slot_from`, `hour_slot_to`, `good_parts`, `rejects`, `submitted_at`, `is_missed`, `is_edited_by_head`, `edited_by`, `edited_at`) VALUES
(1, '1', 'UNIT 1', NULL, 120, 120, 1, 1, 1, 1, 'No', '2026-01-29 09:38:34', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(2, '1', 'UNIT 1', NULL, 240, 120, 1, 1, 0, 0, 'Repair ', '2026-01-29 09:40:04', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(3, '1', 'UNIT 1', NULL, 360, 120, 0, 0, 0, 0, 'Not ok', '2026-01-29 09:42:08', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(4, '2', 'UNIT 2', NULL, 72, 72, 0, 0, 0, 0, 'Emp', '2026-01-29 10:02:13', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(5, '1', 'UNIT 1', NULL, 816, 360, 1, 1, 1, 1, '20', '2026-01-29 12:02:55', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(6, '1', 'UNIT 1', NULL, 1644, 720, 0, 0, 0, 0, '', '2026-01-29 12:08:03', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(7, '3', 'UNIT 3', NULL, 118, 48, 0, 0, 0, 0, '', '2026-01-29 12:15:05', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(40, '1', 'UNIT 1', NULL, 120, 120, 1, 1, 1, 1, 'Yhg', '2026-01-29 16:52:20', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(41, '1', 'UNIT 1', NULL, 450, 450, 0, 0, 0, 0, '', '2026-01-29 16:58:26', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(42, '1', 'UNIT 1', NULL, 570, 120, 0, 0, 0, 0, '', '2026-01-29 17:00:24', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(43, '1', 'UNIT 1', NULL, 0, 0, 0, 0, 0, 0, '', '2026-01-30 07:07:54', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(44, '2', 'UNIT 2', NULL, 258, 258, 1, 1, 1, 1, '', '2026-01-30 09:59:05', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(45, '2', 'UNIT 2', NULL, 586, 328, 1, 0, 1, 0, '', '2026-01-30 10:02:02', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(46, '1', 'UNIT 1', NULL, 144, 144, 0, 0, 0, 0, '', '2026-02-02 11:03:07', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(47, '1', 'UNIT 1', NULL, 204, 204, 1, 1, 1, 1, '', '2026-02-02 11:14:25', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(48, '1', 'UNIT 1', NULL, 130, 0, 0, 0, 0, 0, '', '2026-02-02 11:16:36', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(49, '1', 'UNIT 1', NULL, 170, 0, 0, 0, 0, 0, '', '2026-02-02 11:19:26', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(50, '1', 'UNIT 1', NULL, 4, 4, 0, 0, 0, 0, '', '2026-02-02 11:22:03', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(51, '1', 'UNIT 1', NULL, 4, 0, 0, 0, 0, 0, '', '2026-02-02 11:24:08', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(52, '1', 'UNIT 1', NULL, 4, 0, 0, 0, 0, 0, '', '2026-02-02 11:26:31', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(53, '1', 'UNIT 1', NULL, 58, 46, 0, 0, 0, 0, '', '2026-02-02 11:55:43', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(54, '1', 'UNIT 1', NULL, 8, 8, 0, 0, 0, 0, '', '2026-02-04 06:31:05', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(55, '1', 'UNIT 1', NULL, 123, 123, 0, 0, 0, 0, '', '2026-02-04 07:22:06', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(56, '1', 'UNIT 1', NULL, 50, 50, 0, 0, 0, 0, '', '2026-02-04 08:05:20', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(57, '1', 'UNIT 1', NULL, 49, 49, 0, 0, 0, 0, '', '2026-02-06 07:55:57', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(58, '1', 'UNIT 1', NULL, 367, 367, 0, 0, 0, 0, '', '2026-02-06 08:31:36', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(59, '1', 'UNIT 1', NULL, 73, 73, 0, 0, 0, 0, '', '2026-02-06 11:34:51', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(60, '1', 'UNIT 1', NULL, 149, 149, 0, 0, 0, 0, '', '2026-02-06 11:42:33', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(61, '3', 'UNIT 3', NULL, 954, 954, 0, 0, 0, 0, '', '2026-02-06 11:49:07', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(62, '1', 'UNIT 1', NULL, 165, 165, 0, 0, 0, 0, '', '2026-02-06 12:01:37', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(63, '2', 'UNIT 2', NULL, 26, 26, 0, 0, 0, 0, '', '2026-02-06 12:13:39', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(64, '1', 'UNIT 1', NULL, 40774, 40774, 0, 0, 0, 0, '', '2026-02-09 09:13:40', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(65, '3', 'UNIT 3', NULL, 3546, 3546, 0, 0, 0, 0, '', '2026-02-09 09:39:45', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(66, '1', 'UNIT 1', NULL, 268, 268, 0, 0, 0, 0, '', '2026-02-09 12:15:46', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(67, '2', 'UNIT 2', NULL, 0, 0, 0, 0, 0, 0, '', '2026-02-11 20:08:36', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(68, '2', 'UNIT 2', NULL, 0, 0, 0, 0, 0, 0, '', '2026-02-11 20:11:12', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(69, '1', 'UNIT 1', NULL, 4326, 4326, 0, 0, 0, 0, '', '2026-02-12 09:31:50', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(70, '1', 'UNIT 1', NULL, 5424, 5424, 0, 0, 0, 0, '', '2026-02-12 11:57:45', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(71, '2', 'UNIT 2', NULL, 546, 546, 0, 0, 0, 0, '', '2026-02-12 12:35:37', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(72, '2', 'UNIT 2', NULL, 568, 568, 1, 1, 1, 1, '', '2026-02-12 13:10:28', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(73, '1', 'UNIT 1', 'Night Shift', 300, 300, 0, 0, 0, 0, '', '2026-03-06 20:24:02', '1', '1:52AM - 1:53AM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(74, '1', 'UNIT 1', 'Night Shift', 680, 680, 0, 0, 0, 0, '', '2026-03-06 20:25:34', '1', '1:53AM - 1:54AM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(75, '1', 'UNIT 1', 'Night Shift', 1152, 1152, 1, 1, 1, 1, '', '2026-03-06 20:26:07', '1', '1:54AM - 1:55AM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(76, '1', 'UNIT 1', 'Day Shift', 60, 60, 0, 0, 0, 0, '', '2026-03-07 06:24:05', '1', '11:52AM - 11:53AM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(77, '1', 'UNIT 1', 'Day Shift', 248, 248, 0, 0, 0, 0, '', '2026-03-07 06:28:05', '1', '11:54AM - 11:55AM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(78, '1', 'UNIT 1', 'Day Shift', 880, 880, 0, 0, 0, 0, '', '2026-03-07 06:28:11', '1', '11:55AM - 11:56AM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(79, '1', 'UNIT 1', 'Day Shift', 60, 36, 0, 0, 0, 0, '', '2026-03-07 06:32:09', '1', '12:00PM - 12:01PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(80, '1', 'UNIT 1', 'Night Shift', 60, 30, 0, 0, 0, 0, '', '2026-03-07 06:35:06', '1', '12:03PM - 12:04PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(81, '1', 'UNIT 1', 'Day Shift', 120, 120, 0, 0, 0, 0, '', '2026-03-07 06:44:47', '1', '12:13PM - 12:14PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(82, '1', 'UNIT 1', 'Night Shift', 60, 60, 0, 0, 0, 0, '', '2026-03-07 06:52:35', '1', '12:21PM - 12:22PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(83, '1', 'UNIT 1', 'Night Shift', 60, 60, 0, 0, 0, 0, '', '2026-03-07 06:58:07', '1', '12:27PM - 12:28PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(84, '1', 'UNIT 1', 'Night Shift', 120, 60, 0, 0, 0, 0, '', '2026-03-07 06:59:07', '1', '12:28PM - 12:29PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(85, '1', 'UNIT 1', 'Night Shift', 180, 60, 0, 0, 0, 0, '', '2026-03-07 07:00:07', '1', '12:29PM - 12:30PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(86, '3', 'UNIT 3', 'Night Shift', 240, 240, 0, 0, 0, 0, '', '2026-03-07 07:05:43', '1', '12:34PM - 12:35PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(87, '3', 'UNIT 3', 'Night Shift', 480, 240, 0, 0, 0, 0, '', '2026-03-07 07:06:42', '1', '12:35PM - 12:36PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(88, '1', 'UNIT 1', 'Night Shift', 58, 58, 0, 0, 0, 0, '', '2026-03-07 07:26:18', '1', '12:55PM - 12:56PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(89, '1', 'UNIT 1', 'Night Shift', 120, 62, 0, 0, 0, 0, '', '2026-03-07 07:27:07', '1', '12:56PM - 12:57PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(90, '1', 'UNIT 1', 'Night Shift', 264, 144, 0, 0, 0, 0, '', '2026-03-07 07:30:12', '1', '12:57PM - 12:58PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(91, '1', 'UNIT 1', 'Night Shift', 448, 60, 0, 0, 0, 0, '', '2026-03-07 07:31:08', '1', '12:58PM - 12:59PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(92, '1', 'UNIT 1', 'Night Shift', 464, 16, 0, 0, 0, 0, '', '2026-03-07 07:33:06', '1', '1:02PM - 1:03PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(93, '1', 'UNIT 1', 'Night Shift', 58, 58, 0, 0, 0, 0, '', '2026-03-07 08:26:04', '1', '1:54PM - 1:55PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(94, '1', 'UNIT 1', 'Night Shift', 126, 68, 0, 0, 0, 0, '', '2026-03-07 08:29:03', '1', '1:57PM - 1:58PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(95, '1', 'UNIT 1', 'Day Shift', 58, 58, 0, 0, 0, 0, '', '2026-03-07 09:03:17', '1', '2:32PM - 2:33PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(96, '1', 'UNIT 1', 'Night Shift', 60, 60, 0, 0, 0, 0, '', '2026-03-07 11:34:27', '1', '5:03PM - 5:04PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(97, '1', 'UNIT 1', 'Night Shift', 120, 60, 0, 0, 0, 0, '', '2026-03-07 11:35:28', '1', '5:04PM - 5:05PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(98, '1', 'UNIT 1', 'Night Shift', 180, 60, 0, 0, 0, 0, '', '2026-03-07 11:36:28', '1', '5:05PM - 5:06PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(99, '1', 'UNIT 1', 'Night Shift', 60, 60, 0, 0, 0, 0, '', '2026-03-08 15:25:10', '1', '8:54PM - 8:55PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(100, '1', 'UNIT 1', 'Night Shift', 120, 60, 0, 0, 0, 0, '', '2026-03-08 15:26:04', '1', '8:55PM - 8:56PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(101, '1', 'UNIT 1', 'Night Shift', 60, 60, 0, 0, 0, 0, '', '2026-03-08 15:28:50', '1', '8:57PM - 8:58PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(102, '1', 'UNIT 1', 'Night Shift', 60, 60, 0, 0, 0, 0, '', '2026-03-09 07:41:07', '1', '1:10PM - 1:11PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(103, '1', 'UNIT 1', 'Night Shift', 120, 120, 0, 0, 0, 0, '', '2026-03-09 09:44:05', '1', '3:12PM - 3:13PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(104, '1', 'UNIT 1', 'Night Shift', 240, 120, 0, 0, 0, 0, '', '2026-03-09 09:45:30', '1', '3:13PM - 3:14PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(105, '1', 'UNIT 1', 'Night Shift', 360, 120, 0, 0, 0, 0, '', '2026-03-09 09:46:08', '1', '3:14PM - 3:15PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(106, '1', 'UNIT 1', 'Night Shift', 480, 120, 0, 0, 0, 0, '', '2026-03-09 09:46:53', '1', '3:15PM - 3:16PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(107, '1', 'UNIT 1', 'Night Shift', 240, 240, 0, 0, 0, 0, '', '2026-03-10 08:00:59', '1', '1:29PM - 1:30PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(108, '1', 'UNIT 1', 'Day Shift', 48, 48, 0, 0, 0, 0, '', '2026-03-11 19:28:08', '1', '12:56AM - 12:57AM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(109, '4', 'UNIT 4', 'Night Shift', 60, 60, 0, 0, 0, 0, '', '2026-03-11 19:31:19', '1', '12:59AM - 1:00AM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(110, '4', 'UNIT 4', 'Night Shift', 120, 60, 0, 0, 0, 0, '', '2026-03-11 19:31:53', '1', '1:00AM - 1:01AM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(111, '4', 'UNIT 4', 'Night Shift', 180, 60, 0, 0, 0, 0, '', '2026-03-11 19:32:54', '1', '1:01AM - 1:02AM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(112, '1', 'UNIT 1', 'Night Shift', 104, 104, 0, 0, 0, 0, '', '2026-03-12 05:31:04', '2', '10:59AM - 11:00AM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(113, '1', 'UNIT 1', 'Day Shift', 240, 120, 0, 0, 0, 0, '', '2026-03-12 06:49:43', '1', '12:18PM - 12:19PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(114, '1', 'UNIT 1', 'Day Shift', 300, 60, 0, 0, 0, 0, '', '2026-03-12 06:50:13', '1', '12:19PM - 12:20PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(115, '1', 'UNIT 1', 'Day Shift', 360, 60, 0, 0, 0, 0, '', '2026-03-12 06:51:16', '1', '12:20PM - 12:21PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(116, '1', 'UNIT 1', 'Day Shift', 420, 60, 0, 0, 0, 0, '', '2026-03-12 06:52:42', '1', '12:21PM - 12:22PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(117, '1', 'UNIT 1', 'Day Shift', 60, 60, 0, 0, 0, 0, '', '2026-03-12 13:21:32', '1', '6:50PM - 6:51PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(118, '1', 'UNIT 1', 'Day Shift', 60, 60, 1, 1, 1, 1, '', '2026-03-13 10:17:57', '1', '3:46PM - 3:47PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(119, '1', 'UNIT 1', 'Day Shift', 140, 90, 0, 0, 0, 0, '', '2026-03-13 10:19:11', '1', '3:47PM - 3:48PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(120, '1', 'UNIT 1', 'Day Shift', 180, 96, 0, 0, 0, 0, '', '2026-03-13 10:20:07', '1', '3:48PM - 3:49PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(121, '1', 'UNIT 1', 'Night Shift', 60, 60, 0, 1, 0, 1, '', '2026-03-13 10:23:20', '1', '3:52PM - 3:53PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(122, '1', 'UNIT 1', 'Night Shift', 180, 60, 0, 0, 0, 0, '', '2026-03-13 10:25:17', '1', '3:54PM - 3:55PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(123, '3', 'Shibavra 250T', 'Night Shift', 120, 120, 0, 0, 0, 0, '', '2026-03-13 10:43:10', '1', '4:11PM - 4:12PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(124, '1', 'Shibavra 250T', 'Night Shift', 120, 120, 0, 0, 0, 0, '', '2026-03-13 10:43:21', '1', '4:12PM - 4:13PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(125, '1', 'Shibavra 250T', 'Night Shift', 180, 60, 0, 0, 0, 1, '', '2026-03-13 10:44:09', '1', '4:13PM - 4:14PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(126, '2', 'Shibavra 250T', 'Day Shift', 360, 360, 0, 0, 0, 0, '', '2026-03-13 10:44:14', '1', '4:13PM - 4:14PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(127, '1', 'Shibavra 250T', 'Night Shift', 180, 60, 0, 0, 0, 0, '', '2026-03-13 10:45:21', '1', '4:13PM - 4:14PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(128, '1', 'Shibavra 250T', 'Night Shift', 300, 120, 0, 0, 0, 0, '', '2026-03-13 10:46:45', '1', '4:15PM - 4:16PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(129, '1', 'Shibavra 250T', 'Night Shift', 360, 60, 0, 0, 0, 0, '', '2026-03-13 10:47:03', '1', '4:16PM - 4:17PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(130, '1', 'Shibavra 250T', 'Night Shift', 420, 60, 0, 0, 0, 0, '', '2026-03-13 10:48:04', '1', '4:17PM - 4:18PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(131, '1', 'Shibavra 250T', 'Night Shift', 480, 60, 0, 0, 0, 0, '', '2026-03-13 10:49:06', '1', '4:18PM - 4:19PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(132, '5', 'Shibavra 180T', 'Night Shift', 2502094, 60, 0, 0, 0, 0, '', '2026-03-13 14:02:05', '1', '2:02PM - 2:03PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(133, '5', 'Shibavra 180T', 'Night Shift', 2502214, 60, 0, 0, 0, 0, '', '2026-03-13 14:02:06', '1', '2:04PM - 2:05PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(134, '5', 'Shibavra 180T', 'Night Shift', 2502334, 60, 0, 0, 0, 0, '', '2026-03-13 14:02:07', '1', '2:06PM - 2:07PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(135, '1', 'Shibavra 250T', 'Day Shift', -19680, 60, 0, 0, 0, 0, '', '2026-03-13 14:02:23', '1', '2:02PM - 2:03PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(136, '1', 'Shibavra 250T', 'Day Shift', -19560, 60, 0, 0, 0, 0, '', '2026-03-13 14:02:24', '1', '2:04PM - 2:05PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(137, '1', 'Shibavra 250T', 'Day Shift', -19440, 60, 0, 0, 0, 0, '', '2026-03-13 14:02:25', '1', '2:06PM - 2:07PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(138, '1', 'Shibavra 250T', 'Day Shift', -19320, 60, 0, 0, 0, 0, '', '2026-03-13 14:02:29', '1', '2:08PM - 2:09PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(139, '1', 'Shibavra 250T', 'Day Shift', -19200, 60, 0, 0, 0, 0, '', '2026-03-13 14:02:30', '1', '2:10PM - 2:11PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(140, '1', 'Shibavra 250T', 'Day Shift', -19080, 60, 0, 0, 0, 0, '', '2026-03-13 14:02:35', '1', '2:12PM - 2:13PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(141, '1', 'Shibavra 250T', 'Day Shift', -18960, 60, 0, 0, 0, 0, '', '2026-03-13 14:02:37', '1', '2:14PM - 2:15PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(142, '1', 'Shibavra 250T', 'Day Shift', -18840, 60, 0, 0, 0, 0, '', '2026-03-13 14:02:38', '1', '2:16PM - 2:17PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(143, '1', 'Shibavra 250T', 'Day Shift', -18720, 60, 0, 0, 0, 0, '', '2026-03-13 14:02:38', '1', '2:18PM - 2:19PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(144, '1', 'Shibavra 250T', 'Day Shift', -18600, 60, 0, 0, 0, 0, '', '2026-03-13 14:02:39', '1', '2:20PM - 2:21PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(145, '1', 'Shibavra 250T', 'Day Shift', -18480, 60, 0, 0, 0, 0, '', '2026-03-13 14:02:39', '1', '2:22PM - 2:23PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(146, '1', 'Shibavra 250T', 'Day Shift', -18360, 60, 0, 0, 0, 0, '', '2026-03-13 14:02:40', '1', '2:24PM - 2:25PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(147, '1', 'Shibavra 250T', 'Day Shift', -18240, 60, 0, 0, 0, 0, '', '2026-03-13 14:02:40', '1', '2:26PM - 2:27PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(148, '1', 'Shibavra 250T', 'Day Shift', -18120, 60, 0, 0, 0, 0, '', '2026-03-13 14:02:41', '1', '2:28PM - 2:29PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(149, '1', 'Shibavra 250T', 'Day Shift', -18000, 60, 0, 0, 0, 0, '', '2026-03-13 14:02:41', '1', '2:30PM - 2:31PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(150, '1', 'Shibavra 250T', 'Day Shift', -17880, 60, 0, 0, 0, 0, '', '2026-03-13 14:02:42', '1', '2:32PM - 2:33PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(151, '1', 'Shibavra 250T', 'Day Shift', -17760, 60, 0, 0, 0, 0, '', '2026-03-13 14:02:42', '1', '2:34PM - 2:35PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(152, '1', 'Shibavra 250T', 'Day Shift', -17640, 60, 0, 0, 0, 0, '', '2026-03-13 14:02:43', '1', '2:36PM - 2:37PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(153, '1', 'Shibavra 250T', 'Day Shift', -17520, 60, 0, 0, 0, 0, '', '2026-03-13 14:02:43', '1', '2:38PM - 2:39PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(154, '1', 'Shibavra 250T', 'Day Shift', -17400, 60, 0, 0, 0, 0, '', '2026-03-13 14:02:44', '1', '2:40PM - 2:41PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(155, '2', 'Shibavra 250T', 'Night Shift', -39480, -39480, 0, 0, 0, 0, '', '2026-03-13 14:03:11', '1', '2:01PM - 2:02PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(156, '2', 'Shibavra 250T', 'Night Shift', -39240, 120, 0, 0, 0, 0, '', '2026-03-13 14:03:12', '1', '2:03PM - 2:04PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(157, '2', 'Shibavra 250T', 'Night Shift', -39000, 120, 0, 0, 0, 0, '', '2026-03-13 14:03:13', '1', '2:05PM - 2:06PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(158, '2', 'Shibavra 250T', 'Night Shift', -38760, 120, 0, 0, 0, 0, '', '2026-03-13 14:03:13', '1', '2:07PM - 2:08PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(159, '2', 'Shibavra 250T', 'Night Shift', -38520, 120, 0, 0, 0, 0, '', '2026-03-13 14:03:14', '1', '2:09PM - 2:10PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(160, '2', 'Shibavra 250T', 'Night Shift', -38280, 120, 0, 0, 0, 0, '', '2026-03-13 14:03:15', '1', '2:11PM - 2:12PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(161, '2', 'Shibavra 250T', 'Night Shift', -38040, 120, 0, 0, 0, 0, '', '2026-03-13 14:03:15', '1', '2:13PM - 2:14PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(162, '2', 'Shibavra 250T', 'Night Shift', -37800, 120, 0, 0, 0, 0, '', '2026-03-13 14:03:16', '1', '2:15PM - 2:16PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(163, '2', 'Shibavra 250T', 'Night Shift', -37560, 120, 0, 0, 0, 0, '', '2026-03-13 14:03:16', '1', '2:17PM - 2:18PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(164, '2', 'Shibavra 250T', 'Night Shift', -37320, 120, 0, 0, 0, 0, '', '2026-03-13 14:03:17', '1', '2:19PM - 2:20PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(165, '2', 'Shibavra 250T', 'Night Shift', -37080, 120, 0, 0, 0, 0, '', '2026-03-13 14:03:17', '1', '2:21PM - 2:22PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(166, '2', 'Shibavra 250T', 'Night Shift', -36840, 120, 0, 0, 0, 0, '', '2026-03-13 14:03:17', '1', '2:23PM - 2:24PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(167, '2', 'Shibavra 250T', 'Night Shift', -36600, 120, 0, 0, 0, 0, '', '2026-03-13 14:03:18', '1', '2:25PM - 2:26PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(168, '2', 'Shibavra 250T', 'Night Shift', -36360, 120, 0, 0, 0, 0, '', '2026-03-13 14:03:18', '1', '2:27PM - 2:28PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(169, '2', 'Shibavra 250T', 'Night Shift', -36120, 120, 0, 0, 0, 0, '', '2026-03-13 14:03:18', '1', '2:29PM - 2:30PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(170, '2', 'Shibavra 250T', 'Night Shift', -35880, 120, 0, 0, 0, 0, '', '2026-03-13 14:03:19', '1', '2:31PM - 2:32PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(171, '2', 'Shibavra 250T', 'Night Shift', -35640, 120, 0, 0, 0, 0, '', '2026-03-13 14:03:19', '1', '2:33PM - 2:34PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(172, '3', 'Shibavra 250T', 'Night Shift', -39480, -39480, 0, 0, 0, 0, '', '2026-03-13 14:03:23', '1', '2:01PM - 2:02PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(173, '3', 'Shibavra 250T', 'Night Shift', -39240, 120, 0, 0, 0, 0, '', '2026-03-13 14:03:24', '1', '2:03PM - 2:04PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(174, '3', 'Shibavra 250T', 'Night Shift', -39000, 120, 0, 0, 0, 0, '', '2026-03-13 14:03:24', '1', '2:05PM - 2:06PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(175, '3', 'Shibavra 250T', 'Night Shift', -38760, 120, 0, 0, 0, 0, '', '2026-03-13 14:03:24', '1', '2:07PM - 2:08PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(176, '3', 'Shibavra 250T', 'Night Shift', -38520, 120, 0, 0, 0, 0, '', '2026-03-13 14:03:25', '1', '2:09PM - 2:10PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(177, '3', 'Shibavra 250T', 'Night Shift', -38280, 120, 0, 0, 0, 0, '', '2026-03-13 14:03:25', '1', '2:11PM - 2:12PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(178, '3', 'Shibavra 250T', 'Night Shift', -38040, 120, 0, 0, 0, 0, '', '2026-03-13 14:03:25', '1', '2:13PM - 2:14PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(179, '4', 'Shibavra 180T', 'Day Shift', -19740, -19740, 0, 0, 0, 0, '', '2026-03-13 14:03:29', '1', '2:01PM - 2:02PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(180, '4', 'Shibavra 180T', 'Day Shift', -19620, 60, 0, 0, 0, 0, '', '2026-03-13 14:03:30', '1', '2:03PM - 2:04PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(181, '4', 'Shibavra 180T', 'Day Shift', -19500, 60, 0, 0, 0, 0, '', '2026-03-13 14:03:30', '1', '2:05PM - 2:06PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(182, '4', 'Shibavra 180T', 'Day Shift', -19380, 60, 0, 0, 0, 0, '', '2026-03-13 14:03:30', '1', '2:07PM - 2:08PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(183, '1', 'Shibavra 250T', 'Day Shift', -37080, 60, 0, 0, 0, 0, '', '2026-03-13 14:04:05', '1', '9:12AM - 9:13AM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(184, '1', 'Shibavra 250T', 'Day Shift', -36960, 60, 0, 0, 0, 0, '', '2026-03-13 14:04:07', '1', '9:14AM - 9:15AM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(185, '1', 'Shibavra 250T', 'Day Shift', -36840, 60, 0, 0, 0, 0, '', '2026-03-13 14:04:07', '1', '9:16AM - 9:17AM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(186, '1', 'Shibavra 250T', 'Day Shift', -36720, 60, 0, 0, 0, 0, '', '2026-03-13 14:04:07', '1', '9:18AM - 9:19AM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(187, '1', 'Shibavra 250T', 'Day Shift', -36600, 60, 0, 0, 0, 0, '', '2026-03-13 14:04:08', '1', '9:20AM - 9:21AM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(188, '1', 'Shibavra 250T', 'Day Shift', -36480, 60, 0, 0, 0, 0, '', '2026-03-13 14:04:08', '1', '9:22AM - 9:23AM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(189, '1', 'Shibavra 250T', 'Day Shift', -36360, 60, 0, 0, 0, 0, '', '2026-03-13 14:04:09', '1', '9:24AM - 9:25AM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(190, '1', 'Shibavra 250T', 'Day Shift', -36240, 60, 0, 0, 0, 0, '', '2026-03-13 14:04:10', '1', '9:26AM - 9:27AM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(191, '1', 'Shibavra 250T', 'Day Shift', -36120, 60, 0, 0, 0, 0, '', '2026-03-13 14:04:10', '1', '9:28AM - 9:29AM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(192, '1', 'Shibavra 250T', 'Day Shift', -36000, 60, 0, 0, 0, 0, '', '2026-03-13 14:04:10', '1', '9:30AM - 9:31AM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(193, '1', 'Shibavra 250T', 'Day Shift', -35880, 60, 0, 0, 0, 0, '', '2026-03-13 14:04:10', '1', '9:32AM - 9:33AM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(194, '1', 'Shibavra 250T', 'Day Shift', -35760, 60, 0, 0, 0, 0, '', '2026-03-13 14:04:11', '1', '9:34AM - 9:35AM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(195, '1', 'Shibavra 250T', 'Day Shift', -35640, 60, 0, 0, 0, 0, '', '2026-03-13 14:04:11', '1', '9:36AM - 9:37AM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(196, '1', 'Shibavra 250T', 'Day Shift', -35520, 60, 0, 0, 0, 0, '', '2026-03-13 14:04:11', '1', '9:38AM - 9:39AM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(197, '1', 'Shibavra 250T', 'Day Shift', -35400, 60, 0, 0, 0, 0, '', '2026-03-13 14:04:12', '1', '9:40AM - 9:41AM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(198, '1', 'Shibavra 250T', 'Day Shift', -35280, 60, 0, 0, 0, 0, '', '2026-03-13 14:04:12', '1', '9:42AM - 9:43AM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(199, '1', 'Shibavra 250T', 'Day Shift', -35160, 60, 0, 0, 0, 0, '', '2026-03-13 14:04:15', '1', '9:44AM - 9:45AM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(200, '1', 'Shibavra 250T', 'Day Shift', -35040, 60, 0, 0, 0, 0, '', '2026-03-13 14:04:15', '1', '9:46AM - 9:47AM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(201, '1', 'Shibavra 250T', 'Night Shift', -19620, 60, 0, 0, 0, 0, '', '2026-03-13 14:19:34', '1', '2:20PM - 2:21PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(202, '1', 'Shibavra 250T', 'Night Shift', -19500, 60, 0, 0, 0, 0, '', '2026-03-13 14:19:35', '1', '2:22PM - 2:23PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(203, '1', 'Shibavra 250T', 'Night Shift', -19380, 60, 0, 0, 0, 0, '', '2026-03-13 14:19:35', '1', '2:24PM - 2:25PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(204, '2', 'Shibavra 250T', 'Night Shift', -39360, 120, 0, 0, 0, 0, '', '2026-03-13 14:20:08', '1', '2:19PM - 2:20PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(205, '2', 'Shibavra 250T', 'Night Shift', -39120, 120, 0, 0, 0, 0, '', '2026-03-13 14:20:09', '1', '2:21PM - 2:22PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(206, '2', 'Shibavra 250T', 'Night Shift', -38880, 120, 0, 0, 0, 0, '', '2026-03-13 14:20:09', '1', '2:23PM - 2:24PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(207, '2', 'Shibavra 250T', 'Night Shift', -38640, 120, 0, 0, 0, 0, '', '2026-03-13 14:20:10', '1', '2:25PM - 2:26PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(208, '2', 'Shibavra 250T', 'Night Shift', -38400, 120, 0, 0, 0, 0, '', '2026-03-13 14:20:10', '1', '2:27PM - 2:28PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(209, '2', 'Shibavra 250T', 'Night Shift', -38160, 120, 0, 0, 0, 0, '', '2026-03-13 14:20:11', '1', '2:29PM - 2:30PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(210, '2', 'Shibavra 250T', 'Night Shift', -37920, 120, 0, 0, 0, 0, '', '2026-03-13 14:20:11', '1', '2:31PM - 2:32PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(211, '3', 'Shibavra 250T', 'Night Shift', 120, 120, 0, 0, 0, 0, '', '2026-03-13 14:20:18', '1', '7:49PM - 7:50PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(212, '1', 'Shibavra 250T', 'Night Shift', 120, 60, 0, 0, 0, 0, '', '2026-03-13 14:20:49', '1', '7:49PM - 7:50PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(213, '2', 'Shibavra 250T', 'Night Shift', 240, 120, 0, 0, 0, 0, '', '2026-03-13 14:21:14', '1', '7:49PM - 7:50PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(214, '3', 'Shibavra 250T', 'Night Shift', 120, 0, 0, 0, 0, 0, '', '2026-03-13 14:21:23', '1', '7:49PM - 7:50PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(215, '1', 'Shibavra 250T', 'Night Shift', 120, 60, 0, 0, 0, 0, '', '2026-03-13 14:21:52', '1', '7:49PM - 7:50PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(216, '1', 'Shibavra 250T', 'Night Shift', 60, 0, 0, 0, 0, 0, '', '2026-03-13 14:21:59', '1', '7:48PM - 7:49PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(217, '1', 'Shibavra 250T', 'Night Shift', 180, 60, 0, 0, 0, 0, '', '2026-03-13 14:22:01', '1', '7:50PM - 7:51PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(218, '3', 'Shibavra 250T', 'Night Shift', 120, 0, 0, 0, 0, 0, '', '2026-03-13 14:22:06', '1', '7:49PM - 7:50PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(219, '3', 'Shibavra 250T', 'Night Shift', 360, 120, 0, 0, 0, 0, '', '2026-03-13 14:22:16', '1', '7:51PM - 7:52PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(220, '1', 'Shibavra 250T', 'Night Shift', 60, 0, 0, 0, 0, 0, '', '2026-03-13 14:23:19', '1', '7:48PM - 7:49PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(221, '1', 'Shibavra 250T', 'Night Shift', 180, 60, 0, 0, 0, 0, '', '2026-03-13 14:23:23', '1', '7:50PM - 7:51PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(222, '2', 'Shibavra 250T', 'Night Shift', 120, 0, 0, 0, 0, 0, '', '2026-03-13 14:23:41', '1', '7:48PM - 7:49PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(223, '2', 'Shibavra 250T', 'Night Shift', 360, 120, 0, 0, 0, 0, '', '2026-03-13 14:23:44', '1', '7:50PM - 7:51PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(224, '3', 'Shibavra 250T', 'Night Shift', 120, 0, 0, 0, 0, 0, '', '2026-03-13 14:24:18', '1', '7:49PM - 7:50PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(225, '3', 'Shibavra 250T', 'Night Shift', 360, 120, 0, 0, 0, 0, '', '2026-03-13 14:24:25', '1', '7:51PM - 7:52PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(226, '3', 'Shibavra 250T', 'Night Shift', 600, 120, 0, 0, 0, 0, '', '2026-03-13 14:24:27', '1', '7:53PM - 7:54PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(227, '3', 'Shibavra 250T', 'Night Shift', 120, 0, 0, 0, 0, 0, '', '2026-03-13 14:24:34', '1', '7:49PM - 7:50PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(228, '3', 'Shibavra 250T', 'Night Shift', 360, 120, 0, 0, 0, 0, '', '2026-03-13 14:24:39', '1', '7:51PM - 7:52PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(229, '3', 'Shibavra 250T', 'Night Shift', 600, 120, 0, 0, 0, 0, '', '2026-03-13 14:24:42', '1', '7:53PM - 7:54PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(230, '1', 'Shibavra 250T', 'Night Shift', 60, 0, 0, 0, 0, 0, '', '2026-03-13 14:24:47', '1', '7:48PM - 7:49PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(231, '1', 'Shibavra 250T', 'Night Shift', 180, 60, 0, 0, 0, 0, '', '2026-03-13 14:24:48', '1', '7:50PM - 7:51PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(232, '1', 'Shibavra 250T', 'Night Shift', 300, 60, 0, 0, 0, 0, '', '2026-03-13 14:24:49', '1', '7:52PM - 7:53PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(233, '1', 'Shibavra 250T', 'Night Shift', 60, 0, 0, 0, 0, 0, '', '2026-03-13 14:25:37', '1', '7:48PM - 7:49PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(234, '1', 'Shibavra 250T', 'Night Shift', 180, 60, 0, 0, 0, 0, '', '2026-03-13 14:25:38', '1', '7:50PM - 7:51PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(235, '1', 'Shibavra 250T', 'Night Shift', 300, 60, 0, 0, 0, 0, '', '2026-03-13 14:25:39', '1', '7:52PM - 7:53PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(236, '1', 'Shibavra 250T', 'Night Shift', 420, 60, 0, 0, 0, 0, '', '2026-03-13 14:25:46', '1', '7:54PM - 7:55PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(237, '3', 'Shibavra 250T', 'Night Shift', 120, 0, 0, 0, 0, 0, '', '2026-03-13 14:25:50', '1', '7:49PM - 7:50PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(238, '3', 'Shibavra 250T', 'Night Shift', 360, 120, 0, 0, 0, 0, '', '2026-03-13 14:25:51', '1', '7:51PM - 7:52PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(239, '3', 'Shibavra 250T', 'Night Shift', 600, 120, 0, 0, 0, 0, '', '2026-03-13 14:25:52', '1', '7:53PM - 7:54PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(240, '2', 'Shibavra 250T', 'Night Shift', 120, 0, 0, 0, 0, 0, '', '2026-03-13 14:25:58', '1', '7:48PM - 7:49PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(241, '2', 'Shibavra 250T', 'Night Shift', 360, 120, 0, 0, 0, 0, '', '2026-03-13 14:25:59', '1', '7:50PM - 7:51PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(242, '2', 'Shibavra 250T', 'Night Shift', 600, 120, 0, 0, 0, 0, '', '2026-03-13 14:26:00', '1', '7:52PM - 7:53PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(243, '2', 'Shibavra 250T', 'Night Shift', 840, 120, 0, 0, 0, 0, '', '2026-03-13 14:26:01', '1', '7:54PM - 7:55PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(244, '1', 'Shibavra 250T', 'Night Shift', 60, 0, 0, 0, 0, 0, '', '2026-03-13 14:26:06', '1', '7:48PM - 7:49PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(245, '1', 'Shibavra 250T', 'Night Shift', 180, 60, 0, 0, 0, 0, '', '2026-03-13 14:26:06', '1', '7:50PM - 7:51PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(246, '1', 'Shibavra 250T', 'Night Shift', 300, 60, 0, 0, 0, 0, '', '2026-03-13 14:26:06', '1', '7:52PM - 7:53PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(247, '1', 'Shibavra 250T', 'Night Shift', 420, 60, 0, 0, 0, 0, '', '2026-03-13 14:26:07', '1', '7:54PM - 7:55PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(248, '3', 'Shibavra 250T', 'Night Shift', 120, 0, 0, 0, 0, 0, '', '2026-03-13 14:26:27', '1', '7:49PM - 7:50PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(249, '3', 'Shibavra 250T', 'Night Shift', 360, 120, 0, 0, 0, 0, '', '2026-03-13 14:26:30', '1', '7:51PM - 7:52PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(250, '3', 'Shibavra 250T', 'Night Shift', 600, 120, 0, 0, 0, 0, '', '2026-03-13 14:26:32', '1', '7:53PM - 7:54PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(251, '3', 'Shibavra 250T', 'Night Shift', 840, 120, 0, 0, 0, 0, '', '2026-03-13 14:26:33', '1', '7:55PM - 7:56PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(252, '3', 'Shibavra 250T', 'Night Shift', 120, 0, 0, 0, 0, 0, '', '2026-03-13 14:26:38', '1', '7:49PM - 7:50PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(253, '3', 'Shibavra 250T', 'Night Shift', 360, 120, 0, 0, 0, 0, '', '2026-03-13 14:26:39', '1', '7:51PM - 7:52PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(254, '3', 'Shibavra 250T', 'Night Shift', 600, 120, 0, 0, 0, 0, '', '2026-03-13 14:26:41', '1', '7:53PM - 7:54PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(255, '3', 'Shibavra 250T', 'Night Shift', 840, 120, 0, 0, 0, 0, '', '2026-03-13 14:26:42', '1', '7:55PM - 7:56PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(256, '1', 'Shibavra 250T', 'Night Shift', 480, 60, 0, 0, 0, 0, '', '2026-03-13 14:27:18', '1', '7:55PM - 7:56PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(257, '1', 'Shibavra 250T', 'Night Shift', 60, 0, 0, 0, 0, 0, '', '2026-03-13 14:27:21', '1', '7:48PM - 7:49PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(258, '1', 'Shibavra 250T', 'Night Shift', 180, 60, 0, 0, 0, 0, '', '2026-03-13 14:27:22', '1', '7:50PM - 7:51PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(259, '1', 'Shibavra 250T', 'Night Shift', 300, 60, 0, 0, 0, 0, '', '2026-03-13 14:27:24', '1', '7:52PM - 7:53PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(260, '1', 'Shibavra 250T', 'Night Shift', 480, 60, 0, 0, 0, 0, '', '2026-03-13 14:27:28', '1', '7:55PM - 7:56PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(261, '2', 'Shibavra 250T', 'Night Shift', 960, 120, 0, 0, 0, 0, '', '2026-03-13 14:27:36', '1', '7:55PM - 7:56PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(262, '3', 'Shibavra 250T', 'Night Shift', 960, 240, 0, 0, 0, 0, '', '2026-03-13 14:27:44', '1', '7:56PM - 7:57PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(263, '3', 'Shibavra 250T', 'Night Shift', 120, 0, 0, 0, 0, 0, '', '2026-03-13 14:27:46', '1', '7:49PM - 7:50PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(264, '3', 'Shibavra 250T', 'Night Shift', 360, 120, 0, 0, 0, 0, '', '2026-03-13 14:27:47', '1', '7:51PM - 7:52PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(265, '3', 'Shibavra 250T', 'Night Shift', 600, 120, 0, 0, 0, 0, '', '2026-03-13 14:27:48', '1', '7:53PM - 7:54PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(266, '3', 'Shibavra 250T', 'Night Shift', 840, 120, 0, 0, 0, 0, '', '2026-03-13 14:27:50', '1', '7:55PM - 7:56PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(267, '1', 'Shibavra 250T', 'Night Shift', 60, 0, 0, 0, 0, 0, '', '2026-03-13 14:29:41', '1', '7:48PM - 7:49PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(268, '1', 'Shibavra 250T', 'Night Shift', 180, 60, 0, 0, 0, 0, '', '2026-03-13 14:29:41', '1', '7:50PM - 7:51PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(269, '1', 'Shibavra 250T', 'Night Shift', 300, 60, 0, 0, 0, 0, '', '2026-03-13 14:29:42', '1', '7:52PM - 7:53PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(270, '1', 'Shibavra 250T', 'Night Shift', 420, 60, 0, 0, 0, 0, '', '2026-03-13 14:29:43', '1', '7:54PM - 7:55PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(271, '1', 'Shibavra 250T', 'Night Shift', 540, 60, 0, 0, 0, 0, '', '2026-03-13 14:29:44', '1', '7:56PM - 7:57PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(272, '1', 'Shibavra 250T', 'Night Shift', 660, 60, 0, 0, 0, 0, '', '2026-03-13 14:29:45', '1', '7:58PM - 7:59PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(273, '2', 'Shibavra 250T', 'Night Shift', 120, 0, 0, 0, 0, 0, '', '2026-03-13 14:31:31', '1', '7:48PM - 7:49PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(274, '2', 'Shibavra 250T', 'Night Shift', 360, 120, 0, 0, 0, 0, '', '2026-03-13 14:31:33', '1', '7:50PM - 7:51PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(275, '2', 'Shibavra 250T', 'Night Shift', 600, 120, 0, 0, 0, 0, '', '2026-03-13 14:31:34', '1', '7:52PM - 7:53PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(276, '2', 'Shibavra 250T', 'Night Shift', 840, 120, 0, 0, 0, 0, '', '2026-03-13 14:31:35', '1', '7:54PM - 7:55PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(277, '2', 'Shibavra 250T', 'Night Shift', 1080, 120, 0, 0, 0, 0, '', '2026-03-13 14:31:36', '1', '7:56PM - 7:57PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(278, '2', 'Shibavra 250T', 'Night Shift', 1320, 120, 0, 0, 0, 0, '', '2026-03-13 14:31:37', '1', '7:58PM - 7:59PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(279, '1', 'Shibavra 250T', 'Night Shift', 60, 0, 0, 0, 0, 0, '', '2026-03-13 14:31:46', '1', '7:48PM - 7:49PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(280, '1', 'Shibavra 250T', 'Night Shift', 180, 60, 0, 0, 0, 0, '', '2026-03-13 14:31:46', '1', '7:50PM - 7:51PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(281, '1', 'Shibavra 250T', 'Night Shift', 300, 60, 0, 0, 0, 0, '', '2026-03-13 14:31:47', '1', '7:52PM - 7:53PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(282, '1', 'Shibavra 250T', 'Night Shift', 420, 60, 0, 0, 0, 0, '', '2026-03-13 14:31:47', '1', '7:54PM - 7:55PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(283, '1', 'Shibavra 250T', 'Night Shift', 540, 60, 0, 0, 0, 0, '', '2026-03-13 14:31:48', '1', '7:56PM - 7:57PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(284, '1', 'Shibavra 250T', 'Night Shift', 660, 60, 0, 0, 0, 0, '', '2026-03-13 14:31:48', '1', '7:58PM - 7:59PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(285, '1', 'Shibavra 250T', 'Night Shift', 780, 60, 0, 0, 0, 0, '', '2026-03-13 14:31:49', '1', '8:00PM - 8:01PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(286, '1', 'Shibavra 250T', 'Night Shift', 660, 180, 0, 0, 0, 0, '', '2026-03-13 14:34:12', '1', '7:58PM - 7:59PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(287, '3', 'Shibavra 250T', 'Night Shift', 120, 0, 0, 0, 0, 0, '', '2026-03-13 14:34:15', '1', '7:49PM - 7:50PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(288, '1', 'Shibavra 250T', 'Day Shift', 60, 60, 0, 0, 0, 0, '', '2026-03-13 14:44:00', '1', '8:12PM - 8:13PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(289, '2', 'Shibavra 250T', 'Night Shift', 120, 120, 0, 0, 0, 0, '', '2026-03-13 14:44:10', '1', '8:13PM - 8:14PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL);
INSERT INTO `hourly_production_logs` (`id`, `machine_id`, `machine_name`, `shift`, `total_output`, `hourly_output`, `chiller_check`, `compressor_check`, `mould_check`, `machine_check`, `remarks`, `timestamp`, `operator_id`, `hour_range`, `status`, `total_count_at_end`, `down_time`, `down_reason`, `semi_finished_product`, `production_date`, `hour_slot_from`, `hour_slot_to`, `good_parts`, `rejects`, `submitted_at`, `is_missed`, `is_edited_by_head`, `edited_by`, `edited_at`) VALUES
(290, '3', 'Shibavra 250T', 'Day Shift', 120, 120, 0, 0, 0, 0, '', '2026-03-13 14:44:20', '1', '8:13PM - 8:14PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(291, '1', 'Shibavra 250T', 'Day Shift', 60, 0, 0, 0, 0, 0, '', '2026-03-13 14:44:27', '1', '8:12PM - 8:13PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(292, '1', 'Shibavra 250T', 'Day Shift', 60, 0, 0, 0, 0, 0, '', '2026-03-13 14:47:31', '1', '8:12PM - 8:13PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(293, '1', 'Shibavra 250T', 'Day Shift', 180, 60, 0, 0, 0, 0, '', '2026-03-13 14:47:32', '1', '8:14PM - 8:15PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(294, '2', 'Shibavra 250T', 'Night Shift', 120, 0, 0, 0, 0, 0, '', '2026-03-13 14:47:36', '1', '8:13PM - 8:14PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(295, '2', 'Shibavra 250T', 'Night Shift', 360, 120, 0, 0, 0, 0, '', '2026-03-13 14:48:28', '1', '8:15PM - 8:16PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(296, '2', 'Shibavra 250T', 'Night Shift', 600, 120, 0, 0, 0, 0, '', '2026-03-13 14:48:29', '1', '8:17PM - 8:18PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(297, '1', 'Shibavra 250T', 'Day Shift', 120, 60, 0, 0, 0, 0, '', '2026-03-13 14:58:02', '1', '8:13PM - 8:14PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(298, '1', 'Shibavra 250T', 'Day Shift', 942, 60, 0, 0, 0, 0, '', '2026-03-13 14:58:46', '1', '8:27PM - 8:28PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(299, '1', 'Shibavra 250T', 'Day Shift', 952, 60, 0, 0, 0, 0, '', '2026-03-13 14:58:53', '1', '8:27PM - 8:28PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(300, '4', 'Shibavra 180T', 'Night Shift', 920, 60, 0, 0, 0, 0, '', '2026-03-13 14:59:00', '1', '8:27PM - 8:28PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(301, '1', 'Shibavra 250T', 'Day Shift', 964, 60, 0, 0, 0, 0, '', '2026-03-13 14:59:05', '1', '8:28PM - 8:29PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(302, '2', 'Shibavra 250T', 'Night Shift', 1916, 120, 0, 0, 0, 0, '', '2026-03-13 14:59:11', '1', '8:28PM - 8:29PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(303, '1', 'Shibavra 250T', 'Day Shift', 976, 60, 0, 0, 0, 0, '', '2026-03-13 14:59:17', '1', '8:28PM - 8:29PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(304, '2', 'Shibavra 250T', 'Night Shift', 1940, 120, 0, 0, 0, 0, '', '2026-03-13 14:59:22', '1', '8:28PM - 8:29PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(305, '4', 'Shibavra 180T', 'Night Shift', 948, 60, 0, 0, 0, 0, '', '2026-03-13 14:59:27', '1', '8:28PM - 8:29PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(306, '1', 'Shibavra 250T', 'Day Shift', 1826, 60, 0, 0, 0, 0, '', '2026-03-13 15:13:27', '1', '8:42PM - 8:43PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(307, '2', 'Shibavra 250T', 'Night Shift', 3656, 120, 0, 0, 0, 0, '', '2026-03-13 15:13:42', '1', '8:42PM - 8:43PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(308, '4', 'Shibavra 180T', 'Night Shift', 1808, 60, 0, 0, 0, 0, '', '2026-03-13 15:13:49', '1', '8:42PM - 8:43PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(309, '4', 'Shibavra 180T', 'Night Shift', 1824, 60, 0, 0, 0, 0, '', '2026-03-13 15:14:03', '1', '8:43PM - 8:44PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(310, '1', 'Shibavra 250T', 'Day Shift', 1876, 60, 0, 0, 0, 0, '', '2026-03-13 15:14:17', '1', '8:43PM - 8:44PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(311, '1', 'Shibavra 250T', 'Day Shift', 62998, 60, 0, 0, 0, 0, '', '2026-03-14 08:12:59', '1', '1:41PM - 1:42PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(312, '2', 'Shibavra 250T', 'Night Shift', 126008, 120, 0, 0, 0, 0, '', '2026-03-14 08:13:16', '1', '1:42PM - 1:43PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(313, '1', 'Shibavra 250T', 'Night Shift', 120, 120, 0, 0, 0, 0, '', '2026-03-14 09:09:14', '1', '', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(314, '1', 'Shibavra 250T', 'Night Shift', 120, 120, 0, 0, 0, 0, '', '2026-03-14 09:19:31', '1', '', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(315, '1', 'Shibavra 250T', 'Night Shift', 120, 120, 0, 0, 0, 0, '', '2026-03-14 09:23:52', '1', '', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(316, '1', 'Shibavra 250T', 'Night Shift', 120, 120, 0, 0, 0, 0, '', '2026-03-14 09:29:16', '1', '', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(317, '1', 'Shibavra 250T', 'Day Shift', 38, 38, 0, 0, 0, 0, '', '2026-03-14 09:32:00', '1', '3:01 PM - 3:02 PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(318, '1', 'Shibavra 250T', 'Day Shift', 40, 40, 0, 0, 0, 0, '', '2026-03-14 09:34:00', '1', '3:03 PM - 3:04 PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(319, '1', 'Shibavra 250T', 'Day Shift', 100, 60, 0, 0, 0, 0, '', '2026-03-14 09:35:00', '1', '3:04 PM - 3:05 PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(320, '1', 'Shibavra 250T', 'Day Shift', 160, 60, 0, 0, 0, 0, '', '2026-03-14 09:36:00', '1', '3:05 PM - 3:06 PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(321, '1', 'Shibavra 250T', 'Day Shift', 60, 60, 0, 0, 0, 0, '', '2026-03-14 09:37:37', '1', '3:06 PM - 3:07 PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(322, '1', 'Shibavra 250T', 'Night Shift', 60, 0, 0, 0, 0, 0, '', '2026-03-14 09:39:01', '1', '3:08 PM - 3:09 PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(323, '1', 'Shibavra 250T', 'Night Shift', 120, 60, 0, 0, 0, 0, '', '2026-03-14 09:40:01', '1', '3:09 PM - 3:10 PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(324, '1', 'Shibavra 250T', 'Night Shift', 180, 60, 0, 0, 0, 0, '', '2026-03-14 09:41:01', '1', '3:10 PM - 3:11 PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(325, '1', 'Shibavra 250T', 'Day Shift', 664, 64, 0, 0, 0, 0, '', '2026-03-14 09:45:31', '1', '3:14 PM - 3:15 PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(326, '1', 'Shibavra 250T', 'Night Shift', 724, 60, 0, 0, 0, 0, '', '2026-03-14 09:46:31', '1', '3:15 PM - 3:16 PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(327, '1', 'Shibavra 250T', 'Night Shift', 784, 60, 0, 0, 0, 0, '', '2026-03-14 09:47:31', '1', '3:16 PM - 3:17 PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(328, '1', 'Shibavra 250T', 'Day Shift', 1322, 0, 0, 0, 0, 0, '', '2026-03-14 09:52:01', '2', '3:21 PM - 3:22 PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(329, '1', 'Shibavra 250T', 'Day Shift', 1382, 60, 0, 0, 0, 0, '', '2026-03-14 09:53:01', '2', '3:22 PM - 3:23 PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(330, '1', 'Shibavra 250T', 'Night Shift', 1442, 60, 0, 0, 0, 0, '', '2026-03-14 09:54:01', '2', '3:23 PM - 3:24 PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(331, '1', 'Shibavra 250T', 'Night Shift', 1502, 60, 0, 0, 0, 0, '', '2026-03-14 09:55:01', '2', '3:24 PM - 3:25 PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(332, '1', 'Shibavra 250T', 'Night Shift', 1562, 60, 0, 0, 0, 0, '', '2026-03-14 09:56:01', '1', '3:25 PM - 3:26 PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(333, '1', 'Shibavra 250T', 'Night Shift', 1622, 60, 0, 0, 0, 0, '', '2026-03-14 09:57:01', '2', '3:26 PM - 3:27 PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(334, '1', 'Shibavra 250T', 'Night Shift', 84486, 60, 0, 0, 0, 0, '', '2026-03-14 09:58:01', '1', '3:27 PM - 3:28 PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(335, '1', 'Shibavra 250T', 'Night Shift', 84546, 60, 0, 0, 0, 0, '', '2026-03-14 09:59:01', '1', '3:28 PM - 3:29 PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(336, '1', 'Shibavra 250T', 'Night Shift', 0, 0, 0, 0, 0, 0, '', '2026-03-14 10:00:01', NULL, '3:29 PM - 3:30 PM', 'discarded', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(337, '1', 'Shibavra 250T', 'Night Shift', 0, 0, 0, 0, 0, 0, '', '2026-03-14 10:02:00', NULL, '3:31 PM - 3:32 PM', 'discarded', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(338, '1', 'Shibavra 250T', 'Night Shift', 1862, 60, 0, 0, 0, 0, '', '2026-03-14 10:01:01', '1', '3:30 PM - 3:31 PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(339, '1', 'Shibavra 250T', 'Day Shift', 0, 0, 0, 0, 0, 0, '', '2026-03-14 10:04:23', NULL, '3:33 PM - 3:34 PM', 'discarded', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(340, '1', 'Shibavra 250T', 'Day Shift', 120, 60, 0, 0, 0, 0, '', '2026-03-14 10:05:23', '2', '3:34 PM - 3:35 PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(341, '1', 'Shibavra 250T', 'Day Shift', 0, 0, 0, 0, 0, 0, '', '2026-03-14 10:06:23', NULL, '3:35 PM - 3:36 PM', 'discarded', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(342, '1', 'Shibavra 250T', 'Day Shift', 240, 60, 0, 0, 0, 0, '', '2026-03-14 10:07:23', '1', '3:36 PM - 3:37 PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(343, '1', 'Shibavra 250T', 'Day Shift', 300, 60, 0, 0, 0, 0, '', '2026-03-14 10:08:23', '1', '3:37 PM - 3:38 PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(344, '1', 'Shibavra 250T', 'Day Shift', 360, 60, 0, 0, 0, 0, '', '2026-03-14 10:09:23', '1', '3:38 PM - 3:39 PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(345, '1', 'Shibavra 250T', 'Day Shift', 480, 60, 0, 0, 0, 0, '', '2026-03-14 10:11:23', '1', '3:40 PM - 3:41 PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(346, '1', 'Shibavra 250T', 'Day Shift', 420, 60, 0, 0, 0, 0, '', '2026-03-14 10:10:23', '1', '3:39 PM - 3:40 PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(347, '1', 'Shibavra 250T', 'Day Shift', 60, 60, 0, 0, 0, 0, '', '2026-03-14 10:12:23', '1', '3:41 PM - 3:42 PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(348, '1', 'Shibavra 250T', 'Day Shift', 60, 0, 0, 0, 0, 0, '', '2026-03-14 10:15:17', '1', '3:44 PM - 3:45 PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(349, '1', 'Shibavra 250T', 'Day Shift', 120, 60, 0, 0, 0, 0, '', '2026-03-14 10:16:17', '1', '3:45 PM - 3:46 PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(350, '1', 'Shibavra 250T', 'Day Shift', 180, 60, 0, 0, 0, 0, '', '2026-03-14 10:17:17', '1', '3:46 PM - 3:47 PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(351, '1', 'Shibavra 250T', 'Day Shift', 240, 60, 0, 0, 0, 0, '', '2026-03-14 10:18:17', '1', '3:47 PM - 3:48 PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(352, '1', 'Shibavra 250T', 'Day Shift', 60, 60, 1, 0, 1, 0, '', '2026-03-14 10:19:17', '1', '3:48 PM - 3:49 PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(353, '1', 'Shibavra 250T', 'Day Shift', 120, 18, 0, 0, 0, 0, '', '2026-03-14 10:20:17', '1', '3:49 PM - 3:50 PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(354, '1', 'Shibavra 250T', 'Day Shift', 180, 52, 0, 0, 0, 0, '', '2026-03-14 10:21:17', '1', '3:50 PM - 3:51 PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(355, '1', 'Shibavra 250T', 'Day Shift', 256, 76, 0, 0, 0, 0, '', '2026-03-14 10:22:17', '1', '3:51 PM - 3:52 PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(356, '1', 'Shibavra 250T', 'Day Shift', 300, 44, 0, 0, 0, 0, '', '2026-03-14 10:23:17', '1', '3:52 PM - 3:53 PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(357, '1', 'Shibavra 250T', 'Day Shift', 582, 60, 0, 0, 0, 0, '', '2026-03-14 10:24:00', '1', '3:53 PM - 3:54 PM', 'pending', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(358, '1', 'Shibavra 250T', 'Day Shift', 60, 60, 1, 0, 1, 0, '', '2026-03-14 10:26:00', '1', '3:55 PM - 3:56 PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(359, '1', 'Shibavra 250T', 'Day Shift', 120, 60, 0, 0, 0, 0, '', '2026-03-14 10:27:24', '1', '3:56 PM - 3:57 PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(360, '1', 'Shibavra 250T', 'Day Shift', 120, 60, 0, 0, 0, 0, '', '2026-03-14 10:28:24', '1', '3:57 PM - 3:58 PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(361, '1', 'Shibavra 250T', 'Day Shift', 60, 0, 0, 0, 0, 0, '', '2026-03-14 10:30:53', '1', '3:59 PM - 4:00 PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(362, '1', 'Shibavra 250T', 'Day Shift', 120, 60, 0, 0, 0, 0, '', '2026-03-14 10:31:53', '1', '4:00 PM - 4:01 PM', 'approved', 120, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(363, '1', 'Shibavra 250T', 'Day Shift', 180, 60, 0, 0, 0, 0, '', '2026-03-14 10:32:53', '1', '4:01 PM - 4:02 PM', 'approved', 180, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(364, '1', 'Shibavra 250T', 'Day Shift', 240, 60, 0, 0, 0, 0, '', '2026-03-14 10:33:53', '1', '4:02 PM - 4:03 PM', 'approved', 240, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(365, '1', 'Shibavra 250T', 'Day Shift', 300, 60, 0, 0, 0, 0, '', '2026-03-14 10:34:53', '1', '4:03 PM - 4:04 PM', 'approved', 300, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(366, '1', 'Shibavra 250T', 'Day Shift', 360, 60, 0, 0, 0, 0, '', '2026-03-14 10:35:53', '1', '4:04 PM - 4:05 PM', 'approved', 360, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(367, '1', 'Shibavra 250T', 'Day Shift', 420, 60, 0, 0, 0, 0, '', '2026-03-14 10:36:53', '1', '4:05 PM - 4:06 PM', 'approved', 420, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(368, '1', 'Shibavra 250T', 'Day Shift', 420, 60, 0, 0, 0, 0, '', '2026-03-14 10:37:53', '1', '4:06 PM - 4:07 PM', 'approved', 420, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(369, '1', 'Shibavra 250T', 'Day Shift', 540, 60, 0, 1, 0, 1, '', '2026-03-14 10:38:53', '1', '4:07 PM - 4:08 PM', 'approved', 540, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(370, '1', 'Shibavra 250T', 'Day Shift', 540, 60, 0, 0, 0, 0, '', '2026-03-14 10:39:53', '1', '4:08 PM - 4:09 PM', 'approved', 540, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(371, '1', 'Shibavra 250T', 'Night Shift', 120, 48, 0, 0, 0, 0, '', '2026-03-15 10:13:26', '1', '3:42 PM - 3:43 PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(372, '1', 'Shibavra 250T', 'Day Shift', 60, 60, 0, 1, 0, 1, '', '2026-03-15 10:47:49', '1', '4:16 PM - 4:17 PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(373, '1', 'Shibavra 250T', 'Day Shift', 1140, 60, 0, 0, 0, 0, '', '2026-03-15 10:48:49', '1', '4:17 PM - 4:18 PM', 'approved', 1140, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(374, '1', 'Shibavra 250T', 'Day Shift', 1200, 60, 0, 0, 0, 0, '', '2026-03-15 10:49:49', '1', '4:18 PM - 4:19 PM', 'approved', 1200, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(375, '1', 'Shibavra 250T', 'Night Shift', 360, 180, 0, 0, 0, 0, '', '2026-03-15 10:52:24', '1', '4:21 PM - 4:22 PM', 'approved', 360, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(376, '1', 'Shibavra 250T', 'Night Shift', 1440, 60, 0, 0, 0, 0, '', '2026-03-15 10:53:24', '1', '4:22 PM - 4:23 PM', 'approved', 1440, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(377, '1', 'Shibavra 250T', 'Night Shift', 360, 0, 0, 0, 0, 0, '', '2026-03-15 10:54:24', '1', '4:23 PM - 4:24 PM', 'approved', 360, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(378, '1', 'Shibavra 250T', 'Night Shift', 1560, 60, 0, 0, 0, 0, '', '2026-03-15 10:55:24', '1', '4:24 PM - 4:25 PM', 'approved', 1560, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(379, '1', 'Shibavra 250T', 'Night Shift', 360, 0, 0, 0, 0, 0, '', '2026-03-15 10:56:24', '1', '4:25 PM - 4:26 PM', 'approved', 360, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(380, '1', 'Shibavra 250T', 'Night Shift', 1680, 60, 0, 0, 0, 0, '', '2026-03-15 10:57:24', '1', '4:26 PM - 4:27 PM', 'approved', 1680, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(381, '1', 'Shibavra 250T', 'Day Shift', 1800, 60, 0, 0, 0, 0, '', '2026-03-15 10:59:28', '1', '4:28 PM - 4:29 PM', 'approved', 1800, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(382, '1', 'Shibavra 250T', 'Day Shift', 120, 60, 0, 0, 0, 0, '', '2026-03-15 11:00:28', '1', '4:29 PM - 4:30 PM', 'approved', 120, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(383, '1', 'Shibavra 250T', 'Day Shift', 210, 90, 0, 0, 0, 0, '', '2026-03-15 11:01:28', '1', '4:30 PM - 4:31 PM', 'approved', 210, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(384, '1', 'Shibavra 250T', 'Day Shift', 270, 60, 0, 0, 0, 0, '', '2026-03-15 11:02:28', '1', '4:31 PM - 4:32 PM', 'approved', 270, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(385, '1', 'Shibavra 250T', 'Day Shift', 120, 120, 1, 1, 1, 1, '', '2026-03-15 11:03:28', '1', '4:32 PM - 4:33 PM', 'approved', 120, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(386, '1', 'Shibavra 250T', 'Day Shift', 126, 6, 0, 0, 0, 0, '', '2026-03-15 11:09:05', '1', '4:38 PM - 4:39 PM', 'approved', 126, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(387, '1', 'Shibavra 250T', 'Day Shift', 120, 60, 0, 0, 0, 0, '', '2026-03-15 11:10:05', '1', '4:39 PM - 4:40 PM', 'approved', 120, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(388, '1', 'Shibavra 250T', 'Night Shift', 180, 54, 0, 0, 0, 0, '', '2026-03-15 11:11:05', '1', '4:40 PM - 4:41 PM', 'approved', 180, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(389, '1', 'Shibavra 250T', 'Night Shift', 1200, 120, 0, 0, 0, 0, '', '2026-03-15 11:12:05', '1', '4:41 PM - 4:42 PM', 'pending', 1200, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(390, '1', 'Shibavra 250T', 'Night Shift', 352, 60, 0, 0, 0, 0, '', '2026-03-15 11:13:05', '1', '4:42 PM - 4:43 PM', 'approved', 352, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(391, '1', 'Shibavra 250T', 'Night Shift', 360, 180, 0, 0, 0, 0, '', '2026-03-15 11:14:05', '1', '4:43 PM - 4:44 PM', 'approved', 360, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(392, '1', 'Shibavra 250T', 'Day Shift', 60, 60, 0, 0, 0, 0, '', '2026-03-15 11:18:45', '1', '4:47 PM - 4:48 PM', 'approved', 60, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(393, '1', 'Shibavra 250T', 'Day Shift', 120, 60, 0, 0, 0, 0, '', '2026-03-15 11:19:45', '1', '4:48 PM - 4:49 PM', 'approved', 120, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(394, '1', 'Shibavra 250T', 'Day Shift', 194, 74, 0, 0, 0, 0, '', '2026-03-15 11:20:45', '1', '4:49 PM - 4:50 PM', 'approved', 194, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(395, '1', 'Shibavra 250T', 'Day Shift', 240, 46, 0, 0, 0, 0, '', '2026-03-15 11:21:45', '1', '4:50 PM - 4:51 PM', 'approved', 240, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(396, '1', 'Shibavra 250T', 'Day Shift', 314, 74, 0, 0, 0, 0, '', '2026-03-15 11:22:45', '1', '4:51 PM - 4:52 PM', 'approved', 314, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(397, '1', 'Shibavra 250T', 'Day Shift', 360, 46, 0, 0, 0, 0, '', '2026-03-15 11:23:45', '1', '4:52 PM - 4:53 PM', 'approved', 360, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(398, '1', 'Shibavra 250T', 'Day Shift', 420, 60, 0, 0, 0, 0, '', '2026-03-15 11:24:45', '1', '4:53 PM - 4:54 PM', 'approved', 420, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(399, '1', 'Shibavra 250T', 'Day Shift', 480, 60, 0, 0, 0, 0, '', '2026-03-15 11:25:45', '1', '4:54 PM - 4:55 PM', 'approved', 480, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(400, '1', 'Shibavra 250T', 'Day Shift', 540, 60, 0, 0, 0, 0, '', '2026-03-15 11:26:45', '1', '4:55 PM - 4:56 PM', 'approved', 540, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(401, '1', 'Shibavra 250T', 'Day Shift', 600, 60, 0, 0, 0, 0, '', '2026-03-15 11:27:45', '1', '4:56 PM - 4:57 PM', 'approved', 600, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(402, '1', 'Shibavra 250T', 'Day Shift', 660, 60, 0, 0, 0, 0, '', '2026-03-15 11:28:45', '1', '4:57 PM - 4:58 PM', 'approved', 660, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(403, '1', 'Shibavra 250T', 'Day Shift', 60, 60, 0, 0, 0, 0, '', '2026-03-15 11:31:28', '1', '5:00 PM - 5:01 PM', 'approved', 60, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(404, '1', 'Shibavra 250T', 'Day Shift', 120, 60, 1, 0, 0, 0, '', '2026-03-15 11:32:28', '1', '5:01 PM - 5:02 PM', 'approved', 120, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(405, '1', 'Shibavra 250T', 'Day Shift', 180, 60, 0, 0, 0, 0, '', '2026-03-15 11:33:28', '1', '5:02 PM - 5:03 PM', 'approved', 180, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(406, '1', 'Shibavra 250T', 'Day Shift', 240, 60, 0, 1, 0, 1, '', '2026-03-15 11:34:28', '1', '5:03 PM - 5:04 PM', 'approved', 240, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(407, '1', 'Shibavra 250T', 'Day Shift', 300, 60, 0, 0, 0, 0, '', '2026-03-15 11:35:28', '1', '5:04 PM - 5:05 PM', 'approved', 300, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(408, '1', 'Shibavra 250T', 'Day Shift', 240, 240, 1, 1, 1, 1, '', '2026-03-15 11:36:28', '1', '5:05 PM - 5:06 PM', 'approved', 240, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(409, '1', 'Shibavra 250T', 'Day Shift', 420, 60, 0, 0, 0, 0, '', '2026-03-15 11:37:28', '1', '5:06 PM - 5:07 PM', 'approved', 420, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(410, '1', 'Shibavra 250T', 'Day Shift', 720, 240, 1, 1, 1, 1, '', '2026-03-15 11:38:28', '1', '5:07 PM - 5:08 PM', 'approved', 720, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(411, '1', 'Shibavra 250T', 'Day Shift', 540, 60, 0, 0, 0, 0, '', '2026-03-15 11:39:28', '1', '5:08 PM - 5:09 PM', 'approved', 540, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(412, '1', 'Shibavra 250T', 'Day Shift', 1200, 240, 1, 1, 1, 1, '', '2026-03-15 11:40:28', '1', '5:09 PM - 5:10 PM', 'approved', 1200, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(413, '1', 'Shibavra 250T', 'Day Shift', 1440, 240, 1, 1, 1, 1, '', '2026-03-15 11:41:28', '1', '5:10 PM - 5:11 PM', 'approved', 1440, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(414, '1', 'Shibavra 250T', 'Day Shift', 1936, 196, 1, 1, 1, 1, '', '2026-03-15 11:42:28', '1', '5:11 PM - 5:12 PM', 'approved', 1936, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(415, '1', 'Shibavra 250T', 'Day Shift', 1936, 196, 0, 0, 0, 0, '', '2026-03-15 11:43:28', '1', '5:12 PM - 5:13 PM', 'approved', 1936, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(416, '1', 'Shibavra 250T', 'Day Shift', 840, 60, 0, 0, 0, 0, '', '2026-03-15 11:44:28', '1', '5:13 PM - 5:14 PM', 'approved', 840, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(417, '1', 'Shibavra 250T', 'Day Shift', 900, 60, 0, 0, 0, 0, '', '2026-03-15 11:45:28', '1', '5:14 PM - 5:15 PM', 'approved', 900, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(418, '1', 'Shibavra 250T', 'Day Shift', 2408, 240, 0, 0, 0, 0, '', '2026-03-15 11:46:28', '1', '5:15 PM - 5:16 PM', 'approved', 2408, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(419, '1', 'Shibavra 250T', 'Day Shift', 1020, 60, 0, 0, 0, 0, '', '2026-03-15 11:47:28', '1', '5:16 PM - 5:17 PM', 'approved', 1020, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(420, '1', 'Shibavra 250T', 'Day Shift', 2888, 240, 0, 0, 0, 0, '', '2026-03-15 11:48:28', '1', '5:17 PM - 5:18 PM', 'approved', 2888, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(421, '1', 'Shibavra 250T', 'Day Shift', 1140, 60, 0, 0, 0, 0, '', '2026-03-15 11:49:28', '1', '5:18 PM - 5:19 PM', 'approved', 1140, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(422, '1', 'Shibavra 250T', 'Day Shift', 3368, 240, 0, 0, 0, 0, '', '2026-03-15 11:50:28', '1', '5:19 PM - 5:20 PM', 'approved', 3368, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(423, '1', 'Shibavra 250T', 'Day Shift', 1260, 60, 0, 0, 0, 0, '', '2026-03-15 11:51:28', '1', '5:20 PM - 5:21 PM', 'approved', 1260, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(424, '1', 'Shibavra 250T', 'Day Shift', 3848, 240, 0, 0, 0, 0, '', '2026-03-15 11:52:28', '1', '5:21 PM - 5:22 PM', 'approved', 3848, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(425, '1', 'Shibavra 250T', 'Day Shift', 1380, 60, 0, 0, 0, 0, '', '2026-03-15 11:53:28', '1', '5:22 PM - 5:23 PM', 'approved', 1380, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(426, '1', 'Shibavra 250T', 'Day Shift', 4328, 240, 0, 0, 0, 0, '', '2026-03-15 11:54:28', '1', '5:23 PM - 5:24 PM', 'approved', 4328, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(427, '1', 'Shibavra 250T', 'Day Shift', 1500, 60, 0, 0, 0, 0, '', '2026-03-15 11:55:28', '1', '5:24 PM - 5:25 PM', 'approved', 1500, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(428, '1', 'Shibavra 250T', 'Day Shift', 1560, 60, 0, 0, 0, 0, '', '2026-03-15 11:56:28', '1', '5:25 PM - 5:26 PM', 'approved', 1560, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(429, '1', 'Shibavra 250T', 'Day Shift', 1620, 60, 0, 0, 0, 0, '', '2026-03-15 11:57:28', '1', '5:26 PM - 5:27 PM', 'approved', 1620, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(430, '1', 'Shibavra 250T', 'Day Shift', 1680, 60, 0, 0, 0, 0, '', '2026-03-15 11:58:28', '1', '5:27 PM - 5:28 PM', 'approved', 1680, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(431, '1', 'Shibavra 250T', 'Day Shift', 1740, 60, 0, 0, 0, 0, '', '2026-03-15 11:59:28', '1', '5:28 PM - 5:29 PM', 'approved', 1740, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(432, '1', 'Shibavra 250T', 'Day Shift', 1800, 60, 0, 0, 0, 0, '', '2026-03-15 12:00:28', '1', '5:29 PM - 5:30 PM', 'approved', 1800, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(433, '1', 'Shibavra 250T', 'Day Shift', 1860, 60, 0, 0, 0, 0, '', '2026-03-15 12:01:28', '1', '5:30 PM - 5:31 PM', 'approved', 1860, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(434, '1', 'Shibavra 250T', 'Day Shift', 1920, 60, 0, 0, 0, 0, '', '2026-03-15 12:02:28', '1', '5:31 PM - 5:32 PM', 'approved', 1920, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(435, '1', 'Shibavra 250T', 'Day Shift', 1980, 60, 0, 0, 0, 0, '', '2026-03-15 12:03:28', '1', '5:32 PM - 5:33 PM', 'approved', 1980, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(436, '1', 'Shibavra 250T', 'Day Shift', 2040, 60, 0, 0, 0, 0, '', '2026-03-15 12:04:28', '1', '5:33 PM - 5:34 PM', 'approved', 2040, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(437, '1', 'Shibavra 250T', 'Day Shift', 2100, 60, 0, 0, 0, 0, '', '2026-03-15 12:05:28', '1', '5:34 PM - 5:35 PM', 'approved', 2100, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(438, '1', 'Shibavra 250T', 'Day Shift', 2160, 60, 0, 0, 0, 0, '', '2026-03-15 12:06:28', '1', '5:35 PM - 5:36 PM', 'approved', 2160, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(439, '1', 'Shibavra 250T', 'Day Shift', 2220, 60, 0, 0, 0, 0, '', '2026-03-15 12:07:28', '1', '5:36 PM - 5:37 PM', 'approved', 2220, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(440, '1', 'Shibavra 250T', 'Day Shift', 2280, 60, 0, 0, 0, 0, '', '2026-03-15 12:08:28', '1', '5:37 PM - 5:38 PM', 'approved', 2280, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(441, '1', 'Shibavra 250T', 'Day Shift', 2340, 60, 0, 0, 0, 0, '', '2026-03-15 12:09:28', '1', '5:38 PM - 5:39 PM', 'approved', 2340, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(442, '1', 'Shibavra 250T', 'Day Shift', 2400, 60, 0, 0, 0, 0, '', '2026-03-15 12:10:28', '1', '5:39 PM - 5:40 PM', 'approved', 2400, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(443, '1', 'Shibavra 250T', 'Day Shift', 2460, 60, 0, 0, 0, 0, '', '2026-03-15 12:11:28', '1', '5:40 PM - 5:41 PM', 'approved', 2460, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(444, '1', 'Shibavra 250T', 'Day Shift', 2520, 60, 0, 0, 0, 0, '', '2026-03-15 12:12:28', '1', '5:41 PM - 5:42 PM', 'approved', 2520, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(445, '1', 'Shibavra 250T', 'Day Shift', 2580, 60, 0, 0, 0, 0, '', '2026-03-15 12:13:28', '1', '5:42 PM - 5:43 PM', 'approved', 2580, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(446, '1', 'Shibavra 250T', 'Day Shift', 2640, 60, 0, 0, 0, 0, '', '2026-03-15 12:14:28', '1', '5:43 PM - 5:44 PM', 'approved', 2640, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(447, '1', 'Shibavra 250T', 'Day Shift', 8760, 120, 0, 0, 0, 0, '', '2026-03-15 12:15:28', '1', '5:44 PM - 5:45 PM', 'pending', 8760, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(448, '1', 'Shibavra 250T', 'Day Shift', 2760, 60, 0, 0, 0, 0, '', '2026-03-15 12:16:28', '1', '5:45 PM - 5:46 PM', 'approved', 2760, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(449, '1', 'Shibavra 250T', 'Day Shift', 9000, 120, 0, 0, 0, 0, '', '2026-03-15 12:17:28', '1', '5:46 PM - 5:47 PM', 'pending', 9000, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(450, '1', 'Shibavra 250T', 'Day Shift', 2880, 60, 0, 0, 0, 0, '', '2026-03-15 12:18:28', '1', '5:47 PM - 5:48 PM', 'approved', 2880, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(451, '1', 'Shibavra 250T', 'Day Shift', 9240, 120, 0, 0, 0, 0, '', '2026-03-15 12:19:28', '1', '5:48 PM - 5:49 PM', 'pending', 9240, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(452, '1', 'Shibavra 250T', 'Day Shift', 9360, 120, 0, 0, 0, 0, '', '2026-03-15 12:20:28', '1', '5:49 PM - 5:50 PM', 'pending', 9360, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(453, '1', 'Shibavra 250T', 'Day Shift', 9480, 120, 0, 0, 0, 0, '', '2026-03-15 12:21:28', '1', '5:50 PM - 5:51 PM', 'pending', 9480, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(454, '1', 'Shibavra 250T', 'Day Shift', 9600, 120, 0, 0, 0, 0, '', '2026-03-15 12:22:28', '1', '5:51 PM - 5:52 PM', 'pending', 9600, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(455, '1', 'Shibavra 250T', 'Day Shift', 9720, 120, 0, 0, 0, 0, '', '2026-03-15 12:23:28', '1', '5:52 PM - 5:53 PM', 'pending', 9720, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(456, '1', 'Shibavra 250T', 'Day Shift', 9840, 120, 0, 0, 0, 0, '', '2026-03-15 12:24:28', '1', '5:53 PM - 5:54 PM', 'pending', 9840, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(457, '1', 'Shibavra 250T', 'Day Shift', 9960, 120, 0, 0, 0, 0, '', '2026-03-15 12:25:28', '1', '5:54 PM - 5:55 PM', 'pending', 9960, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(458, '1', 'Shibavra 250T', 'Day Shift', 10080, 120, 0, 0, 0, 0, '', '2026-03-15 12:26:28', '1', '5:55 PM - 5:56 PM', 'pending', 10080, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(459, '1', 'Shibavra 250T', 'Day Shift', 10200, 120, 0, 0, 0, 0, '', '2026-03-15 12:27:28', '1', '5:56 PM - 5:57 PM', 'pending', 10200, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(460, '1', 'Shibavra 250T', 'Day Shift', 10320, 120, 0, 0, 0, 0, '', '2026-03-15 12:28:28', '1', '5:57 PM - 5:58 PM', 'pending', 10320, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(461, '1', 'Shibavra 250T', 'Day Shift', 10440, 120, 0, 0, 0, 0, '', '2026-03-15 12:29:28', '1', '5:58 PM - 5:59 PM', 'pending', 10440, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(462, '1', 'Shibavra 250T', 'Day Shift', 10560, 120, 0, 0, 0, 0, '', '2026-03-15 12:30:28', '1', '5:59 PM - 6:00 PM', 'pending', 10560, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(463, '1', 'Shibavra 250T', 'Day Shift', 10680, 120, 0, 0, 0, 0, '', '2026-03-15 12:31:28', '1', '6:00 PM - 6:01 PM', 'pending', 10680, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(464, '1', 'Shibavra 250T', 'Day Shift', 10800, 120, 0, 0, 0, 0, '', '2026-03-15 12:32:28', '1', '6:01 PM - 6:02 PM', 'pending', 10800, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(465, '1', 'Shibavra 250T', 'Day Shift', 10920, 120, 0, 0, 0, 0, '', '2026-03-15 12:33:28', '1', '6:02 PM - 6:03 PM', 'pending', 10920, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(466, '1', 'Shibavra 250T', 'Day Shift', 11040, 120, 0, 0, 0, 0, '', '2026-03-15 12:34:28', '1', '6:03 PM - 6:04 PM', 'pending', 11040, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(467, '1', 'Shibavra 250T', 'Day Shift', 11160, 120, 0, 0, 0, 0, '', '2026-03-15 12:35:28', '1', '6:04 PM - 6:05 PM', 'pending', 11160, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(468, '1', 'Shibavra 250T', 'Day Shift', 11280, 120, 0, 0, 0, 0, '', '2026-03-15 12:36:28', '1', '6:05 PM - 6:06 PM', 'pending', 11280, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(469, '1', 'Shibavra 250T', 'Day Shift', 4020, 60, 0, 0, 0, 0, '', '2026-03-15 12:37:28', '1', '6:06 PM - 6:07 PM', 'pending', 4020, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(470, '1', 'Shibavra 250T', 'Day Shift', 4080, 60, 0, 0, 0, 0, '', '2026-03-15 12:38:28', '1', '6:07 PM - 6:08 PM', 'pending', 4080, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(471, '1', 'Shibavra 250T', 'Day Shift', 4140, 60, 0, 0, 0, 0, '', '2026-03-15 12:39:28', '1', '6:08 PM - 6:09 PM', 'pending', 4140, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(472, '1', 'Shibavra 250T', 'Day Shift', 4200, 60, 0, 0, 0, 0, '', '2026-03-15 12:40:28', '1', '6:09 PM - 6:10 PM', 'pending', 4200, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(473, '1', 'Shibavra 250T', 'Day Shift', 4260, 60, 0, 0, 0, 0, '', '2026-03-15 12:41:28', '1', '6:10 PM - 6:11 PM', 'pending', 4260, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(474, '1', 'Shibavra 250T', 'Day Shift', 4320, 60, 0, 0, 0, 0, '', '2026-03-15 12:42:28', '1', '6:11 PM - 6:12 PM', 'pending', 4320, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(475, '1', 'Shibavra 250T', 'Day Shift', 4380, 60, 0, 0, 0, 0, '', '2026-03-15 12:43:28', '1', '6:12 PM - 6:13 PM', 'pending', 4380, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(476, '1', 'Shibavra 250T', 'Day Shift', 4440, 60, 0, 0, 0, 0, '', '2026-03-15 12:44:28', '1', '6:13 PM - 6:14 PM', 'pending', 4440, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(477, '1', 'Shibavra 250T', 'Day Shift', 4500, 60, 0, 0, 0, 0, '', '2026-03-15 12:45:28', '1', '6:14 PM - 6:15 PM', 'pending', 4500, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(478, '1', 'Shibavra 250T', 'Day Shift', 4560, 60, 0, 0, 0, 0, '', '2026-03-15 12:46:28', '1', '6:15 PM - 6:16 PM', 'pending', 4560, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(479, '1', 'Shibavra 250T', 'Day Shift', 4620, 60, 0, 0, 0, 0, '', '2026-03-15 12:47:28', '1', '6:16 PM - 6:17 PM', 'pending', 4620, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(480, '1', 'Shibavra 250T', 'Day Shift', 4680, 60, 0, 0, 0, 0, '', '2026-03-15 12:48:28', '1', '6:17 PM - 6:18 PM', 'pending', 4680, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(481, '1', 'Shibavra 250T', 'Day Shift', 4740, 60, 0, 0, 0, 0, '', '2026-03-15 12:49:28', '1', '6:18 PM - 6:19 PM', 'pending', 4740, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(482, '1', 'Shibavra 250T', 'Day Shift', 4800, 60, 0, 0, 0, 0, '', '2026-03-15 12:50:28', '1', '6:19 PM - 6:20 PM', 'pending', 4800, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(483, '1', 'Shibavra 250T', 'Day Shift', 4860, 60, 0, 0, 0, 0, '', '2026-03-15 12:51:28', '1', '6:20 PM - 6:21 PM', 'pending', 4860, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(484, '1', 'Shibavra 250T', 'Day Shift', 4920, 60, 0, 0, 0, 0, '', '2026-03-15 12:52:28', '1', '6:21 PM - 6:22 PM', 'pending', 4920, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(485, '1', 'Shibavra 250T', 'Day Shift', 4980, 60, 0, 0, 0, 0, '', '2026-03-15 12:53:28', '1', '6:22 PM - 6:23 PM', 'pending', 4980, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(486, '1', 'Shibavra 250T', 'Day Shift', 5040, 60, 0, 0, 0, 0, '', '2026-03-15 12:54:28', '1', '6:23 PM - 6:24 PM', 'pending', 5040, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(487, '1', 'Shibavra 250T', 'Day Shift', 5100, 60, 0, 0, 0, 0, '', '2026-03-15 12:55:28', '1', '6:24 PM - 6:25 PM', 'pending', 5100, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(488, '1', 'Shibavra 250T', 'Day Shift', 5160, 60, 0, 0, 0, 0, '', '2026-03-15 12:56:28', '1', '6:25 PM - 6:26 PM', 'pending', 5160, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(489, '1', 'Shibavra 250T', 'Day Shift', 5220, 60, 0, 0, 0, 0, '', '2026-03-15 12:57:28', '1', '6:26 PM - 6:27 PM', 'pending', 5220, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(490, '1', 'Shibavra 250T', 'Day Shift', 5280, 60, 0, 0, 0, 0, '', '2026-03-15 12:58:28', '1', '6:27 PM - 6:28 PM', 'pending', 5280, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(491, '1', 'Shibavra 250T', 'Day Shift', 5340, 60, 0, 0, 0, 0, '', '2026-03-15 12:59:28', '1', '6:28 PM - 6:29 PM', 'pending', 5340, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(492, '1', 'Shibavra 250T', 'Day Shift', 5400, 60, 0, 0, 0, 0, '', '2026-03-15 13:00:28', '1', '6:29 PM - 6:30 PM', 'pending', 5400, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(493, '1', 'Shibavra 250T', 'Day Shift', 5460, 60, 0, 0, 0, 0, '', '2026-03-15 13:01:28', '1', '6:30 PM - 6:31 PM', 'pending', 5460, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(494, '1', 'Shibavra 250T', 'Day Shift', 5520, 60, 0, 0, 0, 0, '', '2026-03-15 13:02:28', '1', '6:31 PM - 6:32 PM', 'pending', 5520, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(495, '1', 'Shibavra 250T', 'Day Shift', 5580, 60, 0, 0, 0, 0, '', '2026-03-15 13:03:28', '1', '6:32 PM - 6:33 PM', 'pending', 5580, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(496, '1', 'Shibavra 250T', 'Day Shift', 5640, 60, 0, 0, 0, 0, '', '2026-03-15 13:04:28', '1', '6:33 PM - 6:34 PM', 'pending', 5640, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(497, '1', 'Shibavra 250T', 'Day Shift', 5700, 60, 0, 0, 0, 0, '', '2026-03-15 13:05:28', '1', '6:34 PM - 6:35 PM', 'pending', 5700, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(498, '1', 'Shibavra 250T', 'Day Shift', 5760, 60, 0, 0, 0, 0, '', '2026-03-15 13:06:28', '1', '6:35 PM - 6:36 PM', 'pending', 5760, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(499, '1', 'Shibavra 250T', 'Day Shift', 5820, 60, 0, 0, 0, 0, '', '2026-03-15 13:07:28', '1', '6:36 PM - 6:37 PM', 'pending', 5820, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(500, '1', 'Shibavra 250T', 'Day Shift', 5880, 60, 0, 0, 0, 0, '', '2026-03-15 13:08:28', '1', '6:37 PM - 6:38 PM', 'pending', 5880, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(501, '1', 'Shibavra 250T', 'Day Shift', 5940, 60, 0, 0, 0, 0, '', '2026-03-15 13:09:28', '1', '6:38 PM - 6:39 PM', 'pending', 5940, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(502, '1', 'Shibavra 250T', 'Day Shift', 6000, 60, 0, 0, 0, 0, '', '2026-03-15 13:10:28', '1', '6:39 PM - 6:40 PM', 'pending', 6000, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(503, '1', 'Shibavra 250T', 'Day Shift', 6060, 60, 0, 0, 0, 0, '', '2026-03-15 13:11:28', '1', '6:40 PM - 6:41 PM', 'pending', 6060, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(504, '1', 'Shibavra 250T', 'Day Shift', 6120, 60, 0, 0, 0, 0, '', '2026-03-15 13:12:28', '1', '6:41 PM - 6:42 PM', 'pending', 6120, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(505, '1', 'Shibavra 250T', 'Day Shift', 6180, 60, 0, 0, 0, 0, '', '2026-03-15 13:13:28', '1', '6:42 PM - 6:43 PM', 'pending', 6180, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(506, '1', 'Shibavra 250T', 'Day Shift', 6240, 60, 0, 0, 0, 0, '', '2026-03-15 13:14:28', '1', '6:43 PM - 6:44 PM', 'pending', 6240, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(507, '1', 'Shibavra 250T', 'Day Shift', 6300, 60, 0, 0, 0, 0, '', '2026-03-15 13:15:28', '1', '6:44 PM - 6:45 PM', 'pending', 6300, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(508, '1', 'Shibavra 250T', 'Day Shift', 6360, 60, 0, 0, 0, 0, '', '2026-03-15 13:16:28', '1', '6:45 PM - 6:46 PM', 'pending', 6360, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(509, '1', 'Shibavra 250T', 'Day Shift', 6420, 60, 0, 0, 0, 0, '', '2026-03-15 13:17:28', '1', '6:46 PM - 6:47 PM', 'pending', 6420, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(510, '1', 'Shibavra 250T', 'Day Shift', 60, 0, 0, 0, 0, 0, '', '2026-03-15 13:20:13', '1', '6:49 PM - 6:50 PM', 'approved', 60, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(511, '1', 'Shibavra 250T', 'Day Shift', 120, 60, 0, 0, 0, 0, '', '2026-03-15 13:21:13', '1', '6:50 PM - 6:51 PM', 'approved', 120, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(512, '1', 'Shibavra 250T', 'Night Shift', 60, 0, 0, 0, 0, 0, '', '2026-03-15 13:47:28', '1', '7:16 PM - 7:17 PM', 'approved', 60, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(513, '1', 'Shibavra 250T', 'Night Shift', 120, 60, 0, 0, 0, 0, '', '2026-03-15 13:48:28', '1', '7:17 PM - 7:18 PM', 'approved', 120, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(514, '1', 'Shibavra 250T', 'Night Shift', 180, 60, 0, 0, 0, 0, '', '2026-03-15 13:49:28', '1', '7:18 PM - 7:19 PM', 'approved', 180, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(515, '1', 'Shibavra 250T', 'Night Shift', 240, 60, 0, 0, 0, 0, '', '2026-03-15 13:50:28', '1', '7:19 PM - 7:20 PM', 'approved', 240, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(516, '1', 'Shibavra 250T', 'Night Shift', 300, 60, 0, 0, 0, 0, '', '2026-03-15 13:51:28', '1', '7:20 PM - 7:21 PM', 'approved', 300, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(517, '1', 'Shibavra 250T', 'Night Shift', 360, 60, 0, 0, 0, 0, '', '2026-03-15 13:52:28', '1', '7:21 PM - 7:22 PM', 'approved', 360, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(518, '1', 'Shibavra 250T', 'Night Shift', 420, 60, 0, 0, 0, 0, '', '2026-03-15 13:53:28', '1', '7:22 PM - 7:23 PM', 'approved', 420, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(519, '1', 'Shibavra 250T', 'Night Shift', 480, 60, 0, 0, 0, 0, '', '2026-03-15 13:54:28', '1', '7:23 PM - 7:24 PM', 'approved', 480, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(520, '1', 'Shibavra 250T', 'Night Shift', 540, 180, 0, 0, 0, 0, '', '2026-03-15 13:55:28', '1', '7:24 PM - 7:25 PM', 'approved', 540, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(521, '1', 'Shibavra 250T', 'Night Shift', 600, 240, 0, 0, 0, 0, '', '2026-03-15 13:56:28', '1', '7:25 PM - 7:26 PM', 'pending', 600, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(522, '1', 'Shibavra 250T', 'Night Shift', 660, 60, 0, 0, 0, 0, '', '2026-03-15 13:57:28', '1', '7:26 PM - 7:27 PM', 'approved', 660, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(523, '1', 'Shibavra 250T', 'Day Shift', 60, 60, 0, 0, 0, 0, '', '2026-03-15 14:00:12', '1', '7:29 PM - 7:30 PM', 'approved', 60, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(524, '1', 'Shibavra 250T', 'Night Shift', 120, 60, 0, 0, 0, 0, '', '2026-03-15 14:01:12', '1', '7:30 PM - 7:31 PM', 'approved', 120, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(525, '1', 'Shibavra 250T', 'Night Shift', 180, 60, 0, 0, 0, 0, '', '2026-03-15 14:02:12', '1', '7:31 PM - 7:32 PM', 'approved', 180, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(526, '1', 'Shibavra 250T', 'Night Shift', 240, 60, 0, 0, 0, 0, '', '2026-03-15 14:03:12', '1', '7:32 PM - 7:33 PM', 'approved', 240, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(527, '1', 'Shibavra 250T', 'Night Shift', 300, 60, 0, 0, 0, 0, '', '2026-03-15 14:04:12', '1', '7:33 PM - 7:34 PM', 'approved', 300, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(528, '1', 'Shibavra 250T', 'Night Shift', 360, 60, 0, 0, 0, 0, '', '2026-03-15 14:05:12', '1', '7:34 PM - 7:35 PM', 'approved', 360, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(529, '1', 'Shibavra 250T', 'Night Shift', 420, 60, 0, 0, 0, 0, '', '2026-03-15 14:06:12', '1', '7:35 PM - 7:36 PM', 'approved', 420, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(530, '1', 'Shibavra 250T', 'Night Shift', 480, 60, 0, 0, 0, 0, '', '2026-03-15 14:07:12', '1', '7:36 PM - 7:37 PM', 'approved', 480, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(531, '1', 'Shibavra 250T', 'Night Shift', 540, 60, 0, 0, 0, 0, '', '2026-03-15 14:08:12', '1', '7:37 PM - 7:38 PM', 'approved', 540, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(532, '1', 'Shibavra 250T', 'Night Shift', 600, 60, 0, 0, 0, 0, '', '2026-04-22 14:09:12', '1', '7:38 PM - 7:39 PM', 'approved', 600, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(533, '1', 'Shibavra 250T', 'Day Shift', 660, 60, 0, 0, 0, 0, '', '2026-03-16 10:40:54', '1', '4:09 PM - 4:10 PM', 'approved', 660, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(534, '1', 'Shibavra 250T', 'Day Shift', 660, 60, 0, 0, 0, 0, '', '2026-03-16 10:41:54', '1', '4:10 PM - 4:11 PM', 'approved', 660, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(535, '1', 'Shibavra 250T', 'Day Shift', 780, 60, 0, 0, 0, 0, '', '2026-03-16 10:42:54', '1', '4:11 PM - 4:12 PM', 'approved', 780, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(536, '1', 'Shibavra 250T', 'Day Shift', 780, 60, 0, 0, 0, 0, '', '2026-03-16 10:43:54', '1', '4:12 PM - 4:13 PM', 'approved', 780, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(537, '1', 'Shibavra 250T', 'Night Shift', 60, 0, 0, 0, 0, 0, '', '2026-03-17 20:21:24', '1', '1:50 AM - 1:51 AM', 'approved', 60, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(538, '1', 'Shibavra 250T', 'Night Shift', 120, 60, 0, 0, 0, 0, '', '2026-03-17 20:22:24', '1', '1:51 AM - 1:52 AM', 'approved', 120, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(539, '1', 'Shibavra 250T', 'Night Shift', 180, 60, 0, 0, 0, 0, '', '2026-03-17 20:23:24', '1', '1:52 AM - 1:53 AM', 'approved', 180, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL);
INSERT INTO `hourly_production_logs` (`id`, `machine_id`, `machine_name`, `shift`, `total_output`, `hourly_output`, `chiller_check`, `compressor_check`, `mould_check`, `machine_check`, `remarks`, `timestamp`, `operator_id`, `hour_range`, `status`, `total_count_at_end`, `down_time`, `down_reason`, `semi_finished_product`, `production_date`, `hour_slot_from`, `hour_slot_to`, `good_parts`, `rejects`, `submitted_at`, `is_missed`, `is_edited_by_head`, `edited_by`, `edited_at`) VALUES
(540, '1', 'Shibavra 250T', 'Night Shift', 240, 60, 0, 0, 0, 0, '', '2026-03-17 20:24:24', '1', '1:53 AM - 1:54 AM', 'approved', 240, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(541, '1', 'Shibavra 250T', 'Day Shift', 60, 0, 0, 0, 0, 0, '', '2026-03-17 20:25:49', '1', '1:54 AM - 1:55 AM', 'approved', 60, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(542, '1', 'Shibavra 250T', 'Night Shift', 120, 60, 0, 0, 0, 0, '', '2026-03-17 20:26:49', '1', '1:55 AM - 1:56 AM', 'approved', 120, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(543, '1', 'Shibavra 250T', 'Night Shift', 180, 60, 0, 0, 0, 0, '', '2026-03-17 20:27:49', '1', '1:56 AM - 1:57 AM', 'approved', 180, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(544, '1', 'Shibavra 250T', 'Night Shift', 240, 60, 0, 0, 0, 0, '', '2026-03-17 20:28:49', '1', '1:57 AM - 1:58 AM', 'approved', 240, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(545, '1', 'Shibavra 250T', 'Night Shift', 300, 60, 0, 0, 0, 0, '', '2026-03-17 20:29:49', '1', '1:58 AM - 1:59 AM', 'approved', 300, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(546, '1', 'Shibavra 250T', 'Night Shift', 360, 60, 0, 0, 0, 0, '', '2026-03-17 20:30:49', '1', '1:59 AM - 2:00 AM', 'approved', 360, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(547, '1', 'Shibavra 250T', 'Night Shift', 420, 60, 0, 0, 0, 0, '', '2026-03-17 20:31:49', '1', '2:00 AM - 2:01 AM', 'approved', 420, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(548, '1', 'Shibavra 250T', 'Night Shift', 480, 60, 0, 0, 0, 0, '', '2026-03-17 20:32:49', '1', '2:01 AM - 2:02 AM', 'pending', 480, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(549, '1', 'Shibavra 250T', 'Night Shift', 540, 60, 0, 0, 0, 0, '', '2026-03-17 20:33:49', '1', '2:02 AM - 2:03 AM', 'approved', 540, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(550, '1', 'Shibavra 250T', 'Night Shift', 600, 60, 0, 0, 0, 0, '', '2026-03-17 20:34:49', '1', '2:03 AM - 2:04 AM', 'pending', 600, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(551, '1', 'Shibavra 250T', 'Night Shift', 660, 60, 0, 0, 0, 0, '', '2026-03-17 20:35:49', '1', '2:04 AM - 2:05 AM', 'pending', 660, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(552, '1', 'Shibavra 250T', 'Night Shift', 720, 60, 0, 0, 0, 0, '', '2026-03-17 20:36:49', '1', '2:05 AM - 2:06 AM', 'pending', 720, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(553, '1', 'Shibavra 250T', 'Night Shift', 780, 60, 0, 0, 0, 0, '', '2026-03-17 20:37:49', '1', '2:06 AM - 2:07 AM', 'pending', 780, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(554, '1', 'Shibavra 250T', 'Night Shift', 840, 60, 0, 0, 0, 0, '', '2026-03-17 20:38:49', '1', '2:07 AM - 2:08 AM', 'pending', 840, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(555, '1', 'Shibavra 250T', 'Night Shift', 900, 60, 0, 0, 0, 0, '', '2026-03-17 20:39:49', '1', '2:08 AM - 2:09 AM', 'pending', 900, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(556, '1', 'Shibavra 250T', 'Night Shift', 960, 60, 0, 0, 0, 0, '', '2026-03-17 20:40:49', '1', '2:09 AM - 2:10 AM', 'pending', 960, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(557, '1', 'Shibavra 250T', 'Night Shift', 1020, 60, 0, 0, 0, 0, '', '2026-03-17 20:41:49', '1', '2:10 AM - 2:11 AM', 'pending', 1020, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(558, '1', 'Shibavra 250T', 'Night Shift', 1080, 60, 0, 0, 0, 0, '', '2026-03-17 20:42:49', '1', '2:11 AM - 2:12 AM', 'pending', 1080, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(559, '1', 'Shibavra 250T', 'Night Shift', 1140, 60, 0, 0, 0, 0, '', '2026-03-17 20:43:49', '1', '2:12 AM - 2:13 AM', 'pending', 1140, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(560, '1', 'Shibavra 250T', 'Night Shift', 1200, 60, 0, 0, 0, 0, '', '2026-03-17 20:44:49', '1', '2:13 AM - 2:14 AM', 'pending', 1200, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(561, '1', 'Shibavra 250T', 'Night Shift', 1260, 60, 0, 0, 0, 0, '', '2026-03-17 20:45:49', '1', '2:14 AM - 2:15 AM', 'pending', 1260, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(562, '1', 'Shibavra 250T', 'Night Shift', 1320, 60, 0, 0, 0, 0, '', '2026-03-17 20:46:49', '1', '2:15 AM - 2:16 AM', 'pending', 1320, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(563, '1', 'Shibavra 250T', 'Night Shift', 1380, 60, 0, 0, 0, 0, '', '2026-03-17 20:47:49', '1', '2:16 AM - 2:17 AM', 'pending', 1380, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(564, '1', 'Shibavra 250T', 'Night Shift', 1440, 60, 0, 0, 0, 0, '', '2026-03-17 20:48:49', '1', '2:17 AM - 2:18 AM', 'pending', 1440, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(565, '1', 'Shibavra 250T', 'Night Shift', 1500, 60, 0, 0, 0, 0, '', '2026-03-17 20:49:49', '1', '2:18 AM - 2:19 AM', 'pending', 1500, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(566, '1', 'Shibavra 250T', 'Night Shift', 1560, 60, 0, 0, 0, 0, '', '2026-03-17 20:50:49', '1', '2:19 AM - 2:20 AM', 'pending', 1560, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(567, '1', 'Shibavra 250T', 'Night Shift', 1620, 60, 0, 0, 0, 0, '', '2026-03-17 20:51:49', '1', '2:20 AM - 2:21 AM', 'pending', 1620, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(568, '1', 'Shibavra 250T', 'Night Shift', 1680, 60, 0, 0, 0, 0, '', '2026-03-17 20:52:49', '1', '2:21 AM - 2:22 AM', 'pending', 1680, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(569, '1', 'Shibavra 250T', 'Night Shift', 1740, 60, 0, 0, 0, 0, '', '2026-03-17 20:53:49', '1', '2:22 AM - 2:23 AM', 'pending', 1740, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(570, '1', 'Shibavra 250T', 'Night Shift', 1800, 60, 0, 0, 0, 0, '', '2026-03-17 20:54:49', '1', '2:23 AM - 2:24 AM', 'pending', 1800, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(571, '1', 'Shibavra 250T', 'Night Shift', 1860, 60, 0, 0, 0, 0, '', '2026-03-17 20:55:49', '1', '2:24 AM - 2:25 AM', 'pending', 1860, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(572, '1', 'Shibavra 250T', 'Night Shift', 1920, 60, 0, 0, 0, 0, '', '2026-03-17 20:56:49', '1', '2:25 AM - 2:26 AM', 'pending', 1920, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(573, '1', 'Shibavra 250T', 'Night Shift', 1980, 60, 0, 0, 0, 0, '', '2026-03-17 20:57:49', '1', '2:26 AM - 2:27 AM', 'pending', 1980, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(574, '1', 'Shibavra 250T', 'Night Shift', 2040, 60, 0, 0, 0, 0, '', '2026-03-17 20:58:49', '1', '2:27 AM - 2:28 AM', 'pending', 2040, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(575, '1', 'Shibavra 250T', 'Night Shift', 2100, 60, 0, 0, 0, 0, '', '2026-03-17 20:59:49', '1', '2:28 AM - 2:29 AM', 'pending', 2100, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(576, '1', 'Shibavra 250T', 'Night Shift', 2160, 60, 0, 0, 0, 0, '', '2026-03-17 21:00:49', '1', '2:29 AM - 2:30 AM', 'pending', 2160, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(577, '1', 'Shibavra 250T', 'Night Shift', 2220, 60, 0, 0, 0, 0, '', '2026-03-17 21:01:49', '1', '2:30 AM - 2:31 AM', 'pending', 2220, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(578, '1', 'Shibavra 250T', 'Night Shift', 2280, 60, 0, 0, 0, 0, '', '2026-03-17 21:02:49', '1', '2:31 AM - 2:32 AM', 'pending', 2280, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(579, '1', 'Shibavra 250T', 'Night Shift', 2340, 60, 0, 0, 0, 0, '', '2026-03-17 21:03:49', '1', '2:32 AM - 2:33 AM', 'pending', 2340, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(580, '1', 'Shibavra 250T', 'Night Shift', 2400, 60, 0, 0, 0, 0, '', '2026-03-17 21:04:49', '1', '2:33 AM - 2:34 AM', 'pending', 2400, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(581, '1', 'Shibavra 250T', 'Night Shift', 2460, 60, 0, 0, 0, 0, '', '2026-03-17 21:05:49', '1', '2:34 AM - 2:35 AM', 'pending', 2460, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(582, '1', 'Shibavra 250T', 'Night Shift', 2520, 60, 0, 0, 0, 0, '', '2026-03-17 21:06:49', '1', '2:35 AM - 2:36 AM', 'pending', 2520, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(583, '1', 'Shibavra 250T', 'Night Shift', 2580, 60, 0, 0, 0, 0, '', '2026-03-17 21:07:49', '1', '2:36 AM - 2:37 AM', 'pending', 2580, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(584, '1', 'Shibavra 250T', 'Night Shift', 2640, 2100, 0, 0, 0, 0, '', '2026-03-17 21:08:49', '1', '2:37 AM - 2:38 AM', 'pending', 2640, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(585, '1', 'Shibavra 250T', 'Night Shift', 2700, 60, 0, 0, 0, 0, '', '2026-03-17 21:09:49', '1', '2:38 AM - 2:39 AM', 'pending', 2700, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(586, '1', 'Shibavra 250T', 'Night Shift', 2760, 60, 0, 0, 0, 0, '', '2026-03-17 21:10:49', '1', '2:39 AM - 2:40 AM', 'pending', 2760, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(587, '1', 'Shibavra 250T', 'Night Shift', 2820, 60, 0, 0, 0, 0, '', '2026-03-17 21:11:49', '1', '2:40 AM - 2:41 AM', 'pending', 2820, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(588, '1', 'Shibavra 250T', 'Night Shift', 2880, 60, 0, 0, 0, 0, '', '2026-03-17 21:12:49', '1', '2:41 AM - 2:42 AM', 'pending', 2880, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(589, '1', 'Shibavra 250T', 'Night Shift', 2940, 60, 0, 0, 0, 0, '', '2026-03-17 21:13:49', '1', '2:42 AM - 2:43 AM', 'pending', 2940, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(590, '1', 'Shibavra 250T', 'Night Shift', 3000, 60, 0, 0, 0, 0, '', '2026-03-17 21:14:49', '1', '2:43 AM - 2:44 AM', 'pending', 3000, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(591, '1', 'Shibavra 250T', 'Night Shift', 3060, 60, 0, 0, 0, 0, '', '2026-03-17 21:15:49', '1', '2:44 AM - 2:45 AM', 'pending', 3060, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(592, '1', 'Shibavra 250T', 'Night Shift', 3120, 60, 0, 0, 0, 0, '', '2026-03-17 21:16:49', '1', '2:45 AM - 2:46 AM', 'pending', 3120, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(593, '1', 'Shibavra 250T', 'Night Shift', 3180, 60, 0, 0, 0, 0, '', '2026-03-17 21:17:49', '1', '2:46 AM - 2:47 AM', 'pending', 3180, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(594, '1', 'Shibavra 250T', 'Night Shift', 3240, 60, 0, 0, 0, 0, '', '2026-03-17 21:18:49', '1', '2:47 AM - 2:48 AM', 'pending', 3240, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(595, '1', 'Shibavra 250T', 'Night Shift', 3300, 60, 0, 0, 0, 0, '', '2026-03-17 21:19:49', '1', '2:48 AM - 2:49 AM', 'pending', 3300, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(596, '1', 'Shibavra 250T', 'Night Shift', 3360, 60, 0, 0, 0, 0, '', '2026-03-17 21:20:49', '1', '2:49 AM - 2:50 AM', 'pending', 3360, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(597, '1', 'Shibavra 250T', 'Night Shift', 3420, 60, 0, 0, 0, 0, '', '2026-03-17 21:21:49', '1', '2:50 AM - 2:51 AM', 'pending', 3420, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(598, '1', 'Shibavra 250T', 'Night Shift', 3480, 60, 0, 0, 0, 0, '', '2026-03-17 21:22:49', '1', '2:51 AM - 2:52 AM', 'pending', 3480, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(599, '1', 'Shibavra 250T', 'Night Shift', 3540, 60, 0, 0, 0, 0, '', '2026-03-17 21:23:49', '1', '2:52 AM - 2:53 AM', 'pending', 3540, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(600, '1', 'Shibavra 250T', 'Night Shift', 3600, 60, 0, 0, 0, 0, '', '2026-03-17 21:24:49', '1', '2:53 AM - 2:54 AM', 'pending', 3600, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(601, '1', 'Shibavra 250T', 'Night Shift', 3660, 60, 0, 0, 0, 0, '', '2026-03-17 21:25:49', '1', '2:54 AM - 2:55 AM', 'pending', 3660, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(602, '1', 'Shibavra 250T', 'Night Shift', 3720, 60, 0, 0, 0, 0, '', '2026-03-17 21:26:49', '1', '2:55 AM - 2:56 AM', 'pending', 3720, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(603, '1', 'Shibavra 250T', 'Night Shift', 3780, 60, 0, 0, 0, 0, '', '2026-03-17 21:27:49', '1', '2:56 AM - 2:57 AM', 'pending', 3780, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(604, '1', 'Shibavra 250T', 'Night Shift', 3840, 60, 0, 0, 0, 0, '', '2026-03-17 21:28:49', '1', '2:57 AM - 2:58 AM', 'pending', 3840, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(605, '1', 'Shibavra 250T', 'Night Shift', 3900, 60, 0, 0, 0, 0, '', '2026-03-17 21:29:49', '1', '2:58 AM - 2:59 AM', 'pending', 3900, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(606, '1', 'Shibavra 250T', 'Night Shift', 3960, 60, 0, 0, 0, 0, '', '2026-03-17 21:30:49', '1', '2:59 AM - 3:00 AM', 'pending', 3960, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(607, '1', 'Shibavra 250T', 'Night Shift', 4020, 60, 0, 0, 0, 0, '', '2026-03-17 21:31:49', '1', '3:00 AM - 3:01 AM', 'pending', 4020, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(608, '1', 'Shibavra 250T', 'Night Shift', 4080, 60, 0, 0, 0, 0, '', '2026-03-17 21:32:49', '1', '3:01 AM - 3:02 AM', 'pending', 4080, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(609, '1', 'Shibavra 250T', 'Night Shift', 4140, 60, 0, 0, 0, 0, '', '2026-03-17 21:33:49', '1', '3:02 AM - 3:03 AM', 'pending', 4140, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(610, '1', 'Shibavra 250T', 'Night Shift', 4200, 60, 0, 0, 0, 0, '', '2026-03-17 21:34:49', '1', '3:03 AM - 3:04 AM', 'pending', 4200, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(611, '1', 'Shibavra 250T', 'Night Shift', 4260, 3720, 0, 0, 0, 0, '', '2026-03-17 21:35:49', '1', '3:04 AM - 3:05 AM', 'pending', 4260, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(612, '1', 'Shibavra 250T', 'Night Shift', 4320, 60, 0, 0, 0, 0, '', '2026-03-17 21:36:49', '1', '3:05 AM - 3:06 AM', 'pending', 4320, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(613, '1', 'Shibavra 250T', 'Night Shift', 4380, 60, 0, 0, 0, 0, '', '2026-03-17 21:37:49', '1', '3:06 AM - 3:07 AM', 'pending', 4380, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(614, '1', 'Shibavra 250T', 'Night Shift', 4440, 60, 0, 0, 0, 0, '', '2026-03-17 21:38:49', '1', '3:07 AM - 3:08 AM', 'pending', 4440, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(615, '1', 'Shibavra 250T', 'Night Shift', 4500, 60, 0, 0, 0, 0, '', '2026-03-17 21:39:49', '1', '3:08 AM - 3:09 AM', 'pending', 4500, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(616, '1', 'Shibavra 250T', 'Night Shift', 4560, 60, 0, 0, 0, 0, '', '2026-03-17 21:40:49', '1', '3:09 AM - 3:10 AM', 'pending', 4560, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(617, '1', 'Shibavra 250T', 'Night Shift', 4620, 60, 0, 0, 0, 0, '', '2026-03-17 21:41:49', '1', '3:10 AM - 3:11 AM', 'pending', 4620, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(618, '1', 'Shibavra 250T', 'Night Shift', 4680, 60, 0, 0, 0, 0, '', '2026-03-17 21:42:49', '1', '3:11 AM - 3:12 AM', 'pending', 4680, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(619, '1', 'Shibavra 250T', 'Night Shift', 4740, 60, 0, 0, 0, 0, '', '2026-03-17 21:43:49', '1', '3:12 AM - 3:13 AM', 'pending', 4740, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(620, '1', 'Shibavra 250T', 'Night Shift', 4800, 60, 0, 0, 0, 0, '', '2026-03-17 21:44:49', '1', '3:13 AM - 3:14 AM', 'pending', 4800, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(621, '1', 'Shibavra 250T', 'Night Shift', 4860, 60, 0, 0, 0, 0, '', '2026-03-17 21:45:49', '1', '3:14 AM - 3:15 AM', 'pending', 4860, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(622, '1', 'Shibavra 250T', 'Night Shift', 4920, 60, 0, 0, 0, 0, '', '2026-03-17 21:46:49', '1', '3:15 AM - 3:16 AM', 'pending', 4920, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(623, '1', 'Shibavra 250T', 'Night Shift', 4980, 60, 0, 0, 0, 0, '', '2026-03-17 21:47:49', '1', '3:16 AM - 3:17 AM', 'pending', 4980, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(624, '1', 'Shibavra 250T', 'Night Shift', 5040, 60, 0, 0, 0, 0, '', '2026-03-17 21:48:49', '1', '3:17 AM - 3:18 AM', 'pending', 5040, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(625, '1', 'Shibavra 250T', 'Night Shift', 5100, 60, 0, 0, 0, 0, '', '2026-03-17 21:49:49', '1', '3:18 AM - 3:19 AM', 'pending', 5100, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(626, '1', 'Shibavra 250T', 'Night Shift', 5160, 60, 0, 0, 0, 0, '', '2026-03-17 21:50:49', '1', '3:19 AM - 3:20 AM', 'pending', 5160, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(627, '1', 'Shibavra 250T', 'Night Shift', 5220, 60, 0, 0, 0, 0, '', '2026-03-17 21:51:49', '1', '3:20 AM - 3:21 AM', 'pending', 5220, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(628, '1', 'Shibavra 250T', 'Night Shift', 5280, 60, 0, 0, 0, 0, '', '2026-03-17 21:52:49', '1', '3:21 AM - 3:22 AM', 'pending', 5280, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(629, '1', 'Shibavra 250T', 'Night Shift', 5340, 60, 0, 0, 0, 0, '', '2026-03-17 21:53:49', '1', '3:22 AM - 3:23 AM', 'pending', 5340, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(630, '1', 'Shibavra 250T', 'Night Shift', 5400, 60, 0, 0, 0, 0, '', '2026-03-17 21:54:49', '1', '3:23 AM - 3:24 AM', 'pending', 5400, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(631, '1', 'Shibavra 250T', 'Night Shift', 5460, 60, 0, 0, 0, 0, '', '2026-03-17 21:55:49', '1', '3:24 AM - 3:25 AM', 'pending', 5460, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(632, '1', 'Shibavra 250T', 'Night Shift', 5520, 60, 0, 0, 0, 0, '', '2026-03-17 21:56:49', '1', '3:25 AM - 3:26 AM', 'pending', 5520, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(633, '1', 'Shibavra 250T', 'Night Shift', 5580, 60, 0, 0, 0, 0, '', '2026-03-17 21:57:49', '1', '3:26 AM - 3:27 AM', 'pending', 5580, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(634, '1', 'Shibavra 250T', 'Night Shift', 5640, 60, 0, 0, 0, 0, '', '2026-03-17 21:58:49', '1', '3:27 AM - 3:28 AM', 'pending', 5640, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(635, '1', 'Shibavra 250T', 'Night Shift', 5700, 5160, 0, 0, 0, 0, '', '2026-03-17 21:59:49', '1', '3:28 AM - 3:29 AM', 'pending', 5700, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(636, '1', 'Shibavra 250T', 'Night Shift', 5760, 60, 0, 0, 0, 0, '', '2026-03-17 22:00:49', '1', '3:29 AM - 3:30 AM', 'pending', 5760, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(637, '1', 'Shibavra 250T', 'Night Shift', 5820, 60, 0, 0, 0, 0, '', '2026-03-17 22:01:49', '1', '3:30 AM - 3:31 AM', 'pending', 5820, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(638, '1', 'Shibavra 250T', 'Night Shift', 5880, 60, 0, 0, 0, 0, '', '2026-03-17 22:02:49', '1', '3:31 AM - 3:32 AM', 'pending', 5880, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(639, '1', 'Shibavra 250T', 'Night Shift', 5940, 60, 0, 0, 0, 0, '', '2026-03-17 22:03:49', '1', '3:32 AM - 3:33 AM', 'pending', 5940, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(640, '1', 'Shibavra 250T', 'Night Shift', 6000, 60, 0, 0, 0, 0, '', '2026-03-17 22:04:49', '1', '3:33 AM - 3:34 AM', 'pending', 6000, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(641, '1', 'Shibavra 250T', 'Night Shift', 6060, 60, 0, 0, 0, 0, '', '2026-03-17 22:05:49', '1', '3:34 AM - 3:35 AM', 'pending', 6060, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(642, '1', 'Shibavra 250T', 'Night Shift', 6120, 60, 0, 0, 0, 0, '', '2026-03-17 22:06:49', '1', '3:35 AM - 3:36 AM', 'pending', 6120, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(643, '1', 'Shibavra 250T', 'Night Shift', 6180, 60, 0, 0, 0, 0, '', '2026-03-17 22:07:49', '1', '3:36 AM - 3:37 AM', 'pending', 6180, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(644, '1', 'Shibavra 250T', 'Night Shift', 6240, 60, 0, 0, 0, 0, '', '2026-03-17 22:08:49', '1', '3:37 AM - 3:38 AM', 'pending', 6240, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(645, '1', 'Shibavra 250T', 'Night Shift', 6300, 60, 0, 0, 0, 0, '', '2026-03-17 22:09:49', '1', '3:38 AM - 3:39 AM', 'pending', 6300, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(646, '1', 'Shibavra 250T', 'Night Shift', 6360, 60, 0, 0, 0, 0, '', '2026-03-17 22:10:49', '1', '3:39 AM - 3:40 AM', 'pending', 6360, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(647, '1', 'Shibavra 250T', 'Night Shift', 6420, 60, 0, 0, 0, 0, '', '2026-03-17 22:11:49', '1', '3:40 AM - 3:41 AM', 'pending', 6420, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(648, '1', 'Shibavra 250T', 'Day Shift', 900, 60, 0, 0, 0, 0, '', '2026-03-22 10:44:51', '1', '4:13 PM - 4:14 PM', 'approved', 900, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(649, '1', 'Shibavra 250T', 'Day Shift', 960, 60, 0, 0, 0, 0, '', '2026-03-22 10:45:51', '1', '4:14 PM - 4:15 PM', 'approved', 960, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(650, '1', 'Shibavra 250T', 'Day Shift', 1020, 60, 0, 0, 0, 0, '', '2026-03-22 10:46:51', '1', '4:15 PM - 4:16 PM', 'approved', 1020, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(651, '1', 'Shibavra 250T', 'Day Shift', 1260, 60, 0, 0, 0, 0, '', '2026-03-22 10:50:51', '1', '4:19 PM - 4:20 PM', 'approved', 1260, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(652, '1', 'Shibavra 250T', 'Day Shift', 1320, 60, 0, 0, 0, 0, '', '2026-03-22 10:51:51', '1', '4:20 PM - 4:21 PM', 'approved', 1320, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(653, '1', 'Shibavra 250T', 'Day Shift', 1740, 60, 0, 0, 0, 0, '', '2026-03-22 10:58:51', '1', '4:27 PM - 4:28 PM', 'approved', 1740, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(654, '1', 'Shibavra 250T', 'Day Shift', 240, 240, 0, 0, 0, 0, '', '2026-03-22 15:19:26', '1', '8:48 PM - 8:49 PM', 'approved', 240, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(655, '1', 'Shibavra 250T', 'Day Shift', 480, 240, 0, 0, 0, 0, '', '2026-03-22 15:20:26', '1', '8:49 PM - 8:50 PM', 'approved', 480, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(656, '1', 'Shibavra 250T', 'Day Shift', 720, 240, 0, 0, 0, 0, '', '2026-03-22 15:21:26', '1', '8:50 PM - 8:51 PM', 'approved', 720, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(657, '1', 'Shibavra 250T', 'Day Shift', 960, 240, 0, 0, 0, 0, '', '2026-03-22 15:22:26', '1', '8:51 PM - 8:52 PM', 'approved', 960, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(658, '1', 'Shibavra 250T', 'Day Shift', 1200, 240, 0, 0, 0, 0, '', '2026-03-22 15:23:26', '1', '8:52 PM - 8:53 PM', 'approved', 1200, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(659, '1', 'Shibavra 250T', 'Day Shift', 1440, 240, 0, 0, 0, 0, '', '2026-03-22 15:24:26', '1', '8:53 PM - 8:54 PM', 'approved', 1440, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(660, '1', 'Shibavra 250T', 'Day Shift', 1680, 240, 0, 0, 0, 0, '', '2026-03-22 15:25:26', '1', '8:54 PM - 8:55 PM', 'approved', 1680, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(661, '1', 'Shibavra 250T', 'Day Shift', 1920, 240, 0, 0, 0, 0, '', '2026-03-22 15:26:26', '1', '8:55 PM - 8:56 PM', 'approved', 1920, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(662, '1', 'Shibavra 250T', 'Day Shift', 2160, 240, 0, 0, 0, 0, '', '2026-03-22 15:27:26', '1', '8:56 PM - 8:57 PM', 'approved', 2160, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(663, '1', 'Shibavra 250T', 'Day Shift', 2400, 480, 0, 0, 0, 0, '', '2026-03-22 15:28:26', '1', '8:57 PM - 8:58 PM', 'approved', 2400, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(664, '1', 'Shibavra 250T', 'Day Shift', 2640, 240, 0, 0, 0, 0, '', '2026-03-22 15:29:26', '1', '8:58 PM - 8:59 PM', 'approved', 2640, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(665, '1', 'Shibavra 250T', 'Day Shift', 2880, 240, 0, 0, 0, 0, '', '2026-03-22 15:30:26', '1', '8:59 PM - 9:00 PM', 'approved', 2880, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(666, '1', 'Shibavra 250T', 'Day Shift', 3120, 240, 0, 0, 0, 0, '', '2026-03-22 15:31:26', '1', '9:00 PM - 9:01 PM', 'approved', 3120, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(667, '1', 'Shibavra 250T', 'Day Shift', 3360, 480, 0, 0, 0, 0, '', '2026-03-22 15:32:26', '1', '9:01 PM - 9:02 PM', 'approved', 3360, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(668, '1', 'Shibavra 250T', 'Day Shift', 3600, 240, 0, 0, 0, 0, '', '2026-03-22 15:33:26', '1', '9:02 PM - 9:03 PM', 'approved', 3600, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(669, '1', 'Shibavra 250T', 'Day Shift', 3840, 240, 0, 0, 0, 0, '', '2026-03-22 15:34:26', '1', '9:03 PM - 9:04 PM', 'approved', 3840, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(670, '1', 'Shibavra 250T', 'Day Shift', 4080, 480, 0, 0, 0, 0, '', '2026-03-22 15:35:26', '1', '9:04 PM - 9:05 PM', 'approved', 4080, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(671, '1', 'Shibavra 250T', 'Day Shift', 4320, 240, 0, 0, 0, 0, '', '2026-03-22 15:36:26', '1', '9:05 PM - 9:06 PM', 'approved', 4320, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(672, '1', 'Shibavra 250T', 'Day Shift', 4560, 240, 0, 0, 0, 0, '', '2026-03-22 15:37:26', '1', '9:06 PM - 9:07 PM', 'approved', 4560, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(673, '1', 'Shibavra 250T', 'Day Shift', 4800, 240, 0, 0, 0, 0, '', '2026-03-22 15:38:26', '1', '9:07 PM - 9:08 PM', 'approved', 4800, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(674, '1', 'Shibavra 250T', 'Day Shift', 5040, 240, 0, 0, 0, 0, '', '2026-03-22 15:39:26', '1', '9:08 PM - 9:09 PM', 'approved', 5040, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(675, '1', 'Shibavra 250T', 'Day Shift', 5280, 240, 0, 0, 0, 0, '', '2026-03-22 15:40:26', '1', '9:09 PM - 9:10 PM', 'approved', 5280, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(676, '1', 'Shibavra 250T', 'Day Shift', 5520, 240, 0, 0, 0, 0, '', '2026-03-22 15:41:26', '1', '9:10 PM - 9:11 PM', 'approved', 5520, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(677, '1', 'Shibavra 250T', 'Day Shift', 5760, 240, 0, 0, 0, 0, '', '2026-03-22 15:42:26', '1', '9:11 PM - 9:12 PM', 'approved', 5760, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(678, '1', 'Shibavra 250T', 'Night Shift', 480, 240, 0, 0, 0, 0, '', '2026-03-22 15:52:17', '1', '9:21 PM - 9:22 PM', 'approved', 480, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(679, '1', 'Shibavra 250T', 'Night Shift', 720, 240, 0, 0, 0, 0, '', '2026-03-22 15:53:17', '1', '9:22 PM - 9:23 PM', 'approved', 720, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(680, '1', 'Shibavra 250T', 'Night Shift', 960, 240, 0, 0, 0, 0, '', '2026-03-22 15:54:17', '1', '9:23 PM - 9:24 PM', 'approved', 960, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(681, '1', 'Shibavra 250T', 'Night Shift', 992, 32, 0, 0, 0, 0, '', '2026-03-22 15:55:17', '1', '9:24 PM - 9:25 PM', 'approved', 992, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(682, '1', 'Shibavra 250T', 'Night Shift', 992, 32, 0, 0, 0, 0, '', '2026-03-22 15:56:17', '1', '9:25 PM - 9:26 PM', 'approved', 992, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(683, '1', 'Shibavra 250T', 'Night Shift', 1024, 32, 0, 0, 0, 0, '', '2026-03-22 15:57:17', '1', '9:26 PM - 9:27 PM', 'approved', 1024, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(684, '1', 'Shibavra 250T', 'Night Shift', 1264, 240, 0, 0, 0, 0, '', '2026-03-22 15:58:17', '1', '9:27 PM - 9:28 PM', 'approved', 1264, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(685, '1', 'Shibavra 250T', 'Night Shift', 1304, 40, 0, 0, 0, 0, '', '2026-03-22 15:59:17', '1', '9:28 PM - 9:29 PM', 'approved', 1304, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(686, '1', 'Shibavra 250T', 'Night Shift', 1304, 40, 0, 0, 0, 0, '', '2026-03-22 16:00:17', '1', '9:29 PM - 9:30 PM', 'approved', 1304, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(687, '1', 'Shibavra 250T', 'Night Shift', 1520, 216, 0, 0, 0, 0, '', '2026-03-22 16:01:17', '1', '9:30 PM - 9:31 PM', 'approved', 1520, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(688, '1', 'Shibavra 250T', 'Night Shift', 1760, 240, 0, 0, 0, 0, '', '2026-03-22 16:02:17', '1', '9:31 PM - 9:32 PM', 'approved', 1760, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(689, '1', 'Shibavra 250T', 'Night Shift', 2000, 240, 0, 0, 0, 0, '', '2026-03-22 16:03:17', '1', '9:32 PM - 9:33 PM', 'approved', 2000, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(690, '1', 'Shibavra 250T', 'Night Shift', 2160, 160, 0, 0, 0, 0, '', '2026-03-22 16:04:17', '1', '9:33 PM - 9:34 PM', 'approved', 2160, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(691, '1', 'Shibavra 250T', 'Night Shift', 2384, 224, 0, 0, 0, 0, '', '2026-03-22 16:07:17', '1', '9:36 PM - 9:37 PM', 'approved', 2384, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(692, '1', 'Shibavra 250T', 'Night Shift', 2624, 240, 0, 0, 0, 0, '', '2026-03-22 16:08:17', '1', '9:37 PM - 9:38 PM', 'approved', 2624, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(693, '1', 'Shibavra 250T', 'Day Shift', 240, 240, 0, 0, 0, 0, '', '2026-03-22 16:24:46', '1', '9:53 PM - 9:54 PM', 'approved', 240, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(694, '1', 'Shibavra 250T', 'Day Shift', 480, 240, 0, 0, 0, 0, '', '2026-03-22 16:25:46', '1', '9:54 PM - 9:55 PM', 'approved', 480, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(695, '1', 'Shibavra 250T', 'Day Shift', 600, 120, 0, 0, 0, 0, '', '2026-03-22 16:26:46', '1', '9:55 PM - 9:56 PM', 'approved', 600, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(696, '1', 'Shibavra 250T', 'Day Shift', 640, 40, 0, 0, 0, 0, '', '2026-03-22 16:30:46', '1', '9:59 PM - 10:00 PM', 'approved', 640, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(697, '1', 'Shibavra 250T', 'Day Shift', 120, 60, 1, 1, 1, 1, '', '2026-03-24 08:49:15', '1', '2:18 PM - 2:19 PM', 'approved', 120, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(698, '1', 'Shibavra 250T', 'Day Shift', 180, 60, 1, 1, 1, 1, '', '2026-03-24 08:50:15', '1', '2:19 PM - 2:20 PM', 'approved', 180, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(699, '1', 'Shibavra 250T', 'Day Shift', 240, 60, 1, 1, 1, 1, '', '2026-03-24 08:51:15', '1', '2:20 PM - 2:21 PM', 'approved', 240, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(700, '1', 'Shibavra 250T', 'Day Shift', 284, 44, 1, 1, 1, 1, '', '2026-03-24 08:52:15', '1', '2:21 PM - 2:22 PM', 'approved', 284, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(701, '1', 'Shibavra 250T', 'Day Shift', 298, 14, 1, 1, 1, 1, '', '2026-03-24 08:53:15', '1', '2:22 PM - 2:23 PM', 'approved', 298, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(702, '1', 'Shibavra 250T', 'Day Shift', 308, 10, 1, 1, 1, 1, '', '2026-03-24 08:56:15', '1', '2:25 PM - 2:26 PM', 'approved', 308, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(703, '1', 'Shibavra 250T', 'Day Shift', 368, 60, 1, 1, 1, 1, '', '2026-03-24 08:57:15', '1', '2:26 PM - 2:27 PM', 'approved', 368, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(704, '1', 'Shibavra 250T', 'Day Shift', 428, 60, 0, 1, 1, 1, '', '2026-03-24 08:58:15', '1', '2:27 PM - 2:28 PM', 'approved', 428, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(705, '1', 'Shibavra 250T', 'Day Shift', 488, 60, 1, 1, 1, 1, '', '2026-03-24 08:59:15', '1', '2:28 PM - 2:29 PM', 'approved', 488, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(706, '1', 'Shibavra 250T', 'Day Shift', 548, 60, 1, 1, 1, 1, '', '2026-03-24 09:00:15', '1', '2:29 PM - 2:30 PM', 'approved', 548, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(707, '1', 'Shibavra 250T', 'Day Shift', 608, 60, 1, 1, 1, 1, '', '2026-03-24 09:01:15', '1', '2:30 PM - 2:31 PM', 'approved', 608, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(708, '1', 'Shibavra 250T', 'Day Shift', 668, 60, 1, 0, 1, 1, '', '2026-03-24 09:02:15', '1', '2:31 PM - 2:32 PM', 'approved', 668, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(709, '1', 'Shibavra 250T', 'Day Shift', 360, 120, 1, 1, 1, 1, '', '2026-03-24 11:05:03', '1', '4:34 PM - 4:35 PM', 'approved', 360, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(710, '1', 'Shibavra 250T', 'Day Shift', 480, 120, 0, 0, 0, 0, '', '2026-03-24 11:06:03', '1', '4:35 PM - 4:36 PM', 'pending', 480, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(711, '1', 'Shibavra 250T', 'Day Shift', 600, 120, 1, 1, 1, 1, '', '2026-03-24 11:07:03', '1', '4:36 PM - 4:37 PM', 'approved', 600, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(712, '1', 'Shibavra 250T', 'Day Shift', 720, 120, 0, 0, 0, 0, '', '2026-03-24 11:08:03', '1', '4:37 PM - 4:38 PM', 'pending', 720, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(713, '1', 'Shibavra 250T', 'Day Shift', 1560, 120, 0, 0, 0, 0, '', '2026-03-24 11:15:03', '1', '4:44 PM - 4:45 PM', 'pending', 1560, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(714, '1', 'Shibavra 250T', 'Day Shift', 1680, 120, 0, 0, 0, 0, '', '2026-03-24 11:16:03', '1', '4:45 PM - 4:46 PM', 'pending', 1680, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(715, '1', 'Shibavra 250T', 'Day Shift', 1800, 120, 0, 0, 0, 0, '', '2026-03-24 11:17:03', '1', '4:46 PM - 4:47 PM', 'pending', 1800, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(716, '1', 'Shibavra 250T', 'Day Shift', 3240, 120, 0, 0, 0, 0, '', '2026-03-24 11:29:03', '1', '4:58 PM - 4:59 PM', 'pending', 3240, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(717, '1', 'Shibavra 250T', 'Day Shift', 3360, 120, 0, 0, 0, 0, '', '2026-03-24 11:30:03', '1', '4:59 PM - 5:00 PM', 'pending', 3360, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(718, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 100, 116, 1, 1, 1, 1, 'Test remark 1', '2026-04-02 09:00:00', '1', '8:00 AM - 9:00 AM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(719, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 200, 126, 1, 1, 1, 1, 'Test remark 2', '2026-04-02 10:00:00', '1', '9:00 AM - 10:00 AM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(720, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 300, 145, 1, 1, 1, 1, 'Test remark 3', '2026-04-02 11:00:00', '1', '10:00 AM - 11:00 AM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(721, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 400, 147, 1, 1, 1, 1, 'Test remark 4', '2026-04-02 12:00:00', '1', '11:00 AM - 12:00 PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(722, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 500, 120, 1, 1, 1, 1, 'Test remark 5', '2026-04-02 13:00:00', '1', '12:00 PM - 1:00 PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(723, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 600, 113, 1, 1, 1, 1, 'Test remark 6', '2026-04-02 14:00:00', '1', '1:00 PM - 2:00 PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(724, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 700, 145, 1, 1, 1, 1, 'Test remark 7', '2026-04-02 15:00:00', '1', '2:00 PM - 3:00 PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(725, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 800, 101, 1, 1, 1, 1, 'Test remark 8', '2026-04-02 16:00:00', '1', '3:00 PM - 4:00 PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(726, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 900, 131, 1, 1, 1, 1, 'Test remark 9', '2026-04-02 17:00:00', '1', '4:00 PM - 5:00 PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(727, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 1000, 103, 1, 1, 1, 1, 'Test remark 10', '2026-04-02 18:00:00', '1', '5:00 PM - 6:00 PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(728, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 1100, 106, 1, 1, 1, 1, 'Test remark 11', '2026-04-02 19:00:00', '1', '6:00 PM - 7:00 PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(729, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 1200, 133, 1, 1, 1, 1, 'Test remark 12', '2026-04-02 20:00:00', '1', '7:00 PM - 8:00 PM', 'approved', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(730, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 12, 12, 0, 0, 0, 0, '', '2026-04-04 06:11:21', '32', '6:10 AM - 6:11 AM', 'approved', 12, NULL, NULL, '1test lid', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(731, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 24, 12, 0, 0, 0, 0, '', '2026-04-04 06:12:21', '32', '6:11 AM - 6:12 AM', 'approved', 24, NULL, NULL, '1test lid', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(732, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 36, 12, 0, 0, 0, 0, '', '2026-04-04 06:13:21', '32', '6:12 AM - 6:13 AM', 'approved', 36, NULL, NULL, '1test lid', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(733, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 48, 12, 0, 0, 0, 0, '', '2026-04-04 06:14:21', '32', '6:13 AM - 6:14 AM', 'approved', 48, NULL, NULL, '1test lid', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(734, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 60, 12, 0, 0, 0, 0, '', '2026-04-04 06:15:21', '32', '6:14 AM - 6:15 AM', 'approved', 60, NULL, NULL, '1test lid', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(735, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 40, 4, 0, 0, 0, 0, '', '2026-04-04 08:58:39', '32', '8:57 AM - 8:58 AM', 'approved', 40, NULL, NULL, '1test lid', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(736, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 24, 12, 0, 0, 0, 0, '', '2026-04-04 08:59:39', '32', '8:58 AM - 8:59 AM', 'approved', 24, NULL, NULL, '1test lid', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(737, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 36, 12, 0, 0, 0, 0, '', '2026-04-04 09:00:39', '32', '8:59 AM - 9:00 AM', 'approved', 36, NULL, NULL, '1test lid', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(738, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Night Shift', 44, 4, 0, 0, 0, 0, '', '2026-04-04 09:02:39', '32', '9:01 AM - 9:02 AM', 'approved', 44, NULL, NULL, '1test lid', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(739, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Night Shift', 56, 12, 0, 0, 0, 0, '', '2026-04-04 09:03:39', '32', '9:02 AM - 9:03 AM', 'approved', 56, NULL, NULL, '1test lid', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(740, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Night Shift', 68, 12, 0, 0, 0, 0, '', '2026-04-04 09:04:39', '32', '9:03 AM - 9:04 AM', 'approved', 68, NULL, NULL, '1test lid', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(741, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Night Shift', 80, 12, 0, 0, 0, 0, '', '2026-04-04 09:05:39', '32', '9:04 AM - 9:05 AM', 'approved', 80, NULL, NULL, '1test lid', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(742, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Night Shift', 92, 12, 0, 0, 0, 0, '', '2026-04-04 09:06:39', '32', '9:05 AM - 9:06 AM', 'approved', 92, NULL, NULL, '1test lid', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(743, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Night Shift', 104, 12, 0, 0, 0, 0, '', '2026-04-04 09:07:39', '32', '9:06 AM - 9:07 AM', 'approved', 104, NULL, NULL, '1test lid', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(744, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Night Shift', 116, 12, 0, 0, 0, 0, '', '2026-04-04 09:08:39', '32', '9:07 AM - 9:08 AM', 'approved', 116, NULL, NULL, '1test lid', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(745, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Night Shift', 128, 12, 0, 0, 0, 0, '', '2026-04-04 09:09:39', '32', '9:08 AM - 9:09 AM', 'approved', 128, NULL, NULL, '1test lid', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(746, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Night Shift', 140, 12, 0, 0, 0, 0, '', '2026-04-04 09:10:39', '32', '9:09 AM - 9:10 AM', 'approved', 140, NULL, NULL, '1test lid', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(747, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Night Shift', 152, 12, 0, 0, 0, 0, '', '2026-04-04 09:11:39', '32', '9:10 AM - 9:11 AM', 'approved', 152, NULL, NULL, '1test lid', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(748, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Night Shift', 164, 12, 0, 0, 0, 0, '', '2026-04-04 09:12:39', '32', '9:11 AM - 9:12 AM', 'approved', 164, NULL, NULL, '1test lid', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(749, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Night Shift', 176, 12, 0, 0, 0, 0, '', '2026-04-04 09:13:39', '32', '9:12 AM - 9:13 AM', 'approved', 176, NULL, NULL, '1test lid', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(750, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Night Shift', 188, 12, 0, 0, 0, 0, '', '2026-04-04 09:14:39', '32', '9:13 AM - 9:14 AM', 'approved', 188, NULL, NULL, '1test lid', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(751, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Night Shift', 200, 12, 0, 0, 0, 0, '', '2026-04-04 09:15:39', '32', '9:14 AM - 9:15 AM', 'approved', 200, NULL, NULL, '1test lid', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(752, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Night Shift', 212, 12, 0, 0, 0, 0, '', '2026-04-04 09:16:39', '32', '9:15 AM - 9:16 AM', 'approved', 212, NULL, NULL, '1test lid', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(753, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Night Shift', 224, 12, 0, 0, 0, 0, '', '2026-04-04 09:17:39', '32', '9:16 AM - 9:17 AM', 'approved', 224, NULL, NULL, '1test lid', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(754, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Night Shift', 236, 12, 0, 0, 0, 0, '', '2026-04-04 09:18:39', '32', '9:17 AM - 9:18 AM', 'approved', 236, NULL, NULL, '1test lid', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(755, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Night Shift', 248, 12, 0, 0, 0, 0, '', '2026-04-04 09:19:39', '32', '9:18 AM - 9:19 AM', 'approved', 248, NULL, NULL, '1test lid', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(756, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Night Shift', 260, 12, 0, 0, 0, 0, '', '2026-04-04 09:20:39', '32', '9:19 AM - 9:20 AM', 'approved', 260, NULL, NULL, '1test lid', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(757, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Night Shift', 272, 12, 0, 0, 0, 0, '', '2026-04-04 09:21:39', '32', '9:20 AM - 9:21 AM', 'approved', 272, NULL, NULL, '1test lid', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(758, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Night Shift', 284, 156, 0, 0, 0, 0, '', '2026-04-04 09:22:39', '32', '9:21 AM - 9:22 AM', 'approved', 284, NULL, NULL, '1test lid', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(759, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Night Shift', 296, 12, 0, 0, 0, 0, '', '2026-04-04 09:23:39', '32', '9:22 AM - 9:23 AM', 'approved', 296, NULL, NULL, '1test lid', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(760, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Night Shift', 308, 12, 0, 0, 0, 0, '', '2026-04-04 09:24:39', '32', '9:23 AM - 9:24 AM', 'approved', 308, NULL, NULL, '1test lid', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(761, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Night Shift', 320, 192, 0, 0, 0, 0, '', '2026-04-04 09:25:39', '32', '9:24 AM - 9:25 AM', 'approved', 320, NULL, NULL, '1test lid', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(762, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Night Shift', 332, 24, 0, 0, 0, 0, '', '2026-04-04 09:26:39', '32', '9:25 AM - 9:26 AM', 'approved', 332, NULL, NULL, '1test lid', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(763, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 56, 30, 1, 0, 1, 1, 'Hello', '2026-04-04 11:39:50', '32', '4:08 PM - 4:09 PM', 'approved', 56, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(764, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 30, 30, 0, 0, 0, 0, '', '2026-04-04 12:42:28', '32', '12:41 PM - 12:42 PM', 'approved', 30, NULL, NULL, '3test container', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(765, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 60, 30, 0, 0, 0, 0, '', '2026-04-04 12:43:28', '32', '12:42 PM - 12:43 PM', 'approved', 60, NULL, NULL, '3test container', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(766, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 90, 30, 0, 0, 0, 0, '', '2026-04-04 12:44:28', '32', '12:43 PM - 12:44 PM', 'approved', 90, NULL, NULL, '3test container', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(767, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 120, 30, 0, 0, 0, 0, '', '2026-04-04 12:45:28', '32', '12:44 PM - 12:45 PM', 'approved', 120, NULL, NULL, '3test container', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(768, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 150, 30, 0, 0, 0, 0, '', '2026-04-04 12:46:28', '32', '12:45 PM - 12:46 PM', 'approved', 150, NULL, NULL, '3test container', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(769, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 180, 30, 0, 0, 0, 0, '', '2026-04-04 12:47:28', '32', '12:46 PM - 12:47 PM', 'approved', 180, NULL, NULL, '3test container', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(770, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 210, 30, 0, 0, 0, 0, '', '2026-04-04 12:48:28', '32', '12:47 PM - 12:48 PM', 'approved', 210, NULL, NULL, '3test container', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(771, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 240, 30, 0, 0, 0, 0, '', '2026-04-04 12:49:28', '32', '12:48 PM - 12:49 PM', 'approved', 240, NULL, NULL, '3test container', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(772, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 270, 30, 0, 0, 0, 0, '', '2026-04-04 12:50:28', '32', '12:49 PM - 12:50 PM', 'approved', 270, NULL, NULL, '3test container', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(773, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 30, 30, 0, 0, 0, 0, '', '2026-04-04 13:35:36', '32', '1:34 PM - 1:35 PM', 'approved', 30, NULL, NULL, '2test lid', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(774, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 60, 30, 0, 0, 0, 0, '', '2026-04-04 13:36:36', '32', '1:35 PM - 1:36 PM', 'approved', 60, NULL, NULL, '2test lid', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(775, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Night Shift', 90, 30, 0, 0, 0, 0, '', '2026-04-04 13:37:36', '32', '1:36 PM - 1:37 PM', 'approved', 90, NULL, NULL, '2test lid', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL);
INSERT INTO `hourly_production_logs` (`id`, `machine_id`, `machine_name`, `shift`, `total_output`, `hourly_output`, `chiller_check`, `compressor_check`, `mould_check`, `machine_check`, `remarks`, `timestamp`, `operator_id`, `hour_range`, `status`, `total_count_at_end`, `down_time`, `down_reason`, `semi_finished_product`, `production_date`, `hour_slot_from`, `hour_slot_to`, `good_parts`, `rejects`, `submitted_at`, `is_missed`, `is_edited_by_head`, `edited_by`, `edited_at`) VALUES
(776, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Night Shift', 120, 30, 0, 0, 0, 0, '', '2026-04-04 13:38:36', '32', '1:37 PM - 1:38 PM', 'approved', 120, NULL, NULL, '2test lid', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(777, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Night Shift', 150, 30, 0, 0, 0, 0, '', '2026-04-04 13:39:36', '32', '1:38 PM - 1:39 PM', 'approved', 150, NULL, NULL, '2test lid', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(778, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Night Shift', 180, 30, 0, 0, 0, 0, '', '2026-04-04 13:40:36', '32', '1:39 PM - 1:40 PM', 'approved', 180, NULL, NULL, '2test lid', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(779, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Night Shift', 210, 30, 0, 0, 0, 0, '', '2026-04-04 13:41:36', '32', '1:40 PM - 1:41 PM', 'approved', 210, NULL, NULL, '2test lid', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(780, '2', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Night Shift', 240, 30, 0, 0, 0, 0, '', '2026-04-04 13:42:36', '32', '1:41 PM - 1:42 PM', 'approved', 240, NULL, NULL, '2test lid', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(781, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 30, 30, 1, 1, 1, 1, 'Wfgff', '2026-04-04 16:46:05', '32', '9:15 PM - 9:16 PM', 'approved', 30, '2', 'Dfg', '3test container', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(782, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 60, 30, 1, 1, 1, 1, '', '2026-04-04 16:47:05', '32', '9:16 PM - 9:17 PM', 'approved', 60, NULL, NULL, '3test container', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(783, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 90, 30, 0, 0, 0, 0, '', '2026-04-04 16:48:05', '32', '9:17 PM - 9:18 PM', 'pending', 90, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(784, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 120, 30, 0, 0, 0, 0, '', '2026-04-04 16:49:05', '32', '9:18 PM - 9:19 PM', 'pending', 120, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(785, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 150, 30, 0, 0, 0, 0, '', '2026-04-04 16:50:05', '32', '9:19 PM - 9:20 PM', 'pending', 150, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(786, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 180, 30, 0, 0, 0, 0, '', '2026-04-04 16:51:05', '32', '9:20 PM - 9:21 PM', 'pending', 180, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(787, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 600, 30, 0, 0, 0, 0, '', '2026-04-04 17:05:05', '32', '9:34 PM - 9:35 PM', 'pending', 600, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(788, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 630, 30, 0, 0, 0, 0, '', '2026-04-04 17:06:05', '32', '9:35 PM - 9:36 PM', 'pending', 630, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(789, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 720, 30, 0, 0, 0, 0, '', '2026-04-04 17:09:05', '32', '9:38 PM - 9:39 PM', 'pending', 720, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(790, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 750, 30, 0, 0, 0, 0, '', '2026-04-04 17:10:05', '32', '9:39 PM - 9:40 PM', 'pending', 750, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(791, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 780, 30, 0, 0, 0, 0, '', '2026-04-04 17:11:05', '32', '9:40 PM - 9:41 PM', 'pending', 780, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(792, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 810, 30, 0, 0, 0, 0, '', '2026-04-04 17:12:05', '32', '9:41 PM - 9:42 PM', 'pending', 810, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(793, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 840, 30, 0, 0, 0, 0, '', '2026-04-04 17:13:05', '32', '9:42 PM - 9:43 PM', 'pending', 840, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(794, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 870, 30, 0, 0, 0, 0, '', '2026-04-04 17:14:05', '32', '9:43 PM - 9:44 PM', 'pending', 870, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(795, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 900, 30, 0, 0, 0, 0, '', '2026-04-04 17:15:05', '32', '9:44 PM - 9:45 PM', 'pending', 900, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(796, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 930, 30, 0, 0, 0, 0, '', '2026-04-04 17:16:05', '32', '9:45 PM - 9:46 PM', 'pending', 930, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(797, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 960, 30, 0, 0, 0, 0, '', '2026-04-04 17:17:05', '32', '9:46 PM - 9:47 PM', 'pending', 960, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(798, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 990, 30, 0, 0, 0, 0, '', '2026-04-04 17:18:05', '32', '9:47 PM - 9:48 PM', 'pending', 990, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(799, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 1020, 30, 0, 0, 0, 0, '', '2026-04-04 17:19:05', '32', '9:48 PM - 9:49 PM', 'pending', 1020, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(800, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 1050, 30, 0, 0, 0, 0, '', '2026-04-04 17:20:05', '32', '9:49 PM - 9:50 PM', 'pending', 1050, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(801, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 1080, 30, 0, 0, 0, 0, '', '2026-04-04 17:21:05', '32', '9:50 PM - 9:51 PM', 'pending', 1080, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(802, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 1110, 30, 0, 0, 0, 0, '', '2026-04-04 17:22:05', '32', '9:51 PM - 9:52 PM', 'pending', 1110, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(803, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 1140, 30, 0, 0, 0, 0, '', '2026-04-04 17:23:05', '32', '9:52 PM - 9:53 PM', 'pending', 1140, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(804, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 1260, 30, 0, 0, 0, 0, '', '2026-04-04 17:27:05', '32', '9:56 PM - 9:57 PM', 'pending', 1260, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(805, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 1290, 30, 0, 0, 0, 0, '', '2026-04-04 17:28:05', '32', '9:57 PM - 9:58 PM', 'pending', 1290, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(806, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 1320, 30, 0, 0, 0, 0, '', '2026-04-04 17:29:05', '32', '9:58 PM - 9:59 PM', 'pending', 1320, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(807, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 1380, 30, 0, 0, 0, 0, '', '2026-04-04 17:31:05', '32', '10:00 PM - 10:01 PM', 'pending', 1380, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(808, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 1410, 30, 0, 0, 0, 0, '', '2026-04-04 17:32:05', '32', '10:01 PM - 10:02 PM', 'pending', 1410, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(809, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 1440, 30, 0, 0, 0, 0, '', '2026-04-04 17:33:05', '32', '10:02 PM - 10:03 PM', 'pending', 1440, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(810, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 1470, 30, 0, 0, 0, 0, '', '2026-04-04 17:34:05', '32', '10:03 PM - 10:04 PM', 'pending', 1470, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(811, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 1500, 30, 0, 0, 0, 0, '', '2026-04-04 17:35:05', '32', '10:04 PM - 10:05 PM', 'pending', 1500, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(812, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 1530, 30, 0, 0, 0, 0, '', '2026-04-04 17:36:05', '32', '10:05 PM - 10:06 PM', 'pending', 1530, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(813, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Night Shift', 1800, 1740, 0, 0, 0, 0, '', '2026-04-16 04:11:06', '37', '8:41 AM - 9:41 AM', 'approved', 1800, NULL, NULL, '2test lid', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(814, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Night Shift', 3600, 1800, 0, 0, 0, 0, '', '2026-04-16 05:11:06', '37', '9:41 AM - 10:41 AM', 'pending', 3600, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(815, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Night Shift', 5400, 1800, 0, 0, 0, 0, '', '2026-04-16 06:11:06', '37', '10:41 AM - 11:41 AM', 'approved', 5400, NULL, NULL, '2test lid', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(816, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Night Shift', 7200, 1800, 0, 0, 0, 0, '', '2026-04-16 07:11:06', '37', '11:41 AM - 12:41 PM', 'pending', 7200, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(817, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Night Shift', 9000, 1800, 0, 0, 0, 0, '', '2026-04-16 08:11:06', '37', '12:41 PM - 1:41 PM', 'approved', 9000, NULL, NULL, '2test lid', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(818, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 500, 500, 1, 1, 1, 1, 'ok', '2026-04-18 07:56:28', '1', '12:00 - 13:00', 'approved', 500, '0', NULL, '2test lid', NULL, NULL, NULL, 0, 0, NULL, 0, 0, NULL, NULL),
(819, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 1800, 0, 0, 0, 0, 0, '', '2026-04-19 13:25:37', '19', '5:55 PM - 6:55 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-19', NULL, NULL, 0, 0, '2026-04-19 13:27:02', 0, 0, NULL, NULL),
(820, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 2300, 1800, 1, 1, 1, 1, 'No down ', '2026-04-19 13:27:37', '19', '5:55 PM - 6:55 PM', 'approved', NULL, '0', 'No', '2test lid', '2026-04-19', '5:55 PM', '6:55 PM', 1800, 0, '2026-04-19 13:27:38', 0, 0, NULL, NULL),
(821, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 3330, 0, 0, 0, 0, 0, '', '2026-04-19 14:25:37', '19', '6:55 PM - 7:55 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-19', NULL, NULL, 0, 0, '2026-04-19 14:27:53', 0, 0, NULL, NULL),
(822, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 3300, 1000, 1, 1, 1, 1, 'Cut', '2026-04-19 14:28:19', '19', '6:55 PM - 7:55 PM', 'approved', NULL, '30', 'Power cut ', '2test lid', '2026-04-19', '6:55 PM', '7:55 PM', 1000, 0, '2026-04-19 14:28:20', 0, 0, NULL, NULL),
(823, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 3600, 0, 0, 0, 0, 0, '', '2026-04-20 07:01:01', '19', '11:31 AM - 12:31 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-20', NULL, NULL, 0, 0, '2026-04-20 07:09:05', 0, 0, NULL, NULL),
(824, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 5400, 0, 0, 0, 0, 0, '', '2026-04-20 08:01:01', '19', '12:31 PM - 1:31 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-20', NULL, NULL, 0, 0, '2026-04-20 08:02:49', 0, 0, NULL, NULL),
(825, '8', 'MACHINE -8(250 TONNAGE SHIBAURA MACHINE 2025)', 'Day Shift', 1028, 0, 0, 0, 0, 0, '', '2026-04-20 06:14:25', '19', '10:44 AM - 11:44 AM', 'pending', NULL, NULL, NULL, NULL, '2026-04-20', NULL, NULL, 0, 0, '2026-04-20 08:13:42', 0, 0, NULL, NULL),
(826, '8', 'MACHINE -8(250 TONNAGE SHIBAURA MACHINE 2025)', 'Day Shift', 2056, 0, 0, 0, 0, 0, '', '2026-04-20 07:14:25', '19', '11:44 AM - 12:44 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-20', NULL, NULL, 0, 0, '2026-04-20 08:13:43', 0, 0, NULL, NULL),
(827, '8', 'MACHINE -8(250 TONNAGE SHIBAURA MACHINE 2025)', 'Day Shift', 3084, 0, 0, 0, 0, 0, '', '2026-04-20 08:14:25', '19', '12:44 PM - 1:44 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-20', NULL, NULL, 0, 0, '2026-04-20 08:14:26', 0, 0, NULL, NULL),
(828, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 8452, 1904, 1, 1, 1, 1, '', '2026-04-20 08:39:43', '19', '13:00 - 14:00', 'approved', NULL, NULL, NULL, '500/650/750/1000ML REC LID NATURAL', '2026-04-20', '13:00', '14:00', 1904, 0, '2026-04-20 08:39:44', 0, 0, NULL, NULL),
(829, '2', 'MACHINE -2(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 3084, 0, 0, 0, 0, 0, '', '2026-04-20 06:04:31', '19', '10:34 AM - 11:34 AM', 'pending', NULL, NULL, NULL, NULL, '2026-04-20', NULL, NULL, 0, 0, '2026-04-20 08:39:55', 0, 0, NULL, NULL),
(830, '2', 'MACHINE -2(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 6168, 0, 0, 0, 0, 0, '', '2026-04-20 07:04:31', '19', '11:34 AM - 12:34 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-20', NULL, NULL, 0, 0, '2026-04-20 08:39:56', 0, 0, NULL, NULL),
(831, '2', 'MACHINE -2(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 9252, 0, 0, 0, 0, 0, '', '2026-04-20 08:04:31', '19', '12:34 PM - 1:34 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-20', NULL, NULL, 0, 0, '2026-04-20 08:39:57', 0, 0, NULL, NULL),
(832, '2', 'MACHINE -2(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 3084, 2844, 1, 1, 1, 1, '', '2026-04-20 08:40:18', '19', '10:34 AM - 11:34 AM', 'approved', NULL, NULL, NULL, '250/500 ML ROUND LID NATURE', '2026-04-20', '10:34 AM', '11:34 AM', 2844, 0, '2026-04-20 08:40:19', 0, 0, NULL, NULL),
(833, '3', 'MACHINE -3(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 1028, 0, 0, 0, 0, 0, '', '2026-04-20 06:06:06', '19', '10:36 AM - 11:36 AM', 'pending', NULL, NULL, NULL, NULL, '2026-04-20', NULL, NULL, 0, 0, '2026-04-20 08:40:39', 0, 0, NULL, NULL),
(834, '3', 'MACHINE -3(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 2056, 0, 0, 0, 0, 0, '', '2026-04-20 07:06:06', '19', '11:36 AM - 12:36 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-20', NULL, NULL, 0, 0, '2026-04-20 08:40:40', 0, 0, NULL, NULL),
(835, '3', 'MACHINE -3(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 3084, 0, 0, 0, 0, 0, '', '2026-04-20 08:06:06', '19', '12:36 PM - 1:36 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-20', NULL, NULL, 0, 0, '2026-04-20 08:40:41', 0, 0, NULL, NULL),
(836, '3', 'MACHINE -3(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 886, 886, 1, 1, 1, 1, '', '2026-04-20 08:40:57', '19', '10:36 AM - 11:36 AM', 'approved', NULL, NULL, NULL, '500 ML ROUND CONTAINER NATURAL', '2026-04-20', '10:36 AM', '11:36 AM', 886, 0, '2026-04-20 08:40:59', 0, 0, NULL, NULL),
(837, '4', 'MACHINE -4(180 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 1028, 0, 0, 0, 0, 0, '', '2026-04-20 06:08:22', '19', '10:38 AM - 11:38 AM', 'pending', NULL, NULL, NULL, NULL, '2026-04-20', NULL, NULL, 0, 0, '2026-04-20 08:41:25', 0, 0, NULL, NULL),
(838, '4', 'MACHINE -4(180 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 2056, 0, 0, 0, 0, 0, '', '2026-04-20 07:08:22', '19', '11:38 AM - 12:38 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-20', NULL, NULL, 0, 0, '2026-04-20 08:41:26', 0, 0, NULL, NULL),
(839, '4', 'MACHINE -4(180 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 3084, 0, 0, 0, 0, 0, '', '2026-04-20 08:08:22', '19', '12:38 PM - 1:38 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-20', NULL, NULL, 0, 0, '2026-04-20 08:41:27', 0, 0, NULL, NULL),
(840, '4', 'MACHINE -4(180 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 1008, 1008, 1, 1, 1, 1, '', '2026-04-20 08:41:35', '19', '10:38 AM - 11:38 AM', 'approved', NULL, NULL, NULL, '750 ML REC CONTAINER BLACK', '2026-04-20', '10:38 AM', '11:38 AM', 1008, 0, '2026-04-20 08:41:36', 0, 0, NULL, NULL),
(841, '8', 'MACHINE -8(250 TONNAGE SHIBAURA MACHINE 2025)', 'Day Shift', 4534, 976, 1, 1, 1, 1, '', '2026-04-20 08:42:13', '19', '13:00 - 14:00', 'approved', NULL, NULL, NULL, '1000 ML ROUND CONTAINER NATURAL', '2026-04-20', '13:00', '14:00', 976, 0, '2026-04-20 08:42:14', 0, 0, NULL, NULL),
(842, '7', 'MACHINE -7(180 TONNAGE SHIBAURA MACHINE 2025)', 'Day Shift', 2056, 0, 0, 0, 0, 0, '', '2026-04-20 06:12:59', '19', '10:42 AM - 11:42 AM', 'pending', NULL, NULL, NULL, NULL, '2026-04-20', NULL, NULL, 0, 0, '2026-04-20 08:42:31', 0, 0, NULL, NULL),
(843, '7', 'MACHINE -7(180 TONNAGE SHIBAURA MACHINE 2025)', 'Day Shift', 4112, 0, 0, 0, 0, 0, '', '2026-04-20 07:12:59', '19', '11:42 AM - 12:42 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-20', NULL, NULL, 0, 0, '2026-04-20 08:42:32', 0, 0, NULL, NULL),
(844, '7', 'MACHINE -7(180 TONNAGE SHIBAURA MACHINE 2025)', 'Day Shift', 6168, 0, 0, 0, 0, 0, '', '2026-04-20 08:12:59', '19', '12:42 PM - 1:42 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-20', NULL, NULL, 0, 0, '2026-04-20 08:42:33', 0, 0, NULL, NULL),
(845, '7', 'MACHINE -7(180 TONNAGE SHIBAURA MACHINE 2025)', 'Day Shift', 9120, 1928, 1, 1, 1, 1, '', '2026-04-20 08:43:01', '19', '13:00 - 14:00', 'approved', NULL, NULL, NULL, '250 ML ROUND CONTAINER NATURAL', '2026-04-20', '13:00', '14:00', 1928, 0, '2026-04-20 08:43:02', 0, 0, NULL, NULL),
(846, '6', 'MACHINE -6(180 TONNAGE SHIBAURA MACHINE 2025)', 'Day Shift', 1028, 0, 0, 0, 0, 0, '', '2026-04-20 06:11:33', '19', '10:41 AM - 11:41 AM', 'pending', NULL, NULL, NULL, NULL, '2026-04-20', NULL, NULL, 0, 0, '2026-04-20 08:43:13', 0, 0, NULL, NULL),
(847, '6', 'MACHINE -6(180 TONNAGE SHIBAURA MACHINE 2025)', 'Day Shift', 2056, 0, 0, 0, 0, 0, '', '2026-04-20 07:11:33', '19', '11:41 AM - 12:41 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-20', NULL, NULL, 0, 0, '2026-04-20 08:43:14', 0, 0, NULL, NULL),
(848, '6', 'MACHINE -6(180 TONNAGE SHIBAURA MACHINE 2025)', 'Day Shift', 3084, 0, 0, 0, 0, 0, '', '2026-04-20 08:11:33', '19', '12:41 PM - 1:41 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-20', NULL, NULL, 0, 0, '2026-04-20 08:43:15', 0, 0, NULL, NULL),
(849, '6', 'MACHINE -6(180 TONNAGE SHIBAURA MACHINE 2025)', 'Day Shift', 4662, 1032, 1, 1, 1, 1, '', '2026-04-20 08:43:34', '19', '13:00 - 14:00', 'approved', NULL, NULL, NULL, '750/1000 ML ROUND LID NATURE', '2026-04-20', '13:00', '14:00', 1032, 0, '2026-04-20 08:43:34', 0, 0, NULL, NULL),
(850, '5', 'MACHINE -5(180 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 1028, 0, 0, 0, 0, 0, '', '2026-04-20 06:10:01', '19', '10:40 AM - 11:40 AM', 'pending', NULL, NULL, NULL, NULL, '2026-04-20', NULL, NULL, 0, 0, '2026-04-20 08:43:43', 0, 0, NULL, NULL),
(851, '5', 'MACHINE -5(180 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 2056, 0, 0, 0, 0, 0, '', '2026-04-20 07:10:01', '19', '11:40 AM - 12:40 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-20', NULL, NULL, 0, 0, '2026-04-20 08:43:44', 0, 0, NULL, NULL),
(852, '5', 'MACHINE -5(180 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 3084, 0, 0, 0, 0, 0, '', '2026-04-20 08:10:01', '19', '12:40 PM - 1:40 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-20', NULL, NULL, 0, 0, '2026-04-20 08:43:45', 0, 0, NULL, NULL),
(853, '5', 'MACHINE -5(180 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 4694, 1030, 1, 1, 1, 1, '', '2026-04-20 08:44:00', '19', '13:00 - 14:00', 'approved', NULL, NULL, NULL, '650 ML REC CONTAINER BLACK', '2026-04-20', '13:00', '14:00', 1030, 0, '2026-04-20 08:44:01', 0, 0, NULL, NULL),
(854, '2', 'MACHINE -2(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 12342, 0, 0, 0, 0, 0, '', '2026-04-20 09:04:31', '19', '1:34 PM - 2:34 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-20', NULL, NULL, 0, 0, '2026-04-20 09:58:20', 0, 0, NULL, NULL),
(855, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 9000, 0, 0, 0, 0, 0, '', '2026-04-20 10:01:01', '19', '2:31 PM - 3:31 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-20', NULL, NULL, 0, 0, '2026-04-20 10:01:01', 0, 0, NULL, NULL),
(856, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 12092, 1648, 1, 1, 1, 1, '', '2026-04-20 10:50:42', '19', '08:00 - 09:00', 'approved', NULL, '8', 'Material loading problem ', '500/650/750/1000ML REC LID NATURAL', '2026-04-20', '08:00', '09:00', 1648, 0, '2026-04-20 10:50:43', 0, 0, NULL, NULL),
(857, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 11176, 684, 1, 1, 1, 1, '', '2026-04-20 10:51:46', '19', '09:00 - 10:00', 'approved', NULL, '39', 'Front door limit switch problem ', '500/650/750/1000ML REC LID NATURAL', '2026-04-20', '09:00', '10:00', 684, 28, '2026-04-20 10:51:47', 0, 0, NULL, NULL),
(858, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 11980, 1452, 1, 1, 1, 1, '', '2026-04-20 10:52:44', '19', '10:00 - 11:00', 'approved', NULL, '15', 'Compressor voltage problem ', '500/650/750/1000ML REC LID NATURAL', '2026-04-20', '10:00', '11:00', 1452, 0, '2026-04-20 10:52:46', 0, 0, NULL, NULL),
(859, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 11928, 1324, 1, 1, 1, 1, '', '2026-04-20 10:54:04', '19', '15:00 - 16:00', 'approved', NULL, '19', 'Single phase ', '500/650/750/1000ML REC LID NATURAL', '2026-04-20', '15:00', '16:00', 1324, 0, '2026-04-20 10:54:05', 0, 0, NULL, NULL),
(860, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 12600, 0, 0, 0, 0, 0, '', '2026-04-20 12:01:01', '19', '4:31 PM - 5:31 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-20', NULL, NULL, 0, 0, '2026-04-20 13:06:26', 0, 0, NULL, NULL),
(861, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 14400, 0, 0, 0, 0, 0, '', '2026-04-20 13:01:01', '19', '5:31 PM - 6:31 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-20', NULL, NULL, 0, 0, '2026-04-20 13:06:26', 0, 0, NULL, NULL),
(862, '9', 'MACHINE -9(250 TONNAGE SHIBAURA MACHINE 2026)', 'Night Shift', 1792, 0, 0, 0, 0, 0, '', '2026-04-20 14:07:55', '19', '6:37 PM - 7:37 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-20', NULL, NULL, 0, 0, '2026-04-20 14:11:48', 0, 0, NULL, NULL),
(863, '9', 'MACHINE -9(250 TONNAGE SHIBAURA MACHINE 2026)', 'Night Shift', 3702, 0, 0, 0, 0, 0, '', '2026-04-20 15:11:48', '19', '7:41 PM - 8:41 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-21', NULL, NULL, 0, 0, '2026-04-21 04:40:01', 0, 0, NULL, NULL),
(864, '9', 'MACHINE -9(250 TONNAGE SHIBAURA MACHINE 2026)', 'Night Shift', 5502, 0, 0, 0, 0, 0, '', '2026-04-20 16:11:48', '19', '8:41 PM - 9:41 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-21', NULL, NULL, 0, 0, '2026-04-21 04:40:02', 0, 0, NULL, NULL),
(865, '9', 'MACHINE -9(250 TONNAGE SHIBAURA MACHINE 2026)', 'Night Shift', 7302, 0, 0, 0, 0, 0, '', '2026-04-20 17:11:48', '19', '9:41 PM - 10:41 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-21', NULL, NULL, 0, 0, '2026-04-21 04:40:03', 0, 0, NULL, NULL),
(866, '9', 'MACHINE -9(250 TONNAGE SHIBAURA MACHINE 2026)', 'Night Shift', 9102, 0, 0, 0, 0, 0, '', '2026-04-20 18:11:48', '19', '10:41 PM - 11:41 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-21', NULL, NULL, 0, 0, '2026-04-21 04:40:04', 0, 0, NULL, NULL),
(867, '9', 'MACHINE -9(250 TONNAGE SHIBAURA MACHINE 2026)', 'Night Shift', 10902, 0, 0, 0, 0, 0, '', '2026-04-20 19:11:48', '19', '11:41 PM - 12:41 AM', 'pending', NULL, NULL, NULL, NULL, '2026-04-21', NULL, NULL, 0, 0, '2026-04-21 04:40:05', 0, 0, NULL, NULL),
(868, '9', 'MACHINE -9(250 TONNAGE SHIBAURA MACHINE 2026)', 'Night Shift', 12702, 0, 0, 0, 0, 0, '', '2026-04-20 20:11:48', '19', '12:41 AM - 1:41 AM', 'pending', NULL, NULL, NULL, NULL, '2026-04-21', NULL, NULL, 0, 0, '2026-04-21 04:40:06', 0, 0, NULL, NULL),
(869, '9', 'MACHINE -9(250 TONNAGE SHIBAURA MACHINE 2026)', 'Night Shift', 29751, 0, 0, 0, 0, 0, '', '2026-04-21 05:40:06', '19', '10:10 AM - 11:10 AM', 'pending', NULL, NULL, NULL, NULL, '2026-04-21', NULL, NULL, 0, 0, '2026-04-21 09:16:09', 0, 0, NULL, NULL),
(870, '9', 'MACHINE -9(250 TONNAGE SHIBAURA MACHINE 2026)', 'Night Shift', 31551, 0, 0, 0, 0, 0, '', '2026-04-21 06:40:06', '19', '11:10 AM - 12:10 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-21', NULL, NULL, 0, 0, '2026-04-21 09:16:10', 0, 0, NULL, NULL),
(871, '9', 'MACHINE -9(250 TONNAGE SHIBAURA MACHINE 2026)', 'Night Shift', 33351, 0, 0, 0, 0, 0, '', '2026-04-21 07:40:06', '19', '12:10 PM - 1:10 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-21', NULL, NULL, 0, 0, '2026-04-21 09:16:11', 0, 0, NULL, NULL),
(872, '9', 'MACHINE -9(250 TONNAGE SHIBAURA MACHINE 2026)', 'Night Shift', 35151, 0, 0, 0, 0, 0, '', '2026-04-21 08:40:06', '19', '1:10 PM - 2:10 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-21', NULL, NULL, 0, 0, '2026-04-21 09:16:12', 0, 0, NULL, NULL),
(873, '8', 'MACHINE -8(250 TONNAGE SHIBAURA MACHINE 2025)', 'Day Shift', 5142, 0, 0, 0, 0, 0, '', '2026-04-20 10:14:25', '19', '2:44 PM - 3:44 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-21', NULL, NULL, 0, 0, '2026-04-21 09:16:58', 0, 0, NULL, NULL),
(874, '8', 'MACHINE -8(250 TONNAGE SHIBAURA MACHINE 2025)', 'Day Shift', 6170, 0, 0, 0, 0, 0, '', '2026-04-20 11:14:25', '19', '3:44 PM - 4:44 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-21', NULL, NULL, 0, 0, '2026-04-21 09:16:59', 0, 0, NULL, NULL),
(875, '8', 'MACHINE -8(250 TONNAGE SHIBAURA MACHINE 2025)', 'Day Shift', 7200, 0, 0, 0, 0, 0, '', '2026-04-20 12:14:25', '19', '4:44 PM - 5:44 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-21', NULL, NULL, 0, 0, '2026-04-21 09:17:00', 0, 0, NULL, NULL),
(876, '8', 'MACHINE -8(250 TONNAGE SHIBAURA MACHINE 2025)', 'Day Shift', 8228, 0, 0, 0, 0, 0, '', '2026-04-20 13:14:25', '19', '5:44 PM - 6:44 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-21', NULL, NULL, 0, 0, '2026-04-21 09:17:01', 0, 0, NULL, NULL),
(877, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 16200, 0, 0, 0, 0, 0, '', '2026-04-20 14:01:01', '19', '6:31 PM - 7:31 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-21', NULL, NULL, 0, 0, '2026-04-21 13:46:05', 0, 0, NULL, NULL),
(878, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 18000, 0, 0, 0, 0, 0, '', '2026-04-20 15:01:01', '19', '7:31 PM - 8:31 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-21', NULL, NULL, 0, 0, '2026-04-21 13:46:06', 0, 0, NULL, NULL),
(879, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 19800, 0, 0, 0, 0, 0, '', '2026-04-20 16:01:01', '19', '8:31 PM - 9:31 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-21', NULL, NULL, 0, 0, '2026-04-21 13:46:07', 0, 0, NULL, NULL),
(880, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 21600, 0, 0, 0, 0, 0, '', '2026-04-20 17:01:01', '19', '9:31 PM - 10:31 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-21', NULL, NULL, 0, 0, '2026-04-21 13:46:08', 0, 0, NULL, NULL),
(881, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 23400, 0, 0, 0, 0, 0, '', '2026-04-20 18:01:01', '19', '10:31 PM - 11:31 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-21', NULL, NULL, 0, 0, '2026-04-21 13:46:09', 0, 0, NULL, NULL),
(882, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 25200, 0, 0, 0, 0, 0, '', '2026-04-20 19:01:01', '19', '11:31 PM - 12:31 AM', 'pending', NULL, NULL, NULL, NULL, '2026-04-21', NULL, NULL, 0, 0, '2026-04-21 13:46:10', 0, 0, NULL, NULL),
(883, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 27000, 0, 0, 0, 0, 0, '', '2026-04-20 20:01:01', '19', '12:31 AM - 1:31 AM', 'pending', NULL, NULL, NULL, NULL, '2026-04-21', NULL, NULL, 0, 0, '2026-04-21 13:46:11', 0, 0, NULL, NULL),
(884, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 28800, 0, 0, 0, 0, 0, '', '2026-04-20 21:01:01', '19', '1:31 AM - 2:31 AM', 'pending', NULL, NULL, NULL, NULL, '2026-04-21', NULL, NULL, 0, 0, '2026-04-21 13:46:12', 0, 0, NULL, NULL),
(885, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 30600, 0, 0, 0, 0, 0, '', '2026-04-20 22:01:01', '19', '2:31 AM - 3:31 AM', 'pending', NULL, NULL, NULL, NULL, '2026-04-21', NULL, NULL, 0, 0, '2026-04-21 13:46:13', 0, 0, NULL, NULL),
(886, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 32400, 0, 0, 0, 0, 0, '', '2026-04-20 23:01:01', '19', '3:31 AM - 4:31 AM', 'pending', NULL, NULL, NULL, NULL, '2026-04-21', NULL, NULL, 0, 0, '2026-04-21 13:46:14', 0, 0, NULL, NULL),
(887, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 34200, 0, 0, 0, 0, 0, '', '2026-04-21 00:01:01', '19', '4:31 AM - 5:31 AM', 'pending', NULL, NULL, NULL, NULL, '2026-04-21', NULL, NULL, 0, 0, '2026-04-21 13:46:15', 0, 0, NULL, NULL),
(888, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 36000, 0, 0, 0, 0, 0, '', '2026-04-21 01:01:01', '19', '5:31 AM - 6:31 AM', 'pending', NULL, NULL, NULL, NULL, '2026-04-21', NULL, NULL, 0, 0, '2026-04-21 13:46:16', 0, 0, NULL, NULL),
(889, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 37800, 0, 0, 0, 0, 0, '', '2026-04-21 02:01:01', '19', '6:31 AM - 7:31 AM', 'pending', NULL, NULL, NULL, NULL, '2026-04-21', NULL, NULL, 0, 0, '2026-04-21 13:46:17', 0, 0, NULL, NULL),
(890, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 39600, 0, 0, 0, 0, 0, '', '2026-04-21 03:01:01', '19', '7:31 AM - 8:31 AM', 'pending', NULL, NULL, NULL, NULL, '2026-04-21', NULL, NULL, 0, 0, '2026-04-21 13:46:18', 0, 0, NULL, NULL),
(891, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 41400, 0, 0, 0, 0, 0, '', '2026-04-21 04:01:01', '19', '8:31 AM - 9:31 AM', 'pending', NULL, NULL, NULL, NULL, '2026-04-21', NULL, NULL, 0, 0, '2026-04-21 13:46:19', 0, 0, NULL, NULL),
(892, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 43200, 0, 0, 0, 0, 0, '', '2026-04-21 05:01:01', '19', '9:31 AM - 10:31 AM', 'pending', NULL, NULL, NULL, NULL, '2026-04-21', NULL, NULL, 0, 0, '2026-04-21 13:46:20', 0, 0, NULL, NULL),
(893, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 45000, 0, 0, 0, 0, 0, '', '2026-04-21 06:01:01', '19', '10:31 AM - 11:31 AM', 'pending', NULL, NULL, NULL, NULL, '2026-04-21', NULL, NULL, 0, 0, '2026-04-21 13:46:21', 0, 0, NULL, NULL),
(894, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 46800, 0, 0, 0, 0, 0, '', '2026-04-21 07:01:01', '19', '11:31 AM - 12:31 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-21', NULL, NULL, 0, 0, '2026-04-21 13:46:22', 0, 0, NULL, NULL),
(895, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 48600, 0, 0, 0, 0, 0, '', '2026-04-21 08:01:01', '19', '12:31 PM - 1:31 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-21', NULL, NULL, 0, 0, '2026-04-21 13:46:23', 0, 0, NULL, NULL),
(896, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 50400, 0, 0, 0, 0, 0, '', '2026-04-21 09:01:01', '19', '1:31 PM - 2:31 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-21', NULL, NULL, 0, 0, '2026-04-21 13:46:24', 0, 0, NULL, NULL),
(897, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 52200, 0, 0, 0, 0, 0, '', '2026-04-21 10:01:01', '19', '2:31 PM - 3:31 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-21', NULL, NULL, 0, 0, '2026-04-21 13:46:25', 0, 0, NULL, NULL),
(898, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 54000, 0, 0, 0, 0, 0, '', '2026-04-21 11:01:01', '19', '3:31 PM - 4:31 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-21', NULL, NULL, 0, 0, '2026-04-21 13:46:26', 0, 0, NULL, NULL),
(899, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 55800, 0, 0, 0, 0, 0, '', '2026-04-21 12:01:01', '19', '4:31 PM - 5:31 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-21', NULL, NULL, 0, 0, '2026-04-21 13:46:27', 0, 0, NULL, NULL),
(900, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 57600, 0, 0, 0, 0, 0, '', '2026-04-21 13:01:01', '19', '5:31 PM - 6:31 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-21', NULL, NULL, 0, 0, '2026-04-21 13:46:28', 0, 0, NULL, NULL),
(901, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 60760, 0, 0, 0, 0, 0, '', '2026-04-21 14:46:28', '19', '7:16 PM - 8:16 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-21', NULL, NULL, 0, 0, '2026-04-21 15:49:27', 0, 0, NULL, NULL),
(902, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 62560, 0, 0, 0, 0, 0, '', '2026-04-21 15:46:28', '19', '8:16 PM - 9:16 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-21', NULL, NULL, 0, 0, '2026-04-21 15:49:28', 0, 0, NULL, NULL),
(903, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 27100, 1900, 1, 1, 1, 1, '', '2026-04-21 15:50:56', '19', '11:31 PM - 12:31 AM', 'approved', NULL, NULL, NULL, '500/650/750/1000ML REC LID NATURAL', '2026-04-20', '11:31 PM', '12:31 AM', 1900, 0, '2026-04-21 15:50:57', 0, 0, NULL, NULL),
(904, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 36100, 1900, 1, 1, 1, 1, '', '2026-04-21 15:51:41', '19', '4:31 AM - 5:31 AM', 'approved', NULL, NULL, NULL, '500/650/750/1000ML REC LID NATURAL', '2026-04-21', '4:31 AM', '5:31 AM', 1900, 0, '2026-04-21 15:51:41', 0, 0, NULL, NULL),
(905, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 64512, 0, 0, 0, 0, 0, '', '2026-04-21 16:51:41', '18', '9:21 PM - 10:21 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-22', NULL, NULL, 0, 0, '2026-04-22 02:56:02', 0, 0, NULL, NULL),
(906, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 66312, 0, 0, 0, 0, 0, '', '2026-04-21 17:51:41', '18', '10:21 PM - 11:21 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-22', NULL, NULL, 0, 0, '2026-04-22 02:56:03', 0, 0, NULL, NULL),
(907, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 68112, 0, 0, 0, 0, 0, '', '2026-04-21 18:51:41', '18', '11:21 PM - 12:21 AM', 'pending', NULL, NULL, NULL, NULL, '2026-04-22', NULL, NULL, 0, 0, '2026-04-22 02:56:04', 0, 0, NULL, NULL),
(908, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 69912, 0, 0, 0, 0, 0, '', '2026-04-21 19:51:41', '18', '12:21 AM - 1:21 AM', 'pending', NULL, NULL, NULL, NULL, '2026-04-22', NULL, NULL, 0, 0, '2026-04-22 02:56:05', 0, 0, NULL, NULL),
(909, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 71712, 0, 0, 0, 0, 0, '', '2026-04-21 20:51:41', '18', '1:21 AM - 2:21 AM', 'pending', NULL, NULL, NULL, NULL, '2026-04-22', NULL, NULL, 0, 0, '2026-04-22 02:56:06', 0, 0, NULL, NULL),
(910, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 73512, 0, 0, 0, 0, 0, '', '2026-04-21 21:51:41', '18', '2:21 AM - 3:21 AM', 'pending', NULL, NULL, NULL, NULL, '2026-04-22', NULL, NULL, 0, 0, '2026-04-22 02:56:07', 0, 0, NULL, NULL),
(911, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 75312, 0, 0, 0, 0, 0, '', '2026-04-21 22:51:41', '18', '3:21 AM - 4:21 AM', 'pending', NULL, NULL, NULL, NULL, '2026-04-22', NULL, NULL, 0, 0, '2026-04-22 02:56:08', 0, 0, NULL, NULL),
(912, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 77112, 0, 0, 0, 0, 0, '', '2026-04-21 23:51:41', '18', '4:21 AM - 5:21 AM', 'pending', NULL, NULL, NULL, NULL, '2026-04-22', NULL, NULL, 0, 0, '2026-04-22 02:56:09', 0, 0, NULL, NULL),
(913, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 78912, 0, 0, 0, 0, 0, '', '2026-04-22 00:51:41', '18', '5:21 AM - 6:21 AM', 'pending', NULL, NULL, NULL, NULL, '2026-04-22', NULL, NULL, 0, 0, '2026-04-22 02:56:10', 0, 0, NULL, NULL),
(914, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 80712, 0, 0, 0, 0, 0, '', '2026-04-22 01:51:41', '18', '6:21 AM - 7:21 AM', 'pending', NULL, NULL, NULL, NULL, '2026-04-22', NULL, NULL, 0, 0, '2026-04-22 02:56:11', 0, 0, NULL, NULL),
(915, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 82512, 0, 0, 0, 0, 0, '', '2026-04-22 02:51:41', '18', '7:21 AM - 8:21 AM', 'pending', NULL, NULL, NULL, NULL, '2026-04-22', NULL, NULL, 0, 0, '2026-04-22 02:56:12', 0, 0, NULL, NULL),
(916, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 4112, 0, 0, 0, 0, 0, '', '2026-04-22 05:19:24', '18', '9:49 AM - 10:49 AM', 'pending', NULL, NULL, NULL, NULL, '2026-04-22', NULL, NULL, 0, 0, '2026-04-22 07:06:00', 0, 0, NULL, NULL),
(917, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 6168, 0, 0, 0, 0, 0, '', '2026-04-22 06:19:24', '18', '10:49 AM - 11:49 AM', 'pending', NULL, NULL, NULL, NULL, '2026-04-22', NULL, NULL, 0, 0, '2026-04-22 07:06:01', 0, 0, NULL, NULL),
(918, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 3956, 1900, 1, 1, 1, 1, '', '2026-04-22 07:06:38', '18', '9:49 AM - 10:49 AM', 'approved', NULL, NULL, NULL, '500/650/750/1000ML REC LID NATURAL', '2026-04-22', '9:49 AM', '10:49 AM', 1900, 0, '2026-04-22 07:06:38', 0, 0, NULL, NULL),
(919, '4', 'MACHINE -4(180 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 1028, 0, 0, 0, 0, 0, '', '2026-04-22 04:24:30', '18', '8:54 AM - 9:54 AM', 'pending', NULL, NULL, NULL, NULL, '2026-04-22', NULL, NULL, 0, 0, '2026-04-22 08:05:46', 0, 0, NULL, NULL),
(920, '4', 'MACHINE -4(180 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 2056, 0, 0, 0, 0, 0, '', '2026-04-22 05:24:30', '18', '9:54 AM - 10:54 AM', 'pending', NULL, NULL, NULL, NULL, '2026-04-22', NULL, NULL, 0, 0, '2026-04-22 08:05:47', 0, 0, NULL, NULL),
(921, '4', 'MACHINE -4(180 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 3084, 0, 0, 0, 0, 0, '', '2026-04-22 06:24:30', '18', '10:54 AM - 11:54 AM', 'pending', NULL, NULL, NULL, NULL, '2026-04-22', NULL, NULL, 0, 0, '2026-04-22 08:05:48', 0, 0, NULL, NULL),
(922, '4', 'MACHINE -4(180 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 4114, 0, 0, 0, 0, 0, '', '2026-04-22 07:24:30', '18', '11:54 AM - 12:54 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-22', NULL, NULL, 0, 0, '2026-04-22 08:05:49', 0, 0, NULL, NULL),
(923, '6', 'MACHINE -6(180 TONNAGE SHIBAURA MACHINE 2025)', 'Day Shift', 2056, 0, 0, 0, 0, 0, '', '2026-04-22 09:05:41', '18', '1:35 PM - 2:35 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-22', NULL, NULL, 0, 0, '2026-04-22 10:25:45', 0, 0, NULL, NULL),
(924, '6', 'MACHINE -6(180 TONNAGE SHIBAURA MACHINE 2025)', 'Day Shift', 3084, 0, 0, 0, 0, 0, '', '2026-04-22 10:05:41', '18', '2:35 PM - 3:35 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-22', NULL, NULL, 0, 0, '2026-04-22 10:25:46', 0, 0, NULL, NULL),
(925, '9', 'MACHINE -9(250 TONNAGE SHIBAURA MACHINE 2026)', 'Day Shift', 1800, 0, 0, 0, 0, 0, '', '2026-04-22 08:54:42', '19', '1:24 PM - 2:24 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-22', NULL, NULL, 0, 0, '2026-04-22 10:31:33', 0, 0, NULL, NULL),
(926, '9', 'MACHINE -9(250 TONNAGE SHIBAURA MACHINE 2026)', 'Day Shift', 3600, 0, 0, 0, 0, 0, '', '2026-04-22 09:54:42', '19', '2:24 PM - 3:24 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-22', NULL, NULL, 0, 0, '2026-04-22 10:31:34', 0, 0, NULL, NULL),
(927, '9', 'MACHINE -9(250 TONNAGE SHIBAURA MACHINE 2026)', 'Day Shift', 1000, 1000, 1, 1, 1, 1, '', '2026-04-22 10:31:53', '19', '1:24 PM - 2:24 PM', 'approved', NULL, '0', 'No', '2test lid', '2026-04-22', '1:24 PM', '2:24 PM', 1000, 0, '2026-04-22 10:31:54', 0, 0, NULL, NULL),
(928, '9', 'MACHINE -9(250 TONNAGE SHIBAURA MACHINE 2026)', 'Day Shift', 4600, 1000, 1, 1, 1, 1, '', '2026-04-22 10:32:13', '19', '2:24 PM - 3:24 PM', 'approved', NULL, '0', 'No', '2test lid', '2026-04-22', '2:24 PM', '3:24 PM', 1000, 0, '2026-04-22 10:32:14', 0, 0, NULL, NULL),
(929, '10', 'MACHINE -10(180 TONNAGE SHIBAURA MACHINE 2026)', 'Day Shift', 1800, 0, 0, 0, 0, 0, '', '2026-04-22 08:52:57', '19', '1:22 PM - 2:22 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-22', NULL, NULL, 0, 0, '2026-04-22 10:32:26', 0, 0, NULL, NULL),
(930, '10', 'MACHINE -10(180 TONNAGE SHIBAURA MACHINE 2026)', 'Day Shift', 3600, 0, 0, 0, 0, 0, '', '2026-04-22 09:52:57', '19', '2:22 PM - 3:22 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-22', NULL, NULL, 0, 0, '2026-04-22 10:32:27', 0, 0, NULL, NULL),
(931, '10', 'MACHINE -10(180 TONNAGE SHIBAURA MACHINE 2026)', 'Day Shift', 1000, 1000, 1, 1, 1, 1, '', '2026-04-22 10:32:36', '19', '1:22 PM - 2:22 PM', 'approved', NULL, '0', 'No', '3test container', '2026-04-22', '1:22 PM', '2:22 PM', 1000, 0, '2026-04-22 10:32:37', 0, 0, NULL, NULL),
(932, '10', 'MACHINE -10(180 TONNAGE SHIBAURA MACHINE 2026)', 'Day Shift', 4600, 1000, 1, 1, 1, 1, '', '2026-04-22 10:32:50', '19', '2:22 PM - 3:22 PM', 'approved', NULL, '0', 'No', '3test container', '2026-04-22', '2:22 PM', '3:22 PM', 1000, 0, '2026-04-22 10:32:52', 0, 0, NULL, NULL),
(933, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 9848, 0, 0, 0, 0, 0, '', '2026-04-22 08:06:38', '18', '12:36 PM - 1:36 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-22', NULL, NULL, 0, 0, '2026-04-22 11:19:38', 0, 0, NULL, NULL),
(934, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 11904, 0, 0, 0, 0, 0, '', '2026-04-22 09:06:38', '18', '1:36 PM - 2:36 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-22', NULL, NULL, 0, 0, '2026-04-22 11:19:38', 0, 0, NULL, NULL),
(935, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 13960, 0, 0, 0, 0, 0, '', '2026-04-22 10:06:38', '18', '2:36 PM - 3:36 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-22', NULL, NULL, 0, 0, '2026-04-22 11:19:40', 0, 0, NULL, NULL),
(936, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 16016, 0, 0, 0, 0, 0, '', '2026-04-22 11:06:38', '18', '3:36 PM - 4:36 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-22', NULL, NULL, 0, 0, '2026-04-22 11:19:41', 0, 0, NULL, NULL),
(937, '2', 'MACHINE -2(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 6168, 0, 0, 0, 0, 0, '', '2026-04-22 05:21:57', '18', '9:51 AM - 10:51 AM', 'pending', NULL, NULL, NULL, NULL, '2026-04-22', NULL, NULL, 0, 0, '2026-04-22 11:20:11', 0, 0, NULL, NULL),
(938, '2', 'MACHINE -2(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 9252, 0, 0, 0, 0, 0, '', '2026-04-22 06:21:57', '18', '10:51 AM - 11:51 AM', 'pending', NULL, NULL, NULL, NULL, '2026-04-22', NULL, NULL, 0, 0, '2026-04-22 11:20:16', 0, 0, NULL, NULL),
(939, '2', 'MACHINE -2(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 12342, 0, 0, 0, 0, 0, '', '2026-04-22 07:21:57', '18', '11:51 AM - 12:51 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-22', NULL, NULL, 0, 0, '2026-04-22 11:20:17', 0, 0, NULL, NULL),
(940, '2', 'MACHINE -2(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 15426, 0, 0, 0, 0, 0, '', '2026-04-22 08:21:57', '18', '12:51 PM - 1:51 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-22', NULL, NULL, 0, 0, '2026-04-22 11:20:18', 0, 0, NULL, NULL),
(941, '2', 'MACHINE -2(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 18510, 0, 0, 0, 0, 0, '', '2026-04-22 09:21:57', '18', '1:51 PM - 2:51 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-22', NULL, NULL, 0, 0, '2026-04-22 11:20:19', 0, 0, NULL, NULL),
(942, '2', 'MACHINE -2(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 21600, 0, 0, 0, 0, 0, '', '2026-04-22 10:21:57', '18', '2:51 PM - 3:51 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-22', NULL, NULL, 0, 0, '2026-04-22 11:20:20', 0, 0, NULL, NULL),
(943, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 8068, 1900, 1, 1, 1, 1, '', '2026-04-22 11:26:59', '18', '10:49 AM - 11:49 AM', 'approved', NULL, '0', 'No', '500/650/750/1000ML REC LID NATURAL', '2026-04-22', '10:49 AM', '11:49 AM', 1900, 0, '2026-04-22 11:26:59', 0, 0, NULL, NULL),
(944, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 13804, 1900, 1, 1, 1, 1, '', '2026-04-22 11:27:29', '18', '1:36 PM - 2:36 PM', 'approved', NULL, NULL, NULL, '500/650/750/1000ML REC LID NATURAL', '2026-04-22', '1:36 PM', '2:36 PM', 1900, 0, '2026-04-22 11:27:30', 0, 0, NULL, NULL),
(945, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 11748, 1900, 1, 1, 1, 1, '', '2026-04-22 11:27:38', '18', '12:36 PM - 1:36 PM', 'approved', NULL, NULL, NULL, '500/650/750/1000ML REC LID NATURAL', '2026-04-22', '12:36 PM', '1:36 PM', 1900, 0, '2026-04-22 11:27:38', 0, 0, NULL, NULL),
(946, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 17916, 1900, 1, 1, 1, 1, '', '2026-04-22 11:27:49', '18', '3:36 PM - 4:36 PM', 'approved', NULL, NULL, NULL, '500/650/750/1000ML REC LID NATURAL', '2026-04-22', '3:36 PM', '4:36 PM', 1900, 0, '2026-04-22 11:27:50', 0, 0, NULL, NULL),
(947, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 15860, 1900, 0, 0, 0, 0, '', '2026-04-22 11:27:57', '18', '2:36 PM - 3:36 PM', 'approved', NULL, NULL, NULL, '500/650/750/1000ML REC LID NATURAL', '2026-04-22', '2:36 PM', '3:36 PM', 1900, 0, '2026-04-22 11:27:57', 0, 0, NULL, NULL),
(948, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', NULL, 0, 1000, 0, 0, 0, 0, 'No', '2026-04-22 11:31:29', NULL, '00:00 - 01:00', 'approved', NULL, NULL, NULL, NULL, '2026-04-22', '00:00', '01:00', 1000, 0, '2026-04-22 11:31:29', 0, 1, 'Production Head', '2026-04-22 11:31:28'),
(949, '1', 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 18844, 1900, 1, 1, 1, 1, '', '2026-04-22 11:33:50', '18', '15:00 - 16:00', 'approved', NULL, NULL, NULL, '500/650/750/1000ML REC LID NATURAL', '2026-04-22', '15:00', '16:00', 1900, 0, '2026-04-22 11:33:50', 0, 0, NULL, NULL),
(950, '3', 'MACHINE -3(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 16912, 0, 0, 0, 0, 0, '', '2026-04-22 04:23:28', '18', '8:53 AM - 9:53 AM', 'pending', NULL, NULL, NULL, NULL, '2026-04-22', NULL, NULL, 0, 0, '2026-04-22 11:39:54', 0, 0, NULL, NULL),
(951, '3', 'MACHINE -3(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 18812, 1900, 1, 1, 1, 1, '', '2026-04-22 11:43:23', '18', '8:53 AM - 9:53 AM', 'approved', NULL, '0', 'No', '250 ML ROUND CONTAINER NATURAL', '2026-04-22', '8:53 AM', '9:53 AM', 1900, 0, '2026-04-22 11:43:24', 0, 0, NULL, NULL),
(952, '4', 'MACHINE -4(180 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 8440, 0, 0, 0, 0, 0, '', '2026-04-22 08:24:30', '18', '12:54 PM - 1:54 PM', 'pending', NULL, NULL, NULL, NULL, '2026-04-22', NULL, NULL, 0, 0, '2026-04-22 11:43:49', 0, 0, NULL, NULL),
(953, '5', 'MACHINE -5(180 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 8422, 0, 0, 0, 0, 0, '', '2026-04-22 04:25:33', '18', '8:55 AM - 9:55 AM', 'pending', NULL, NULL, NULL, NULL, '2026-04-22', NULL, NULL, 0, 0, '2026-04-22 11:44:01', 0, 0, NULL, NULL),
(954, '5', 'MACHINE -5(180 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 10222, 1800, 1, 1, 1, 1, '', '2026-04-22 11:44:31', '18', '8:55 AM - 9:55 AM', 'approved', NULL, '0', 'No', '650 ML REC CONTAINER BLACK', '2026-04-22', '8:55 AM', '9:55 AM', 1800, 0, '2026-04-22 11:44:32', 0, 0, NULL, NULL),
(955, '2', 'MACHINE -2(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 26862, 0, 0, 0, 0, 0, '', '2026-04-22 11:21:57', '21', '15:00 - 16:00', 'pending', NULL, NULL, NULL, NULL, '2026-04-22', NULL, NULL, 0, 0, '2026-04-22 13:32:45', 0, 0, NULL, NULL),
(956, '2', 'MACHINE -2(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 26862, 0, 0, 0, 0, 0, '', '2026-04-22 12:21:57', '21', '16:00 - 17:00', 'pending', NULL, NULL, NULL, NULL, '2026-04-22', NULL, NULL, 0, 0, '2026-04-22 13:32:46', 0, 0, NULL, NULL),
(957, '2', 'MACHINE -2(250 TONNAGE SHIBAURA MACHINE 2024)', 'Day Shift', 26862, 0, 0, 0, 0, 0, '', '2026-04-22 13:21:57', '21', '17:00 - 18:00', 'pending', NULL, NULL, NULL, NULL, '2026-04-22', NULL, NULL, 0, 0, '2026-04-22 13:32:47', 0, 0, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `inventory_colors`
--

CREATE TABLE `inventory_colors` (
  `id` int(11) NOT NULL,
  `color_name` varchar(512) NOT NULL,
  `stock_qty_kgs` decimal(15,2) DEFAULT 0.00,
  `unit` varchar(512) DEFAULT 'KG',
  `is_deleted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inventory_colors`
--

INSERT INTO `inventory_colors` (`id`, `color_name`, `stock_qty_kgs`, `unit`, `is_deleted`) VALUES
(1, 'ALOK BLUE', 0.00, 'KG', 0),
(2, 'LINGAM WHITE', 75.00, 'KG', 0),
(3, 'LINGAM BLACK', 444.60, 'KG', 0),
(4, 'LINGAM  RED', 23.20, 'KG', 0);

-- --------------------------------------------------------

--
-- Table structure for table `inventory_finished_product`
--

CREATE TABLE `inventory_finished_product` (
  `id` int(11) NOT NULL,
  `product_id` int(11) DEFAULT NULL,
  `product_name` varchar(512) NOT NULL,
  `stock_boxes` int(11) DEFAULT 0,
  `pieces_per_box` int(11) DEFAULT 0,
  `total_pieces` int(11) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp(),
  `minimum_stock_level` int(11) DEFAULT 0,
  `unit_weight_gm` decimal(15,2) DEFAULT 0.00,
  `is_deleted` tinyint(1) DEFAULT 0,
  `weight` decimal(15,2) DEFAULT NULL,
  `batch_number` varchar(512) DEFAULT NULL,
  `packing_sticker_id` int(11) DEFAULT NULL,
  `packing_material_id` int(11) DEFAULT NULL,
  `packing_material_quantity` decimal(15,2) DEFAULT NULL,
  `status` varchar(512) DEFAULT 'Active',
  `box_size` varchar(255) DEFAULT NULL,
  `color` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inventory_materials`
--

CREATE TABLE `inventory_materials` (
  `id` int(11) NOT NULL,
  `material_name` varchar(512) NOT NULL,
  `opening_stock` decimal(10,2) DEFAULT 0.00,
  `used_stock` decimal(10,2) DEFAULT 0.00,
  `minimum_stock_level` decimal(10,2) DEFAULT 10.00,
  `unit` varchar(20) DEFAULT 'KG',
  `closing_stock` decimal(10,2) DEFAULT 0.00,
  `vendor_name` varchar(512) DEFAULT NULL,
  `vendor_price` decimal(15,2) DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inventory_materials`
--

INSERT INTO `inventory_materials` (`id`, `material_name`, `opening_stock`, `used_stock`, `minimum_stock_level`, `unit`, `closing_stock`, `vendor_name`, `vendor_price`, `is_deleted`) VALUES
(2, 'RELIANCE AM 650', 22850.00, 0.00, 10.00, 'KG', 21649.00, NULL, NULL, 0),
(3, 'RELIANCE SRM 100', 2700.00, 0.00, 10.00, 'KG', 2580.00, NULL, NULL, 0),
(4, 'RELIANCE B 650N', 4950.00, 0.00, 10.00, 'KG', 4829.00, NULL, NULL, 0),
(5, 'MRPL', 7425.00, 20.00, 10.00, 'KG', 7420.00, NULL, NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `inventory_molds`
--

CREATE TABLE `inventory_molds` (
  `id` int(11) NOT NULL,
  `mold_name` varchar(512) NOT NULL,
  `cavity_options` varchar(512) DEFAULT NULL,
  `stock_count` int(11) DEFAULT 0,
  `cavity_count` int(11) DEFAULT 1,
  `cavity_weights` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT '[]' CHECK (json_valid(`cavity_weights`)),
  `total_weight` decimal(15,2) DEFAULT 0.00,
  `unit` varchar(512) DEFAULT 'KG',
  `is_deleted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inventory_molds`
--

INSERT INTO `inventory_molds` (`id`, `mold_name`, `cavity_options`, `stock_count`, `cavity_count`, `cavity_weights`, `total_weight`, `unit`, `is_deleted`) VALUES
(1, '50ML ROUND Sauce Cup Natural 2025', '', 0, 6, '[4.42, 4.45, 4.5, 4.38, 4.49, 4.47]', 26.71, 'PCS', 0),
(2, '100 ML ROUND LID NATURE 2024', '', 0, 8, '[2.21, 2.41, 2.32, 2.26, 2.25, 2.4, 2.32, 2.3]', 18.47, 'PCS', 0),
(3, '100 ML ROUND LID WHITE 2024', '', 0, 8, '[2.3, 2.45, 2.35, 2.31, 2.3, 2.4, 2.35, 2.4]', 18.86, 'PCS', 0),
(4, '100 ML ROUND CONTAINER NATURAL 2024', '', 0, 8, '[4.3, 4.4, 4.3, 4.2, 4.3, 4.3, 4.3, 4.3]', 34.40, 'PCS', 0),
(5, '100 ML ROUND CONTAINER BLACK 2024', '', 0, 8, '[4.35, 4.32, 4.39, 4.21, 4.33, 4.4, 4.3, 4.4]', 34.70, 'PCS', 0),
(6, '250/500 ML ROUND LID NATURE 2024', '', 0, 6, '[5.7, 5.6, 5.7, 5.8, 5.2, 5.5]', 33.50, 'PCS', 0),
(7, '250/500 ML ROUND LID RED 2024', '', 0, 6, '[5.7, 5.7, 5.8, 5.9, 5.2, 5.6]', 33.90, 'PCS', 0),
(8, '250 ML ROUND CONTAINER NATURAL 2024', '', 0, 4, '[8.9, 8.8, 8.7, 8.8]', 35.20, 'PCS', 0),
(9, '250 ML ROUND CONTAINER BLACK 2024', '', 0, 4, '[8.9, 9.02, 9.03, 9.05]', 36.00, 'PCS', 0),
(10, '250 ML ROUND CONTAINER WHITE 2024', '', 0, 4, '[9, 9.1, 8.9, 9.1]', 36.10, 'PCS', 0),
(11, '500 ML ROUND CONTAINER NATURAL 2024', '', 0, 2, '[12.6, 12.8]', 25.40, 'PCS', 0),
(13, '500 ML ROUND CONTAINER BLACK 2024', '', 0, 2, '[12.72, 12.75]', 25.47, 'PCS', 0),
(14, '500 ML ROUND CONTAINER WHITE 2024', '', 0, 2, '[12.8, 12.85]', 25.65, 'PCS', 0),
(15, '500 ML ROUND CONTAINER NATURAL 2025', '', 0, 2, '[11.7, 11.9]', 23.60, 'PCS', 0),
(16, '500 ML ROUND CONTAINER WHITE 2025', '', 0, 2, '[11.85, 11.98]', 23.83, 'PCS', 0),
(17, '500 ML ROUND CONTAINER BLACK 2025', '', 0, 2, '[11.78, 11.9]', 23.68, 'PCS', 0),
(18, '750 ML ROUND CONTAINER NATURAL 2025', '', 0, 2, '[18.1, 18.2]', 36.30, 'PCS', 0),
(19, '750 ML ROUND CONTAINER BLACK 2025', '', 0, 2, '[18, 18.3]', 36.30, 'PCS', 0),
(20, '750 ML ROUND CONTAINER WHITE 2025', '', 0, 2, '[18.2, 18.3]', 36.50, 'PCS', 0),
(21, '1000 ML ROUND CONTAINER NATURAL 2025', '', 0, 2, '[19.6, 19.5]', 39.10, 'PCS', 0),
(22, '1000 ML ROUND CONTAINER BLACK 2025', '', 0, 2, '[19.6, 19.6]', 39.20, 'PCS', 0),
(23, '1000 ML ROUND CONTAINER WHITE 2025', '', 0, 2, '[19.7, 19.8]', 39.50, 'PCS', 0),
(24, '750/1000 ML ROUND LID NATURE 2025', '', 0, 2, '[8.5, 8.6]', 17.10, 'PCS', 0),
(25, '650 ML REC CONTAINER NATURAL 2026', '', 0, 2, '[14.7, 14.7]', 29.40, 'PCS', 0),
(26, '650 ML REC CONTAINER BLACK 2026', '', 0, 2, '[14.8, 14.9]', 29.70, 'PCS', 0),
(27, '650 ML REC CONTAINER WHITE 2026', '', 0, 2, '[15.1, 14.9]', 30.00, 'PCS', 0),
(28, '750 ML REC CONTAINER NATURAL 2024', '', 0, 2, '[16.3, 16.5]', 32.80, 'PCS', 0),
(29, '750 ML REC CONTAINER BLACK 2024', '', 0, 2, '[16.4, 16.5]', 32.90, 'PCS', 0),
(30, '750 ML REC CONTAINER WHITE 2024', '', 0, 2, '[16.6, 16.8]', 33.40, 'PCS', 0),
(31, '750 ML REC CONTAINER NATURAL 2025', '', 0, 2, '[17.2, 17.2]', 34.40, 'PCS', 0),
(32, '750 ML REC CONTAINER BLACK 2025', '', 0, 2, '[17.2, 17.3]', 34.50, 'PCS', 0),
(33, '750 ML REC CONTAINER WHITE 2025', '', 0, 2, '[17.5, 17.6]', 35.10, 'PCS', 0),
(34, '500/650/750/1000ML REC LID NATURAL 2025', '', 0, 4, '[10.49, 10.38, 11.1, 10.5]', 42.47, 'PCS', 0),
(35, '250ML ROUND CUP NATURAL 2026', '', 0, 4, '[8.4, 8.4, 8.4, 8.5]', 33.70, 'PCS', 0),
(36, '250/500 ML ROUND LID BLUE 2024', '', 0, 6, '[5.7, 5.7, 5.8, 5.9, 5.2, 5.6]', 33.90, 'KG', 0),
(37, 'test', '', 0, 1, '[1]', 1.00, 'KG', 0);

-- --------------------------------------------------------

--
-- Table structure for table `inventory_others`
--

CREATE TABLE `inventory_others` (
  `id` int(11) NOT NULL,
  `item_name` varchar(512) NOT NULL,
  `stock_qty` decimal(15,2) DEFAULT 0.00,
  `unit` varchar(512) DEFAULT 'KG',
  `is_deleted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `inventory_packing`
--

CREATE TABLE `inventory_packing` (
  `id` int(11) NOT NULL,
  `item_name` varchar(512) NOT NULL,
  `stock_qty_pcs` int(11) DEFAULT 0,
  `unit` varchar(512) DEFAULT 'KG',
  `is_deleted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inventory_packing`
--

INSERT INTO `inventory_packing` (`id`, `item_name`, `stock_qty_pcs`, `unit`, `is_deleted`) VALUES
(2, 'LIMRA 750ML REC CARTON BOX', 10, 'Box', 0),
(3, 'LIMRA 500ML ROUND CARTON BOX', 40, 'Box', 0),
(4, '50ML ROUND SAUCE CUP CARTON BOX', 192, 'Box', 0),
(5, '100ML ROUND CONTAINER CARTON BOX', 10, 'Box', 0),
(6, '250ML ROUND CONTAINER CARTON BOX', 180, 'Box', 0),
(7, '500ML ROUND CONTAINER CARTON BOX', 300, 'Box', 0),
(8, '750ML ROUND CONTAINER CARTON BOX', 210, 'Box', 0),
(9, '1000ML ROUND CONTAINER CARTON BOX', 83, 'Box', 0),
(10, '650ML REC CONTAINER CARTON BOX', 390, 'Box', 0),
(11, '750ML REC CONTAINER CARTON BOX', 480, 'Box', 0),
(12, '250ML ROUND CUP CARTON BOX', 265, 'Box', 0),
(13, '1/2 INCH TAPE', 85, 'PCS', 0),
(14, '2 1/2 INCH TAPE ', 135, 'PCS', 0),
(15, 'OUTER BELT TAPE ROLL FOR CARTON BOX', 18, 'Roll', 0),
(16, '50ML RO COVER', 18, 'KG', 0),
(17, '100ML RO COVER', 205, 'KG', 0),
(18, '250ML RO COVER', 0, 'KG', 0),
(19, '500ML RO COVER', 267, 'KG', 0),
(20, '750ML RO COVER', 0, 'KG', 0),
(21, '1000ML RO COVER', 52, 'KG', 0),
(22, '750ML REC COVER', 168, 'KG', 0),
(23, '250ML CUP COVER', 30, 'KG', 0);

-- --------------------------------------------------------

--
-- Table structure for table `inventory_product`
--

CREATE TABLE `inventory_product` (
  `id` int(11) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `opening_stock` int(11) DEFAULT 0,
  `used_stock` int(11) DEFAULT 0,
  `closing_stock` int(11) DEFAULT 0,
  `minimum_stock_level` int(11) DEFAULT 100,
  `unit_weight_gm` decimal(10,3) DEFAULT NULL,
  `last_update` datetime DEFAULT current_timestamp(),
  `vendor_name` varchar(512) DEFAULT NULL,
  `vendor_price` decimal(15,2) DEFAULT NULL,
  `unit` varchar(512) DEFAULT 'KG',
  `is_deleted` tinyint(1) DEFAULT 0,
  `pieces_per_box` decimal(15,2) DEFAULT NULL,
  `description` varchar(512) DEFAULT NULL,
  `box_count` int(11) DEFAULT 0,
  `color` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inventory_product`
--

INSERT INTO `inventory_product` (`id`, `product_name`, `opening_stock`, `used_stock`, `closing_stock`, `minimum_stock_level`, `unit_weight_gm`, `last_update`, `vendor_name`, `vendor_price`, `unit`, `is_deleted`, `pieces_per_box`, `description`, `box_count`, `color`) VALUES
(3, '50ML ROUND  SAUCE CUP NAT', 0, 0, 408000, 100, 0.000, '2026-03-28 09:54:23', NULL, NULL, 'PCS', 0, 3000.00, NULL, 136, NULL),
(4, '100ML ROUND  CONTAINER(LID-NAT, BOTT-NAT)', 0, 0, 0, 100, 0.000, '2026-03-28 09:57:57', NULL, NULL, 'PCS', 0, 2000.00, NULL, 0, NULL),
(5, '100ML ROUND  CONTAINER( LID-NAT, BOTT-BK)', 140000, 0, 140000, 100, 0.000, '2026-03-28 10:00:51', NULL, NULL, 'PCS', 0, 2000.00, NULL, 70, NULL),
(6, '100ML ROUND  CONTAINER( LID-WT, BOTT-NAT)', 20000, 0, 0, 100, 0.000, '2026-03-28 10:02:23', NULL, NULL, 'PCS', 0, 2000.00, NULL, 0, NULL),
(7, '250ML ROUND  CONTAINER( LID-NAT, BOTT-NAT)', 0, 0, 12000, 100, 0.000, '2026-03-28 10:04:04', NULL, NULL, 'PCS', 0, 1000.00, NULL, 12, 'Natural'),
(8, '250ML ROUND  CONTAINER( LID-NAT, BOTT-WT)', 0, 0, 63000, 100, 0.000, '2026-03-28 10:05:17', NULL, NULL, 'PCS', 0, 1000.00, NULL, 63, 'Natural'),
(9, '250ML ROUND  CONTAINER( LID-RED, BOTT-NAT)', 0, 0, 0, 100, 0.000, '2026-03-28 10:05:34', NULL, NULL, 'PCS', 0, 1000.00, NULL, 0, 'Natural'),
(10, '250ML ROUND  CONTAINER( LID-NAT, BOTT-BK)', 0, 0, 41000, 100, 0.000, '2026-03-28 10:05:50', NULL, NULL, 'PCS', 0, 1000.00, NULL, 41, 'Natural'),
(11, '250ML ROUND  CONTAINER( LID-BLU, BOTT-NAT)', 0, 0, 0, 100, 0.000, '2026-03-28 10:07:10', NULL, NULL, 'PCS', 0, 1000.00, NULL, 0, 'Natural'),
(13, '500ML ROUND  CONTAINER( LID-NAT, BOTT-NAT)', 0, 0, 54000, 100, 0.000, '2026-03-28 10:08:09', NULL, NULL, 'PCS', 0, 1000.00, NULL, 54, 'Natural'),
(14, '500ML ROUND  CONTAINER( LID-NAT, BOTT-WT)', 0, 0, 24000, 100, 0.000, '2026-03-28 10:08:36', NULL, NULL, 'PCS', 0, 1000.00, NULL, 24, 'Natural'),
(15, '500ML ROUND  CONTAINER( LID-RED, BOTT-NAT)', 0, 0, 0, 100, 0.000, '2026-03-28 10:08:58', NULL, NULL, 'PCS', 0, 1000.00, NULL, 0, 'Natural'),
(16, '500ML ROUND  CONTAINER( LID-BLU, BOTT-NAT)', 0, 0, 0, 100, 0.000, '2026-03-28 10:09:12', NULL, NULL, 'PCS', 0, 1000.00, NULL, 0, 'Natural'),
(74, '750ML ROUND  CONTAINER( LID-NAT, BOTT-NAT)', 0, 0, 20400, 100, 0.000, '2026-03-28 10:16:02', NULL, NULL, 'PCS', 0, 600.00, NULL, 34, 'Natural'),
(75, '500ML ROUND  CONTAINER( LID-NAT, BOTT-BK)', 0, 0, 23000, 100, 0.000, '2026-03-28 10:16:57', NULL, NULL, 'PCS', 0, 1000.00, NULL, 23, 'Natural'),
(76, '750ML ROUND  CONTAINER( LID-NAT, BOTT-BK)', 0, 0, 17400, 100, 0.000, '2026-03-28 10:18:07', NULL, NULL, 'PCS', 0, 600.00, NULL, 29, 'Natural'),
(77, '750ML ROUND  CONTAINER( LID-NAT, BOTT-WT)', 0, 0, 0, 100, 0.000, '2026-03-28 10:18:25', NULL, NULL, 'PCS', 0, 600.00, NULL, 0, 'Natural'),
(82, '1000ML ROUND  CONTAINER( LID-NAT, BOTT-NAT)', 0, 0, 9600, 100, 0.000, '2026-03-28 10:22:53', NULL, NULL, 'PCS', 0, 600.00, NULL, 16, 'Natural'),
(83, '1000ML ROUND  CONTAINER( LID-NAT, BOTT-WT)', 0, 0, 24600, 100, 0.000, '2026-03-28 10:23:25', NULL, NULL, 'PCS', 0, 600.00, NULL, 41, 'Natural'),
(84, '250ML ROUND CUP ( LID-NAT, BOTT-NAT)', 0, 0, 0, 100, 0.000, '2026-03-28 10:25:04', NULL, NULL, 'PCS', 0, 2000.00, NULL, 0, NULL),
(85, '650ML REC  CONTAINER( LID-NAT, BOTT-NAT)', 0, 0, 1500, 100, 0.000, '2026-03-28 10:27:18', NULL, NULL, 'PCS', 0, 750.00, NULL, 2, 'Natural'),
(86, '650ML REC  CONTAINER( LID-NAT, BOTT-BK)', 0, 0, 3500, 100, 0.000, '2026-03-28 10:27:32', NULL, NULL, 'PCS', 0, 750.00, NULL, 4, 'Natural'),
(87, '650ML REC  CONTAINER( LID-NAT, BOTT-WT)', 0, 0, 13500, 100, 0.000, '2026-03-28 10:27:40', NULL, NULL, 'PCS', 0, 750.00, NULL, 18, 'Natural'),
(88, '750ML REC  CONTAINER( LID-NAT, BOTT-NAT)', 0, 0, 1750, 100, 0.000, '2026-03-28 10:28:00', NULL, NULL, 'PCS', 0, 750.00, NULL, 2, 'Natural'),
(89, '750ML REC  CONTAINER( LID-NAT, BOTT-BK)', 0, 0, 72750, 100, 0.000, '2026-03-28 10:28:11', NULL, NULL, 'PCS', 0, 750.00, NULL, 97, 'Natural'),
(90, '750ML REC  CONTAINER( LID-NAT, BOTT-WT)', 0, 0, 1500, 100, 0.000, '2026-03-28 10:28:28', NULL, NULL, 'PCS', 0, 750.00, NULL, 2, 'Natural'),
(98, '1000ML ROUND  CONTAINER( LID-NAT, BOTT-BK)', 0, 0, 13800, 100, 0.000, '2026-04-01 01:57:42', NULL, NULL, 'Box', 0, 600.00, NULL, 23, 'Natural'),
(99, 'TEST', 0, 0, 0, 100, 0.000, '2026-04-01 09:38:50', NULL, NULL, 'Box', 1, 1000.00, 'TESTTT', 0, NULL),
(100, '1test', 0, 0, 80000, 100, 0.000, '2026-04-01 16:02:26', NULL, NULL, 'Box', 1, 1000.00, NULL, 80, 'Natural'),
(101, 'TEST PRODUCT', 0, 0, 0, 100, 0.000, '2026-04-22 10:24:49', NULL, NULL, 'Box', 0, 1.00, NULL, 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `inventory_semi_finished`
--

CREATE TABLE `inventory_semi_finished` (
  `id` int(11) NOT NULL,
  `product_name` varchar(512) DEFAULT NULL,
  `opening_stock` decimal(15,2) DEFAULT 0.00,
  `closing_stock` decimal(15,2) DEFAULT 0.00,
  `minimum_stock_level` decimal(15,2) DEFAULT 0.00,
  `unit_weight_gm` decimal(15,2) DEFAULT 0.00,
  `unit` varchar(512) DEFAULT 'PCS',
  `vendor_name` varchar(512) DEFAULT NULL,
  `vendor_price` decimal(15,2) DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `description` varchar(512) DEFAULT NULL,
  `taken_count` decimal(15,2) DEFAULT 0.00,
  `balance_count` decimal(15,2) DEFAULT 0.00,
  `semi_product_type` varchar(512) DEFAULT NULL,
  `color` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inventory_semi_finished`
--

INSERT INTO `inventory_semi_finished` (`id`, `product_name`, `opening_stock`, `closing_stock`, `minimum_stock_level`, `unit_weight_gm`, `unit`, `vendor_name`, `vendor_price`, `is_deleted`, `created_at`, `description`, `taken_count`, `balance_count`, `semi_product_type`, `color`) VALUES
(1, '100 ml lid', 40000.00, 40000.00, 100.00, 0.00, 'PCS', NULL, NULL, 1, '2026-03-30 10:19:45', NULL, 0.00, 40000.00, NULL, NULL),
(2, '100 ml container', 20000.00, 20000.00, 100.00, 0.00, 'PCS', NULL, NULL, 1, '2026-03-30 10:19:58', NULL, 0.00, 20000.00, NULL, NULL),
(3, 'TEST', 20000.00, 20000.00, 100.00, 0.00, 'PCS', NULL, NULL, 1, '2026-03-31 07:43:07', NULL, 0.00, 20000.00, NULL, NULL),
(4, 'TEST2', 20000.00, 20000.00, 100.00, 0.00, 'PCS', NULL, NULL, 1, '2026-03-31 07:43:43', NULL, 0.00, 20000.00, NULL, NULL),
(5, '100 ML ROUND LID NATURE 2024', 0.00, 0.00, 100.00, 0.00, 'PCS', NULL, NULL, 1, '2026-03-31 12:55:45', NULL, 0.00, 0.00, NULL, NULL),
(6, '100 ML ROUND LID WHITE 2024', 0.00, 0.00, 100.00, 0.00, 'PCS', NULL, NULL, 1, '2026-03-31 12:57:17', NULL, 0.00, 0.00, NULL, NULL),
(7, '100 ML ROUND CONTAINER NATURAL 2024', 0.00, 0.00, 100.00, 0.00, 'PCS', NULL, NULL, 1, '2026-03-31 13:03:32', NULL, 0.00, 0.00, NULL, NULL),
(8, '500 ML ROUND CONTAINER WHITE', 24000.00, 24000.00, 0.00, 0.00, 'PCS', NULL, NULL, 0, '2026-03-31 13:42:53', NULL, 24000.00, 0.00, 'container', NULL),
(9, '500 ML ROUND CONTAINER NATURAL', 54000.00, 54000.00, 0.00, 0.00, 'PCS', NULL, NULL, 0, '2026-03-31 13:42:53', NULL, 54000.00, 0.00, 'container', 'Natural'),
(10, '50ML ROUND Sauce Cup Natural', 408000.00, 408000.00, 0.00, 0.00, 'PCS', NULL, NULL, 0, '2026-03-31 13:42:53', NULL, 408000.00, 0.00, NULL, NULL),
(11, '500 ML ROUND CONTAINER NATURAL 2025', 0.00, 0.00, 0.00, 0.00, 'PCS', NULL, NULL, 1, '2026-03-31 13:42:53', NULL, 0.00, 0.00, 'container', NULL),
(12, '250/500 ML ROUND LID RED', 0.00, 0.00, 0.00, 0.00, 'PCS', NULL, NULL, 0, '2026-03-31 13:42:53', NULL, 0.00, 0.00, 'lid', NULL),
(13, '100 ML ROUND CONTAINER BLACK', 140000.00, 140000.00, 0.00, 0.00, 'PCS', NULL, NULL, 0, '2026-03-31 13:42:53', NULL, 140000.00, 0.00, 'container', NULL),
(14, '100 ML ROUND CONTAINER NATURAL', 128000.00, 128000.00, 0.00, 0.00, 'PCS', NULL, NULL, 0, '2026-03-31 13:42:53', NULL, 0.00, 128000.00, 'container', NULL),
(15, '100 ML ROUND LID NATURE', 192000.00, 192000.00, 0.00, 0.00, 'PCS', NULL, NULL, 0, '2026-03-31 13:42:53', NULL, 140000.00, 52000.00, 'lid', NULL),
(16, '100 ML ROUND LID WHITE', 76000.00, 76000.00, 0.00, 0.00, 'PCS', NULL, NULL, 0, '2026-03-31 13:42:53', NULL, 0.00, 76000.00, 'lid', NULL),
(17, '250 ML ROUND CONTAINER BLACK', 41000.00, 41000.00, 0.00, 0.00, 'PCS', NULL, NULL, 0, '2026-03-31 13:42:53', NULL, 41000.00, 0.00, 'container', NULL),
(18, '250 ML ROUND CONTAINER NATURAL', 12000.00, 13900.00, 0.00, 0.00, 'PCS', NULL, NULL, 0, '2026-03-31 13:42:53', NULL, 12000.00, 0.00, 'container', 'Natural'),
(19, '250 ML ROUND CONTAINER WHITE', 63000.00, 63000.00, 0.00, 0.00, 'PCS', NULL, NULL, 0, '2026-03-31 13:42:53', NULL, 63000.00, 0.00, 'container', NULL),
(20, '250/500 ML ROUND LID NATURE', 217000.00, 217000.00, 0.00, 0.00, 'PCS', NULL, NULL, 0, '2026-03-31 13:42:53', NULL, 163000.00, 54000.00, 'lid', 'Natural'),
(21, '500 ML ROUND CONTAINER BLACK', 23000.00, 23000.00, 0.00, 0.00, 'PCS', NULL, NULL, 0, '2026-03-31 13:42:53', NULL, 23000.00, 0.00, 'container', NULL),
(22, '500 ML ROUND CONTAINER WHITE 2025', 0.00, 0.00, 0.00, 0.00, 'PCS', NULL, NULL, 1, '2026-03-31 13:42:53', NULL, 0.00, 0.00, 'container', NULL),
(23, '500 ML ROUND CONTAINER BLACK 2025', 0.00, 0.00, 0.00, 0.00, 'PCS', NULL, NULL, 1, '2026-03-31 13:42:53', NULL, 0.00, 0.00, 'container', NULL),
(24, '750 ML ROUND CONTAINER NATURAL', 20400.00, 20400.00, 0.00, 0.00, 'PCS', NULL, NULL, 0, '2026-03-31 13:42:53', NULL, 20400.00, 0.00, 'container', NULL),
(25, '750 ML ROUND CONTAINER BLACK', 17400.00, 17400.00, 0.00, 0.00, 'PCS', NULL, NULL, 0, '2026-03-31 13:42:53', NULL, 17400.00, 0.00, 'container', NULL),
(26, '750 ML ROUND CONTAINER WHITE', 0.00, 0.00, 0.00, 0.00, 'PCS', NULL, NULL, 0, '2026-03-31 13:42:53', NULL, 0.00, 0.00, 'container', NULL),
(27, '1000 ML ROUND CONTAINER NATURAL', 9600.00, 9600.00, 0.00, 0.00, 'PCS', NULL, NULL, 0, '2026-03-31 13:42:53', NULL, 9600.00, 0.00, 'container', 'Natural'),
(28, '1000 ML ROUND CONTAINER BLACK', 13800.00, 13800.00, 0.00, 0.00, 'PCS', NULL, NULL, 0, '2026-03-31 13:42:53', NULL, 13800.00, 0.00, 'container', NULL),
(29, '1000 ML ROUND CONTAINER WHITE', 24600.00, 24600.00, 0.00, 0.00, 'PCS', NULL, NULL, 0, '2026-03-31 13:42:53', NULL, 24600.00, 0.00, 'container', NULL),
(30, '750/1000 ML ROUND LID NATURE', 100200.00, 100200.00, 0.00, 0.00, 'PCS', NULL, NULL, 0, '2026-03-31 13:42:53', NULL, 85800.00, 14400.00, 'lid', 'Natural'),
(31, '650 ML REC CONTAINER NATURAL', 1500.00, 1500.00, 0.00, 0.00, 'PCS', NULL, NULL, 0, '2026-03-31 13:42:53', NULL, 1500.00, 0.00, 'container', NULL),
(32, '650 ML REC CONTAINER BLACK', 3500.00, 5300.00, 0.00, 0.00, 'PCS', NULL, NULL, 0, '2026-03-31 13:42:53', NULL, 3500.00, 0.00, 'container', 'LINGAM BLACK'),
(33, '650 ML REC CONTAINER WHITE', 13500.00, 13500.00, 0.00, 0.00, 'PCS', NULL, NULL, 0, '2026-03-31 13:42:53', NULL, 13500.00, 0.00, 'container', NULL),
(34, '750 ML REC CONTAINER NATURAL', 2250.00, 2250.00, 0.00, 0.00, 'PCS', NULL, NULL, 0, '2026-03-31 13:42:53', NULL, 1750.00, 500.00, 'container', NULL),
(35, '750 ML REC CONTAINER BLACK', 72750.00, 72750.00, 0.00, 0.00, 'PCS', NULL, NULL, 0, '2026-03-31 13:42:53', NULL, 72750.00, 0.00, 'container', 'LINGAM BLACK'),
(36, '750 ML REC CONTAINER WHITE', 14400.00, 14400.00, 0.00, 0.00, 'PCS', NULL, NULL, 0, '2026-03-31 13:42:53', NULL, 1500.00, 12900.00, 'container', NULL),
(37, '750 ML REC CONTAINER NATURAL 2025', 0.00, 0.00, 0.00, 0.00, 'PCS', NULL, NULL, 1, '2026-03-31 13:42:53', NULL, 0.00, 0.00, 'container', NULL),
(38, '750 ML REC CONTAINER BLACK 2025', 0.00, 0.00, 0.00, 0.00, 'PCS', NULL, NULL, 1, '2026-03-31 13:42:53', NULL, 0.00, 0.00, 'container', NULL),
(39, '750 ML REC CONTAINER WHITE 2025', 0.00, 0.00, 0.00, 0.00, 'PCS', NULL, NULL, 1, '2026-03-31 13:42:53', NULL, 0.00, 0.00, 'container', NULL),
(40, '500/650/750/1000ML REC LID NATURAL', 94500.00, 106900.00, 0.00, 0.00, 'PCS', NULL, NULL, 0, '2026-03-31 13:42:53', NULL, 94500.00, 0.00, 'lid', 'Natural'),
(41, '250ML ROUND CUP NATURAL', 0.00, 0.00, 0.00, 0.00, 'PCS', NULL, NULL, 0, '2026-03-31 13:42:53', NULL, 0.00, 0.00, 'container', NULL),
(42, '250/500 ML ROUND LID BLUE', 0.00, 0.00, 100.00, 0.00, 'PCS', NULL, NULL, 0, '2026-04-01 01:36:07', NULL, 0.00, 0.00, 'lid', NULL),
(43, '2test lid', 70000.00, 114202.00, 100.00, 0.00, 'PCS', NULL, NULL, 1, '2026-04-01 16:00:13', NULL, 0.00, 107437.00, 'lid', 'Natural'),
(44, '1test lid', 4000.00, 4714.00, 100.00, 0.00, 'PCS', NULL, NULL, 1, '2026-04-01 16:00:33', NULL, 0.00, 4000.00, 'lid', NULL),
(45, '3test container', 2000.00, 9977.00, 100.00, 0.00, 'PCS', NULL, NULL, 1, '2026-04-01 16:01:02', NULL, 0.00, 2000.00, 'container', 'Natural'),
(46, '3test container', 80000.00, 87587.00, 100.00, 0.00, 'PCS', NULL, NULL, 1, '2026-04-01 16:01:15', NULL, 0.00, 80000.00, 'container', 'Natural'),
(47, 'TEST LID', 0.00, 0.00, 100.00, 0.00, 'PCS', NULL, NULL, 0, '2026-04-22 10:23:00', NULL, 0.00, 0.00, 'lid', NULL),
(48, 'TEST CONATINER', 0.00, 0.00, 100.00, 0.00, 'PCS', NULL, NULL, 0, '2026-04-22 10:23:14', NULL, 0.00, 0.00, 'container', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `inventory_usage_logs`
--

CREATE TABLE `inventory_usage_logs` (
  `id` int(11) NOT NULL,
  `machine_id` int(11) DEFAULT NULL,
  `session_start_time` datetime DEFAULT NULL,
  `material_name` varchar(512) DEFAULT NULL,
  `category` varchar(512) DEFAULT NULL,
  `quantity` decimal(10,2) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `inventory_usage_logs`
--

INSERT INTO `inventory_usage_logs` (`id`, `machine_id`, `session_start_time`, `material_name`, `category`, `quantity`, `created_at`) VALUES
(1, 4, '2026-03-11 19:29:52', 'Kansbec White', 'Colors', 2.00, '2026-03-11 19:33:08'),
(2, 1, '2026-03-11 19:26:46', 'MRPL', 'Materials', 10.00, '2026-03-11 19:38:50'),
(3, 1, '2026-03-12 05:28:48', 'MRPL', 'Materials', 2.00, '2026-03-12 05:29:09'),
(4, 1, '2026-03-12 06:39:29', 'Reliance AM650', 'Materials', 100.00, '2026-03-12 06:43:57'),
(5, 1, '2026-03-12 06:45:09', 'Reliance AM650', 'Materials', 100.00, '2026-03-12 06:45:27'),
(6, 1, '2026-03-12 06:55:49', 'Reliance SRM100', 'Materials', 10.00, '2026-03-12 06:56:15'),
(7, 1, '2026-03-12 07:01:16', 'Reliance SRM100', 'Materials', 10.00, '2026-03-12 07:01:32'),
(8, 1, '2026-03-12 13:20:28', 'Reliance B650N', 'Materials', 20.00, '2026-03-12 13:21:37'),
(9, 1, '2026-03-22 11:35:40', 'Reliance AM650', 'Materials', 1.00, '2026-03-22 11:44:27'),
(10, 1, '2026-03-22 15:18:26', 'Reliance AM650', 'Materials', 1.00, '2026-03-22 15:20:51'),
(11, 1, '2026-03-24 08:47:15', 'Reliance AM650', 'Materials', 1.00, '2026-03-24 09:01:31'),
(12, 2, '2026-04-03 12:04:53', 'MRPL', 'Materials', 1.00, '2026-04-03 12:05:17'),
(13, 2, '2026-04-04 08:57:39', 'MRPL', 'Materials', 1.00, '2026-04-04 09:00:19'),
(14, 2, '2026-04-04 11:37:50', 'MRPL', 'Materials', 2.00, '2026-04-04 11:38:08'),
(15, 2, '2026-04-04 13:34:36', 'MRPL', 'Materials', 1.00, '2026-04-04 13:42:26'),
(16, 1, '2026-04-04 16:45:05', 'MRPL', 'Materials', 1.00, '2026-04-04 16:45:20'),
(17, 1, '2026-04-08 17:08:21', 'MRPL', 'Materials', 1.00, '2026-04-08 17:08:34'),
(18, 1, '2026-04-17 13:07:20', 'RELIANCE AM 650', 'Materials', 1.00, '2026-04-17 13:07:20'),
(19, 1, '2026-04-18 04:50:13', 'RELIANCE AM 650', 'Materials', 1.00, '2026-04-18 04:50:13'),
(20, 1, '2026-04-18 08:44:14', 'MRPL', 'Materials', 10.00, '2026-04-18 08:44:15'),
(21, 2, '2026-04-18 08:46:54', 'MRPL', 'Materials', 10.00, '2026-04-18 08:46:55'),
(22, 1, '2026-04-18 08:50:44', 'MRPL', 'Materials', 10.00, '2026-04-18 08:50:45'),
(23, 1, '2026-04-18 08:50:44', 'MRPL', 'Materials', 10.00, '2026-04-18 09:03:42'),
(24, 1, '2026-04-18 13:10:57', 'MRPL', 'Materials', 1.00, '2026-04-18 13:10:57'),
(25, 1, '2026-04-19 06:37:07', 'MRPL', 'Materials', 1.00, '2026-04-19 06:37:06'),
(26, 1, '2026-04-19 08:59:18', 'RELIANCE AM 650', 'Materials', 1.00, '2026-04-19 08:59:15'),
(27, 1, '2026-04-19 12:25:37', 'MRPL', 'Materials', 8.00, '2026-04-19 12:25:38'),
(28, 1, '2026-04-19 12:25:37', 'MRPL', 'Materials', 5.00, '2026-04-19 13:30:41'),
(29, 1, '2026-04-19 14:28:41', 'MRPL', 'Materials', 8.00, '2026-04-19 14:28:42'),
(30, 1, '2026-04-19 14:57:52', 'MRPL', 'Materials', 8.00, '2026-04-19 14:57:53'),
(31, 1, '2026-04-20 05:01:01', 'RELIANCE AM 650', 'Materials', 150.00, '2026-04-20 05:01:01'),
(32, 1, '2026-04-20 05:01:01', 'RELIANCE B 650N', 'Materials', 15.00, '2026-04-20 05:01:01'),
(33, 1, '2026-04-20 05:01:01', 'RELIANCE SRM 100', 'Materials', 15.00, '2026-04-20 05:01:01'),
(34, 2, '2026-04-20 05:04:28', 'RELIANCE AM 650', 'Materials', 50.00, '2026-04-20 05:04:39'),
(35, 2, '2026-04-20 05:04:28', 'RELIANCE B 650N', 'Materials', 5.00, '2026-04-20 05:04:39'),
(36, 2, '2026-04-20 05:04:28', 'RELIANCE SRM 100', 'Materials', 5.00, '2026-04-20 05:04:39'),
(37, 2, '2026-04-20 05:04:31', 'RELIANCE AM 650', 'Materials', 50.00, '2026-04-20 05:04:39'),
(38, 2, '2026-04-20 05:04:31', 'RELIANCE B 650N', 'Materials', 5.00, '2026-04-20 05:04:39'),
(39, 2, '2026-04-20 05:04:31', 'RELIANCE SRM 100', 'Materials', 5.00, '2026-04-20 05:04:39'),
(40, 3, '2026-04-20 05:06:06', 'RELIANCE AM 650', 'Materials', 50.00, '2026-04-20 05:06:08'),
(41, 3, '2026-04-20 05:06:06', 'RELIANCE B 650N', 'Materials', 5.00, '2026-04-20 05:06:08'),
(42, 3, '2026-04-20 05:06:06', 'RELIANCE SRM 100', 'Materials', 5.00, '2026-04-20 05:06:08'),
(43, 4, '2026-04-20 05:08:22', 'RELIANCE AM 650', 'Materials', 75.00, '2026-04-20 05:08:23'),
(44, 4, '2026-04-20 05:08:22', 'RELIANCE B 650N', 'Materials', 7.50, '2026-04-20 05:08:23'),
(45, 4, '2026-04-20 05:08:22', 'RELIANCE SRM 100', 'Materials', 7.50, '2026-04-20 05:08:23'),
(46, 4, '2026-04-20 05:08:22', 'LINGAM BLACK', 'Colors', 0.90, '2026-04-20 05:08:23'),
(47, 5, '2026-04-20 05:10:01', 'RELIANCE AM 650', 'Materials', 50.00, '2026-04-20 05:10:01'),
(48, 5, '2026-04-20 05:10:01', 'RELIANCE B 650N', 'Materials', 5.00, '2026-04-20 05:10:01'),
(49, 5, '2026-04-20 05:10:01', 'RELIANCE SRM 100', 'Materials', 5.00, '2026-04-20 05:10:01'),
(50, 5, '2026-04-20 05:10:01', 'LINGAM BLACK', 'Colors', 0.60, '2026-04-20 05:10:01'),
(51, 6, '2026-04-20 05:11:33', 'RELIANCE AM 650', 'Materials', 25.00, '2026-04-20 05:11:34'),
(52, 6, '2026-04-20 05:11:33', 'RELIANCE B 650N', 'Materials', 2.50, '2026-04-20 05:11:34'),
(53, 6, '2026-04-20 05:11:33', 'RELIANCE SRM 100', 'Materials', 2.50, '2026-04-20 05:11:34'),
(54, 7, '2026-04-20 05:12:59', 'RELIANCE AM 650', 'Materials', 50.00, '2026-04-20 05:13:00'),
(55, 7, '2026-04-20 05:12:59', 'RELIANCE B 650N', 'Materials', 5.00, '2026-04-20 05:13:00'),
(56, 7, '2026-04-20 05:12:59', 'RELIANCE SRM 100', 'Materials', 5.00, '2026-04-20 05:13:00'),
(57, 8, '2026-04-20 05:14:25', 'RELIANCE AM 650', 'Materials', 25.00, '2026-04-20 05:14:25'),
(58, 8, '2026-04-20 05:14:25', 'RELIANCE B 650N', 'Materials', 2.50, '2026-04-20 05:14:25'),
(59, 8, '2026-04-20 05:14:25', 'RELIANCE SRM 100', 'Materials', 2.50, '2026-04-20 05:14:25'),
(60, 9, '2026-04-20 13:07:55', 'MRPL', 'Materials', 1.00, '2026-04-20 13:07:55'),
(61, 1, '2026-04-22 03:19:24', 'RELIANCE AM 650', 'Materials', 150.00, '2026-04-22 03:19:25'),
(62, 1, '2026-04-22 03:19:24', 'RELIANCE B 650N', 'Materials', 15.00, '2026-04-22 03:19:25'),
(63, 1, '2026-04-22 03:19:24', 'RELIANCE SRM 100', 'Materials', 15.00, '2026-04-22 03:19:25'),
(64, 2, '2026-04-22 03:21:57', 'RELIANCE AM 650', 'Materials', 150.00, '2026-04-22 03:21:57'),
(65, 2, '2026-04-22 03:21:57', 'RELIANCE B 650N', 'Materials', 15.00, '2026-04-22 03:21:57'),
(66, 2, '2026-04-22 03:21:57', 'RELIANCE SRM 100', 'Materials', 15.00, '2026-04-22 03:21:57'),
(67, 2, '2026-04-22 03:21:57', 'LINGAM  RED', 'Colors', 1.80, '2026-04-22 03:21:57'),
(68, 3, '2026-04-22 03:23:28', 'RELIANCE AM 650', 'Materials', 150.00, '2026-04-22 03:23:29'),
(69, 3, '2026-04-22 03:23:28', 'RELIANCE B 650N', 'Materials', 15.00, '2026-04-22 03:23:29'),
(70, 3, '2026-04-22 03:23:28', 'RELIANCE SRM 100', 'Materials', 15.00, '2026-04-22 03:23:29'),
(71, 4, '2026-04-22 03:24:30', 'RELIANCE AM 650', 'Materials', 150.00, '2026-04-22 03:24:30'),
(72, 4, '2026-04-22 03:24:30', 'RELIANCE B 650N', 'Materials', 15.00, '2026-04-22 03:24:30'),
(73, 4, '2026-04-22 03:24:30', 'RELIANCE SRM 100', 'Materials', 15.00, '2026-04-22 03:24:30'),
(74, 4, '2026-04-22 03:24:30', 'LINGAM BLACK', 'Colors', 1.80, '2026-04-22 03:24:30'),
(75, 5, '2026-04-22 03:25:33', 'RELIANCE AM 650', 'Materials', 150.00, '2026-04-22 03:25:33'),
(76, 5, '2026-04-22 03:25:33', 'RELIANCE B 650N', 'Materials', 15.00, '2026-04-22 03:25:33'),
(77, 5, '2026-04-22 03:25:33', 'RELIANCE SRM 100', 'Materials', 15.00, '2026-04-22 03:25:33'),
(78, 5, '2026-04-22 03:25:33', 'LINGAM BLACK', 'Colors', 1.80, '2026-04-22 03:25:33'),
(79, 7, '2026-04-22 03:26:30', 'RELIANCE AM 650', 'Materials', 150.00, '2026-04-22 03:26:30'),
(80, 7, '2026-04-22 03:26:30', 'RELIANCE B 650N', 'Materials', 15.00, '2026-04-22 03:26:30'),
(81, 7, '2026-04-22 03:26:30', 'RELIANCE SRM 100', 'Materials', 15.00, '2026-04-22 03:26:30'),
(82, 8, '2026-04-22 03:27:24', 'RELIANCE AM 650', 'Materials', 150.00, '2026-04-22 03:27:25'),
(83, 8, '2026-04-22 03:27:24', 'RELIANCE B 650N', 'Materials', 15.00, '2026-04-22 03:27:25'),
(84, 8, '2026-04-22 03:27:24', 'RELIANCE SRM 100', 'Materials', 15.00, '2026-04-22 03:27:25'),
(85, 6, '2026-04-22 07:05:41', 'RELIANCE AM 650', 'Materials', 150.00, '2026-04-22 07:05:41'),
(86, 6, '2026-04-22 07:05:41', 'RELIANCE B 650N', 'Materials', 15.00, '2026-04-22 07:05:41'),
(87, 6, '2026-04-22 07:05:41', 'RELIANCE SRM 100', 'Materials', 15.00, '2026-04-22 07:05:41'),
(88, 6, '2026-04-22 07:05:41', 'LINGAM BLACK', 'Colors', 1.80, '2026-04-22 07:05:41'),
(89, 9, '2026-04-22 07:50:43', 'MRPL', 'Materials', 1.00, '2026-04-22 07:50:44'),
(90, 9, '2026-04-22 07:52:37', 'MRPL', 'Materials', 1.00, '2026-04-22 07:52:38'),
(91, 10, '2026-04-22 07:52:57', 'MRPL', 'Materials', 1.00, '2026-04-22 07:52:58'),
(92, 9, '2026-04-22 07:54:42', 'MRPL', 'Materials', 1.00, '2026-04-22 07:54:43'),
(93, 9, '2026-04-22 10:58:55', 'RELIANCE AM 650', 'Materials', 1.00, '2026-04-22 10:58:54'),
(94, 10, '2026-04-22 11:09:06', 'RELIANCE B 650N', 'Materials', 1.00, '2026-04-22 11:09:05');

-- --------------------------------------------------------

--
-- Table structure for table `machine_status`
--

CREATE TABLE `machine_status` (
  `id` int(11) NOT NULL,
  `machine_name` varchar(50) NOT NULL,
  `status` varchar(20) DEFAULT 'idle',
  `total_output` int(11) DEFAULT 0,
  `start_time` datetime DEFAULT current_timestamp(),
  `material_qty_1` varchar(255) DEFAULT NULL,
  `shift` varchar(255) DEFAULT NULL,
  `material_type_1` varchar(255) DEFAULT NULL,
  `mold_type` varchar(255) DEFAULT NULL,
  `cavity` int(11) DEFAULT NULL,
  `material_type_2` varchar(512) DEFAULT NULL,
  `material_qty_2` decimal(15,2) DEFAULT 0.00,
  `material_type_3` varchar(512) DEFAULT NULL,
  `material_qty_3` decimal(15,2) DEFAULT 0.00,
  `material_type_4` varchar(512) DEFAULT NULL,
  `material_qty_4` decimal(15,2) DEFAULT 0.00,
  `material_color` varchar(512) DEFAULT NULL,
  `color_qty` decimal(15,2) DEFAULT 0.00,
  `cycle_timing` int(11) DEFAULT 0,
  `stop_reason` varchar(512) DEFAULT NULL,
  `accumulated_output` int(11) DEFAULT 0,
  `stop_time` datetime DEFAULT NULL,
  `hourly_units` int(11) DEFAULT 0,
  `last_report_at` datetime DEFAULT current_timestamp(),
  `resume_time` datetime DEFAULT NULL,
  `session_start_time` datetime DEFAULT NULL,
  `product_name` varchar(255) DEFAULT NULL,
  `last_report_count` int(11) DEFAULT 0,
  `is_deleted` tinyint(1) DEFAULT 0,
  `semi_finished_product` varchar(255) DEFAULT NULL,
  `mold_id` int(11) DEFAULT NULL,
  `mold_name` varchar(512) DEFAULT NULL,
  `cavity_weights` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`cavity_weights`)),
  `total_cavity_weight` decimal(10,3) DEFAULT 0.000
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `machine_status`
--

INSERT INTO `machine_status` (`id`, `machine_name`, `status`, `total_output`, `start_time`, `material_qty_1`, `shift`, `material_type_1`, `mold_type`, `cavity`, `material_type_2`, `material_qty_2`, `material_type_3`, `material_qty_3`, `material_type_4`, `material_qty_4`, `material_color`, `color_qty`, `cycle_timing`, `stop_reason`, `accumulated_output`, `stop_time`, `hourly_units`, `last_report_at`, `resume_time`, `session_start_time`, `product_name`, `last_report_count`, `is_deleted`, `semi_finished_product`, `mold_id`, `mold_name`, `cavity_weights`, `total_cavity_weight`) VALUES
(1, 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'idle', 0, NULL, '150', 'Day Shift', 'RELIANCE AM 650', '500/650/750/1000ML REC LID NATURAL 2025', 4, 'RELIANCE B 650N', 15.00, 'RELIANCE SRM 100', 15.00, 'None', 0.00, 'Natural', 0.00, 7, NULL, 0, NULL, 0, '2026-04-22 11:33:50', '2026-04-22 11:37:39', '2026-04-22 03:19:24', '1test', 0, 0, '500/650/750/1000ML REC LID NATURAL', NULL, NULL, NULL, 0.000),
(2, 'MACHINE -2(250 TONNAGE SHIBAURA MACHINE 2024)', 'stop', 26880, NULL, '150', 'Day Shift', 'RELIANCE AM 650', '250/500 ML ROUND LID RED 2024', 6, 'RELIANCE B 650N', 15.00, 'RELIANCE SRM 100', 15.00, 'None', 0.00, 'LINGAM  RED', 1.80, 7, 'dv', 26880, NULL, 0, '2026-04-22 13:21:57', '2026-04-22 13:33:04', '2026-04-22 03:21:57', NULL, 26862, 0, '250/500 ML ROUND LID RED', NULL, NULL, NULL, 0.000),
(3, 'MACHINE -3(250 TONNAGE SHIBAURA MACHINE 2024)', 'stop', 17864, NULL, '150', 'Day Shift', 'RELIANCE AM 650', '250 ML ROUND CONTAINER NATURAL 2024', 4, 'RELIANCE B 650N', 15.00, 'RELIANCE SRM 100', 15.00, 'None', 0.00, 'Natural', 0.00, 7, 'Shift over ', 17864, NULL, 0, '2026-04-22 11:43:23', '2026-04-22 12:04:59', '2026-04-22 03:23:28', NULL, 18812, 0, '250 ML ROUND CONTAINER NATURAL', NULL, NULL, NULL, 0.000),
(4, 'MACHINE -4(180 TONNAGE SHIBAURA MACHINE 2024)', 'power_cut', 8912, '2026-04-22 11:37:13', '150', 'Day Shift', 'RELIANCE AM 650', '750 ML REC CONTAINER BLACK 2025', 2, 'RELIANCE B 650N', 15.00, 'RELIANCE SRM 100', 15.00, 'None', 0.00, 'LINGAM BLACK', 1.80, 7, NULL, 8912, '2026-04-22 12:04:46', 0, '2026-04-22 11:43:49', '2026-04-22 11:37:13', '2026-04-22 03:24:30', NULL, 8440, 0, '750 ML REC CONTAINER BLACK', NULL, NULL, NULL, 0.000),
(5, 'MACHINE -5(180 TONNAGE SHIBAURA MACHINE 2024)', 'stop', 8592, NULL, '150', 'Day Shift', 'RELIANCE AM 650', '650 ML REC CONTAINER BLACK 2026', 2, 'RELIANCE B 650N', 15.00, 'RELIANCE SRM 100', 15.00, 'None', 0.00, 'LINGAM BLACK', 1.80, 7, 'Die change ', 8592, NULL, 0, '2026-04-22 11:44:31', '2026-04-22 11:37:13', '2026-04-22 03:25:33', NULL, 10222, 0, '650 ML REC CONTAINER BLACK', NULL, NULL, NULL, 0.000),
(6, 'MACHINE -6(180 TONNAGE SHIBAURA MACHINE 2025)', 'power_cut', 5120, '2026-04-22 07:05:41', '150', 'Day Shift', 'RELIANCE AM 650', '500 ML ROUND CONTAINER BLACK 2025', 2, 'RELIANCE B 650N', 15.00, 'RELIANCE SRM 100', 15.00, 'None', 0.00, 'LINGAM BLACK', 1.80, 7, NULL, 5120, '2026-04-22 12:04:46', 0, '2026-04-22 10:05:41', '2026-04-22 11:37:13', '2026-04-22 07:05:41', NULL, 3084, 0, '500 ML ROUND CONTAINER BLACK', NULL, NULL, NULL, 0.000),
(7, 'MACHINE -7(180 TONNAGE SHIBAURA MACHINE 2025)', 'power_cut', 35504, '2026-04-22 03:26:30', '150', 'Day Shift', 'RELIANCE AM 650', '100 ML ROUND LID NATURE 2024', 8, 'RELIANCE B 650N', 15.00, 'RELIANCE SRM 100', 15.00, 'None', 0.00, 'Natural', 0.00, 7, NULL, 35504, '2026-04-22 12:04:46', 0, '2026-04-20 08:12:59', '2026-04-22 11:37:13', '2026-04-22 03:26:30', NULL, 9120, 0, '100 ML ROUND LID NATURE', NULL, NULL, NULL, 0.000),
(8, 'MACHINE -8(250 TONNAGE SHIBAURA MACHINE 2025)', 'power_cut', 8862, '2026-04-22 03:27:24', '150', 'Day Shift', 'RELIANCE AM 650', '1000 ML ROUND CONTAINER NATURAL 2025', 2, 'RELIANCE B 650N', 15.00, 'RELIANCE SRM 100', 15.00, 'None', 0.00, 'Natural', 0.00, 7, NULL, 8862, '2026-04-22 12:04:46', 0, '2026-04-21 09:17:01', '2026-04-22 11:37:13', '2026-04-22 03:27:24', NULL, 8228, 0, '1000 ML ROUND CONTAINER NATURAL', NULL, NULL, NULL, 0.000),
(9, 'MACHINE -9(250 TONNAGE SHIBAURA MACHINE 2026)', 'idle', 0, NULL, '1', 'Day Shift', 'RELIANCE AM 650', 'test', 1, 'None', 0.00, 'None', 0.00, 'None', 0.00, 'Natural', 0.00, 2, NULL, 0, NULL, 0, '2026-04-22 10:58:55', '2026-04-22 11:37:13', '2026-04-22 10:58:55', NULL, 0, 0, 'TEST LID', NULL, NULL, NULL, 0.000),
(10, 'MACHINE -10(180 TONNAGE SHIBAURA MACHINE 2026)', 'power_cut', 1670, '2026-04-22 11:09:06', '1', 'Day Shift', 'RELIANCE B 650N', 'test', 1, 'None', 0.00, 'None', 0.00, 'None', 0.00, 'Natural', 0.00, 2, NULL, 1670, '2026-04-22 12:04:46', 0, '2026-04-22 11:09:06', NULL, '2026-04-22 11:09:06', NULL, 0, 0, 'TEST LID', NULL, NULL, NULL, 0.000);

-- --------------------------------------------------------

--
-- Table structure for table `missed_record_requests`
--

CREATE TABLE `missed_record_requests` (
  `id` int(11) NOT NULL,
  `machine_id` varchar(50) DEFAULT NULL,
  `operator_id` varchar(50) DEFAULT NULL,
  `production_date` date DEFAULT NULL,
  `hour_slot_from` varchar(20) DEFAULT NULL,
  `hour_slot_to` varchar(20) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `approved_at` timestamp NULL DEFAULT NULL,
  `approved_by` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `missed_record_requests`
--

INSERT INTO `missed_record_requests` (`id`, `machine_id`, `operator_id`, `production_date`, `hour_slot_from`, `hour_slot_to`, `status`, `created_at`, `approved_at`, `approved_by`) VALUES
(1, '1', '19', '2026-04-20', '08:00', '09:00', 'approved', '2026-04-20 08:05:48', '2026-04-20 13:41:04', 'Production Head'),
(2, '1', '19', '2026-04-20', '09:00', '10:00', 'approved', '2026-04-20 08:05:50', '2026-04-20 13:41:09', 'Production Head'),
(3, '1', '19', '2026-04-20', '10:00', '11:00', 'approved', '2026-04-20 08:05:52', '2026-04-20 13:41:13', 'Production Head'),
(4, '1', '19', '2026-04-20', '11:00', '12:00', 'approved', '2026-04-20 08:05:54', '2026-04-20 13:41:18', 'Production Head'),
(5, '1', '19', '2026-04-20', '12:00', '13:00', 'approved', '2026-04-20 08:05:57', '2026-04-20 13:41:21', 'Production Head'),
(6, '1', '19', '2026-04-20', '13:00', '14:00', 'approved', '2026-04-20 08:05:59', '2026-04-20 13:40:33', 'Production Head'),
(7, '1', '19', '2026-04-20', '14:00', '15:00', 'approved', '2026-04-20 08:06:02', '2026-04-20 13:40:25', 'Production Head'),
(8, '1', '19', '2026-04-20', '15:00', '16:00', 'approved', '2026-04-20 08:06:04', '2026-04-20 13:40:18', 'Production Head'),
(9, '1', '19', '2026-04-20', '06:00', '07:00', 'approved', '2026-04-20 08:06:59', '2026-04-20 09:56:07', 'Production Head'),
(10, '1', '19', '2026-04-20', '08:00', '09:00', 'approved', '2026-04-20 08:07:02', '2026-04-20 08:07:24', 'Production Head'),
(11, '1', '19', '2026-04-20', '09:00', '10:00', 'approved', '2026-04-20 08:07:05', '2026-04-20 08:07:59', 'Production Head'),
(12, '1', '19', '2026-04-20', '10:00', '11:00', 'approved', '2026-04-20 08:07:07', '2026-04-20 08:07:43', 'Production Head'),
(13, '1', '18', '2026-04-22', '15:00', '16:00', 'approved', '2026-04-22 11:32:03', '2026-04-22 11:32:18', 'Production Head'),
(14, '1', '18', '2026-04-22', '14:00', '15:00', 'approved', '2026-04-22 11:33:14', '2026-04-22 11:35:51', 'Production Head'),
(15, '1', '18', '2026-04-22', '14:00', '15:00', 'approved', '2026-04-22 11:34:12', '2026-04-22 11:35:44', 'Production Head');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `type` varchar(512) DEFAULT NULL,
  `message` varchar(512) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp(),
  `related_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `type`, `message`, `is_read`, `created_at`, `related_id`) VALUES
(1, 'approval_update', 'Production report #224 was approved', 1, '2026-03-09 13:27:13', 224),
(2, 'approval_update', 'Production report #223 was approved', 1, '2026-03-09 13:29:55', 223),
(3, 'production_report', 'New production report from Machine 1 for 1000ML Round BK pending approval', 1, '2026-03-09 15:16:57', NULL),
(4, 'sales_invoice', 'New sales invoice from Kalai pending approval', 1, '2026-03-09 17:37:12', 13),
(5, 'production_report', 'New production report from Machine 1 for 1000ML Round BK pending approval', 1, '2026-03-10 13:31:04', NULL),
(6, 'production_report', 'New production report from Machine 1 for 100ML Round WT COUNT pending approval', 0, '2026-03-10 17:19:38', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `operators`
--

CREATE TABLE `operators` (
  `operator_id` varchar(50) NOT NULL,
  `name` varchar(100) NOT NULL,
  `assigned_shift` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `operators`
--

INSERT INTO `operators` (`operator_id`, `name`, `assigned_shift`) VALUES
('OP001', 'Arjun Mehta', 'Morning'),
('OP002', 'Sanjay Dutt', 'Morning'),
('OP003', 'Rohan Varma', 'Night'),
('OP004', 'Vikram Singh', 'Night'),
('OP005', 'Priya Sharma', 'Morning'),
('OP006', 'Kalaiarasan T', 'Night'),
('OP007', 'Yuvaraj', 'Night'),
('OP008', 'Pandiyarajan', 'Morning'),
('OP009', 'Nethaji', 'Night'),
('OP010', 'Diwakar', 'Night'),
('OP011', 'Prabhakar', 'Morning'),
('Opfgg', 'Ftff', 'Morning');

-- --------------------------------------------------------

--
-- Table structure for table `operator_active_shifts`
--

CREATE TABLE `operator_active_shifts` (
  `id` int(11) NOT NULL,
  `operator_id` int(11) NOT NULL,
  `start_time` datetime DEFAULT current_timestamp(),
  `end_time` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `operator_active_shifts`
--

INSERT INTO `operator_active_shifts` (`id`, `operator_id`, `start_time`, `end_time`) VALUES
(1, 19, '2026-04-18 13:46:20', '2026-04-18 13:48:37'),
(2, 18, '2026-04-18 13:47:10', '2026-04-18 13:49:07'),
(3, 17, '2026-04-18 13:47:24', '2026-04-18 13:47:31'),
(4, 17, '2026-04-18 13:47:52', '2026-04-18 13:48:49'),
(5, 19, '2026-04-18 13:49:28', '2026-04-18 13:52:01'),
(6, 17, '2026-04-18 13:50:22', '2026-04-18 13:50:43'),
(7, 19, '2026-04-19 06:36:38', '2026-04-19 08:15:56'),
(8, 17, '2026-04-19 08:16:46', '2026-04-19 08:17:36'),
(9, 19, '2026-04-19 08:58:55', '2026-04-19 12:27:04'),
(10, 19, '2026-04-19 12:27:15', '2026-04-21 13:47:54'),
(11, 19, '2026-04-21 15:49:20', '2026-04-21 15:52:34'),
(12, 19, '2026-04-21 15:52:44', '2026-04-22 00:13:18'),
(13, 18, '2026-04-22 02:55:49', '2026-04-22 03:04:06'),
(14, 18, '2026-04-22 03:05:02', '2026-04-22 03:18:20'),
(15, 18, '2026-04-22 03:18:31', '2026-04-22 11:39:06'),
(16, 19, '2026-04-22 07:48:05', '2026-04-22 07:48:17'),
(17, 19, '2026-04-22 07:48:52', '2026-04-22 11:42:45'),
(18, 18, '2026-04-22 11:39:21', '2026-04-22 12:05:56'),
(19, 21, '2026-04-22 13:32:40', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `operator_machine_assignments`
--

CREATE TABLE `operator_machine_assignments` (
  `id` int(11) NOT NULL,
  `shift_id` int(11) NOT NULL,
  `machine_id` int(11) NOT NULL,
  `assigned_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `operator_machine_assignments`
--

INSERT INTO `operator_machine_assignments` (`id`, `shift_id`, `machine_id`, `assigned_at`) VALUES
(1, 1, 1, '2026-04-18 13:46:20'),
(2, 1, 2, '2026-04-18 13:46:20'),
(3, 1, 3, '2026-04-18 13:46:20'),
(4, 1, 4, '2026-04-18 13:46:20'),
(5, 2, 5, '2026-04-18 13:47:10'),
(6, 2, 6, '2026-04-18 13:47:10'),
(7, 2, 7, '2026-04-18 13:47:10'),
(8, 2, 8, '2026-04-18 13:47:10'),
(9, 3, 9, '2026-04-18 13:47:24'),
(10, 3, 10, '2026-04-18 13:47:24'),
(11, 4, 9, '2026-04-18 13:47:52'),
(12, 4, 10, '2026-04-18 13:47:52'),
(13, 5, 1, '2026-04-18 13:49:28'),
(14, 5, 2, '2026-04-18 13:49:28'),
(15, 5, 3, '2026-04-18 13:49:28'),
(16, 5, 4, '2026-04-18 13:49:28'),
(17, 6, 5, '2026-04-18 13:50:22'),
(18, 6, 6, '2026-04-18 13:50:22'),
(19, 6, 7, '2026-04-18 13:50:22'),
(20, 6, 8, '2026-04-18 13:50:22'),
(21, 7, 1, '2026-04-19 06:36:38'),
(22, 7, 2, '2026-04-19 06:36:38'),
(23, 7, 3, '2026-04-19 06:36:38'),
(24, 7, 4, '2026-04-19 06:36:38'),
(25, 8, 1, '2026-04-19 08:16:46'),
(26, 8, 2, '2026-04-19 08:16:46'),
(27, 8, 3, '2026-04-19 08:16:46'),
(28, 8, 4, '2026-04-19 08:16:46'),
(29, 9, 1, '2026-04-19 08:58:55'),
(30, 9, 2, '2026-04-19 08:58:55'),
(31, 10, 1, '2026-04-19 12:27:15'),
(32, 10, 2, '2026-04-19 12:27:15'),
(33, 10, 3, '2026-04-19 12:27:15'),
(34, 10, 4, '2026-04-19 12:27:15'),
(35, 10, 5, '2026-04-19 12:27:15'),
(36, 10, 6, '2026-04-19 12:27:15'),
(37, 10, 7, '2026-04-19 12:27:15'),
(38, 10, 8, '2026-04-19 12:27:15'),
(39, 10, 9, '2026-04-19 12:27:15'),
(40, 10, 10, '2026-04-19 12:27:15'),
(41, 11, 1, '2026-04-21 15:49:20'),
(42, 11, 2, '2026-04-21 15:49:20'),
(43, 11, 3, '2026-04-21 15:49:20'),
(44, 11, 4, '2026-04-21 15:49:20'),
(45, 11, 5, '2026-04-21 15:49:20'),
(46, 11, 6, '2026-04-21 15:49:20'),
(47, 11, 7, '2026-04-21 15:49:20'),
(48, 11, 8, '2026-04-21 15:49:20'),
(49, 12, 1, '2026-04-21 15:52:44'),
(50, 12, 2, '2026-04-21 15:52:44'),
(51, 12, 3, '2026-04-21 15:52:44'),
(52, 12, 4, '2026-04-21 15:52:44'),
(53, 12, 5, '2026-04-21 15:52:44'),
(54, 12, 6, '2026-04-21 15:52:44'),
(55, 12, 7, '2026-04-21 15:52:44'),
(56, 12, 8, '2026-04-21 15:52:44'),
(57, 13, 1, '2026-04-22 02:55:49'),
(58, 13, 2, '2026-04-22 02:55:49'),
(59, 13, 3, '2026-04-22 02:55:49'),
(60, 13, 4, '2026-04-22 02:55:49'),
(61, 13, 5, '2026-04-22 02:55:49'),
(62, 13, 6, '2026-04-22 02:55:49'),
(63, 13, 7, '2026-04-22 02:55:49'),
(64, 13, 8, '2026-04-22 02:55:49'),
(65, 14, 1, '2026-04-22 03:05:02'),
(66, 14, 2, '2026-04-22 03:05:02'),
(67, 14, 3, '2026-04-22 03:05:02'),
(68, 14, 4, '2026-04-22 03:05:02'),
(69, 14, 5, '2026-04-22 03:05:02'),
(70, 14, 6, '2026-04-22 03:05:02'),
(71, 14, 7, '2026-04-22 03:05:02'),
(72, 14, 8, '2026-04-22 03:05:02'),
(73, 15, 1, '2026-04-22 03:18:31'),
(74, 15, 2, '2026-04-22 03:18:31'),
(75, 15, 3, '2026-04-22 03:18:31'),
(76, 15, 4, '2026-04-22 03:18:31'),
(77, 15, 5, '2026-04-22 03:18:31'),
(78, 15, 6, '2026-04-22 03:18:31'),
(79, 15, 7, '2026-04-22 03:18:31'),
(80, 15, 8, '2026-04-22 03:18:31'),
(81, 16, 9, '2026-04-22 07:48:05'),
(82, 16, 10, '2026-04-22 07:48:05'),
(83, 17, 9, '2026-04-22 07:48:52'),
(84, 17, 10, '2026-04-22 07:48:52'),
(85, 18, 1, '2026-04-22 11:39:21'),
(86, 18, 3, '2026-04-22 11:39:21'),
(87, 18, 4, '2026-04-22 11:39:21'),
(88, 18, 5, '2026-04-22 11:39:21'),
(89, 19, 1, '2026-04-22 13:32:40'),
(90, 19, 2, '2026-04-22 13:32:40');

-- --------------------------------------------------------

--
-- Table structure for table `operator_report`
--

CREATE TABLE `operator_report` (
  `id` int(11) NOT NULL,
  `machine_id` int(11) DEFAULT NULL,
  `machine_name` varchar(512) DEFAULT NULL,
  `operator_name` varchar(512) DEFAULT NULL,
  `shift` varchar(512) DEFAULT NULL,
  `total_production_count` int(11) DEFAULT NULL,
  `total_production_weight_gm` decimal(12,2) DEFAULT NULL,
  `total_production_weight_kg` decimal(12,2) DEFAULT NULL,
  `wastage` varchar(512) DEFAULT NULL,
  `run_start_time` datetime DEFAULT NULL,
  `run_end_time` datetime DEFAULT NULL,
  `timestamp` datetime DEFAULT current_timestamp(),
  `product_name` varchar(255) DEFAULT NULL,
  `semi_finished_product` varchar(255) DEFAULT NULL,
  `wastage_lumps` decimal(15,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `operator_report`
--

INSERT INTO `operator_report` (`id`, `machine_id`, `machine_name`, `operator_name`, `shift`, `total_production_count`, `total_production_weight_gm`, `total_production_weight_kg`, `wastage`, `run_start_time`, `run_end_time`, `timestamp`, `product_name`, `semi_finished_product`, `wastage_lumps`) VALUES
(1, 1, 'UNIT 1', 'op@factory.com', 'Day Shift', 452, 10848.00, 10.85, '2 kg ', '2026-03-12 06:45:09', '2026-03-12 06:52:41', '2026-03-12 06:52:41', NULL, NULL, 0.00),
(2, 1, 'UNIT 1', 'op@factory.com', 'Night Shift', 58, 1392.00, 1.39, 'gsdfnghg', '2026-03-12 06:55:49', '2026-03-12 06:56:28', '2026-03-12 06:56:28', NULL, NULL, 0.00),
(3, 1, 'UNIT 1', 'head@factory.com', 'Day Shift', 52, 1248.00, 1.25, '5kg', '2026-03-12 07:01:16', '2026-03-12 07:02:12', '2026-03-12 07:02:12', NULL, NULL, 0.00),
(4, 1, 'UNIT 1', 'op@factory.com', 'Day Shift', 395240, 0.00, 0.00, 'Ghh\\n', '2026-03-22 10:29:15', '2026-03-22 10:29:32', '2026-03-22 10:29:33', NULL, NULL, 0.00),
(5, 1, 'UNIT 1', 'op@factory.com', 'Day Shift', 1820, 0.00, 0.00, 'Gh', '2026-03-22 10:29:51', '2026-03-22 11:00:20', '2026-03-22 11:00:21', NULL, NULL, 0.00),
(6, 1, 'UNIT 1', 'op@factory.com', 'Night Shift', 2640, 0.00, 0.00, 'ghj', '2026-03-22 15:50:17', '2026-03-22 16:08:31', '2026-03-22 16:08:28', NULL, NULL, 0.00),
(7, 1, 'UNIT 1', 'op@factory.com', 'Day Shift', 688, 0.00, 0.00, 'Gy', '2026-03-22 16:23:46', '2026-03-22 16:31:08', '2026-03-22 16:31:09', NULL, NULL, 0.00),
(8, 1, 'UNIT 1', 'op@factory.com', 'Day Shift', 676, 16224.00, 16.22, '5 ', '2026-03-24 08:47:15', '2026-03-24 09:02:36', '2026-03-24 09:02:36', NULL, NULL, 0.00),
(9, 2, 'UNIT 2', 'op', 'Day Shift', 6, 110.82, 0.11, '1', '2026-04-03 12:04:53', '2026-04-03 12:05:57', '2026-04-03 12:05:57', NULL, NULL, 0.00),
(10, 2, 'UNIT 2', 'op', 'Day Shift', 3, 55.41, 0.06, 'wedwrfg', '2026-04-03 16:15:52', '2026-04-03 16:16:15', '2026-04-03 16:16:15', '1test', '1test lid', 0.00),
(11, 2, 'UNIT 2', 'op', 'Day Shift', 69, 2428.80, 2.43, '5', '2026-04-04 11:37:50', '2026-04-04 11:40:45', '2026-04-04 11:40:46', NULL, NULL, 0.00),
(12, 2, 'UNIT 2', 'op', 'Day Shift', 280, 7131.60, 7.13, 'zxfvgcbv n', '2026-04-04 12:41:28', '2026-04-04 12:51:30', '2026-04-04 12:51:30', NULL, '3test container', 0.00),
(13, 2, 'UNIT 2', 'op', 'Night Shift', 242, 6163.74, 6.16, 'ASFDGFHGJHMJ,', '2026-04-04 13:34:36', '2026-04-04 13:47:21', '2026-04-04 13:47:22', NULL, '2test lid', 23.00),
(14, 1, 'UNIT 1', 'op', 'Day Shift', 37, 37.00, 0.04, 'Dd\\n', '2026-04-08 17:08:21', '2026-04-08 17:10:04', '2026-04-08 17:10:06', NULL, NULL, 0.00),
(15, 1, 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'op', 'Day Shift', 401, 401.00, 0.40, 'color change', '2026-04-09 12:45:59', '2026-04-09 13:00:08', '2026-04-09 13:00:08', '3test container', '3test container', 5.00),
(16, 1, 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'acc', 'Night Shift', 2, 2.00, 0.00, 'ftyhu', '2026-04-16 08:46:40', '2026-04-16 08:46:56', '2026-04-16 14:16:56', '2test lid', '2test lid', 5.00),
(17, 1, 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'thangam', 'Day Shift', 4, 4.00, 0.00, '.200 gm', '2026-04-18 04:50:13', '2026-04-18 04:51:41', '2026-04-18 04:51:42', '2test lid', '2test lid', 1.00),
(18, 1, 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'op@factory.com', 'Night Shift', 48, 48.00, 0.05, 'no', '2026-04-18 13:10:57', '2026-04-18 13:15:49', '2026-04-18 13:15:47', '2test lid', '2test lid', 12.00),
(19, 1, 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'thangam', 'Day Shift', 1197, 1197.00, 1.20, '0', '2026-04-19 06:37:07', '2026-04-19 08:17:26', '2026-04-19 08:17:25', '2test lid', '2test lid', 0.00),
(20, 1, 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'mohan', 'Night Shift', 14, 14.00, 0.01, 'zv', '2026-04-19 08:59:18', '2026-04-19 09:00:43', '2026-04-19 09:00:40', '2test lid', '2test lid', 2.00),
(21, 1, 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'mohan', 'Day Shift', 4, 4.00, 0.00, '5', '2026-04-19 14:57:52', '2026-04-19 14:58:31', '2026-04-19 14:58:32', '2test lid', '2test lid', 1.00),
(22, 9, 'MACHINE -9(250 TONNAGE SHIBAURA MACHINE 2026)', 'mohan', 'Night Shift', 36240, 36240.00, 36.24, '10', '2026-04-20 13:07:55', '2026-04-21 09:16:50', '2026-04-21 09:16:50', '2test lid', '2test lid', 1.00),
(23, 1, 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'tirupathi', 'Day Shift', 17064, 724708.08, 724.71, '20', '2026-04-22 03:19:24', '2026-04-22 11:38:49', '2026-04-22 11:38:50', '500/650/750/1000ML REC LID NATURAL', '500/650/750/1000ML REC LID NATURAL', 20.00),
(24, 9, 'MACHINE -9(250 TONNAGE SHIBAURA MACHINE 2026)', 'mohan', 'Day Shift', 1242, 1242.00, 1.24, 'Nil', '2026-04-22 10:58:55', '2026-04-22 11:41:01', '2026-04-22 11:41:01', 'TEST LID', 'TEST LID', 0.00),
(25, 10, 'MACHINE -10(180 TONNAGE SHIBAURA MACHINE 2026)', 'mohan', 'Day Shift', 988, 988.00, 0.99, '0', '2026-04-22 11:09:06', '2026-04-22 11:42:38', '2026-04-22 11:42:38', 'TEST LID', 'TEST LID', 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `packing_list`
--

CREATE TABLE `packing_list` (
  `id` int(11) NOT NULL,
  `batch_number` varchar(20) DEFAULT NULL,
  `sales_history_id` int(11) DEFAULT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `customer_name` varchar(255) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Available to packing',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `packing_list_item`
--

CREATE TABLE `packing_list_item` (
  `id` int(11) NOT NULL,
  `packing_list_id` int(11) NOT NULL,
  `product_id` int(11) DEFAULT NULL,
  `product_name` varchar(255) DEFAULT NULL,
  `quantity` decimal(12,3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `packing_material_report`
--

CREATE TABLE `packing_material_report` (
  `id` int(11) NOT NULL,
  `packing_list_id` int(11) DEFAULT NULL,
  `batch_number` varchar(20) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'Pending',
  `created_at` datetime DEFAULT current_timestamp(),
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `packing_material_report_item`
--

CREATE TABLE `packing_material_report_item` (
  `id` int(11) NOT NULL,
  `report_id` int(11) NOT NULL,
  `packing_material_id` int(11) DEFAULT NULL,
  `quantity` decimal(12,3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `packing_sticker`
--

CREATE TABLE `packing_sticker` (
  `id` int(11) NOT NULL,
  `packing_list_id` int(11) DEFAULT NULL,
  `sticker_number` varchar(50) DEFAULT NULL,
  `batch_number` varchar(20) DEFAULT NULL,
  `weight` decimal(12,3) DEFAULT NULL,
  `qr_data` varchar(512) DEFAULT NULL,
  `qr_image_path` varchar(512) DEFAULT NULL,
  `pdf_path` varchar(512) DEFAULT NULL,
  `status` varchar(50) DEFAULT 'Pending',
  `created_at` datetime DEFAULT current_timestamp(),
  `box_size` varchar(255) DEFAULT NULL,
  `color` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `pause_logs`
--

CREATE TABLE `pause_logs` (
  `id` int(11) NOT NULL,
  `machine_id` int(11) DEFAULT NULL,
  `machine_name` varchar(255) DEFAULT NULL,
  `pause_reason` text DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp(),
  `accumulated_output` int(11) DEFAULT NULL,
  `total_output` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `pause_logs`
--

INSERT INTO `pause_logs` (`id`, `machine_id`, `machine_name`, `pause_reason`, `timestamp`, `accumulated_output`, `total_output`) VALUES
(1, 1, 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Current cut ', '2026-04-18 08:48:07', 116, 116),
(2, 1, 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'machine breack down \n', '2026-04-18 09:04:10', 161, 161),
(3, 1, 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'POWER CUT', '2026-04-19 13:29:04', 1903, 1903),
(4, 1, 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'POWER CUT', '2026-04-19 13:29:31', 1912, 1912),
(5, 1, 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'POWER CUT', '2026-04-19 14:16:42', 3324, 3324),
(6, 1, 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Repair ', '2026-04-19 14:16:54', 3328, 3328),
(7, 1, 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'POWER CUT', '2026-04-19 14:17:03', 3330, 3330),
(8, 1, 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'POWER CUT', '2026-04-19 14:28:33', 3351, 3351),
(9, 1, 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'POWER CUT', '2026-04-19 14:57:43', 871, 871),
(10, 9, 'MACHINE -9(250 TONNAGE SHIBAURA MACHINE 2026)', 'repair', '2026-04-20 13:08:13', 9, 9),
(11, 9, 'MACHINE -9(250 TONNAGE SHIBAURA MACHINE 2026)', 'pause', '2026-04-20 13:08:44', 19, 19),
(12, 9, 'MACHINE -9(250 TONNAGE SHIBAURA MACHINE 2026)', 'stopping', '2026-04-20 14:12:02', 1915, 1915),
(13, 1, 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'POWER CUT', '2026-04-21 15:52:03', 62728, 62728),
(14, 2, 'MACHINE -2(250 TONNAGE SHIBAURA MACHINE 2024)', 'POWER CUT', '2026-04-21 15:52:03', 107358, 107358),
(15, 3, 'MACHINE -3(250 TONNAGE SHIBAURA MACHINE 2024)', 'POWER CUT', '2026-04-21 15:52:03', 35758, 35758),
(16, 4, 'MACHINE -4(180 TONNAGE SHIBAURA MACHINE 2024)', 'POWER CUT', '2026-04-21 15:52:03', 35720, 35720),
(17, 5, 'MACHINE -5(180 TONNAGE SHIBAURA MACHINE 2024)', 'POWER CUT', '2026-04-21 15:52:03', 35692, 35692),
(18, 6, 'MACHINE -6(180 TONNAGE SHIBAURA MACHINE 2025)', 'POWER CUT', '2026-04-21 15:52:03', 35664, 35664),
(19, 7, 'MACHINE -7(180 TONNAGE SHIBAURA MACHINE 2025)', 'POWER CUT', '2026-04-21 15:52:03', 71280, 71280),
(20, 8, 'MACHINE -8(250 TONNAGE SHIBAURA MACHINE 2025)', 'POWER CUT', '2026-04-21 15:52:03', 35616, 35616),
(21, 1, 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'POWER CUT', '2026-04-22 03:03:14', 82860, 82860),
(22, 2, 'MACHINE -2(250 TONNAGE SHIBAURA MACHINE 2024)', 'POWER CUT', '2026-04-22 03:03:14', 141870, 141870),
(23, 3, 'MACHINE -3(250 TONNAGE SHIBAURA MACHINE 2024)', 'POWER CUT', '2026-04-22 03:03:14', 47262, 47262),
(24, 4, 'MACHINE -4(180 TONNAGE SHIBAURA MACHINE 2024)', 'POWER CUT', '2026-04-22 03:03:14', 47224, 47224),
(25, 5, 'MACHINE -5(180 TONNAGE SHIBAURA MACHINE 2024)', 'POWER CUT', '2026-04-22 03:03:14', 47196, 47196),
(26, 6, 'MACHINE -6(180 TONNAGE SHIBAURA MACHINE 2025)', 'POWER CUT', '2026-04-22 03:03:14', 47168, 47168),
(27, 7, 'MACHINE -7(180 TONNAGE SHIBAURA MACHINE 2025)', 'POWER CUT', '2026-04-22 03:03:14', 94288, 94288),
(28, 8, 'MACHINE -8(250 TONNAGE SHIBAURA MACHINE 2025)', 'POWER CUT', '2026-04-22 03:03:14', 47120, 47120),
(29, 1, 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'POWER CUT', '2026-04-22 03:18:16', 83304, 83304),
(30, 9, 'MACHINE -9(250 TONNAGE SHIBAURA MACHINE 2026)', 'Pause', '2026-04-22 10:33:25', 4761, 4761),
(31, 1, 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'POWER CUT', '2026-04-22 11:36:36', 17044, 17044),
(32, 2, 'MACHINE -2(250 TONNAGE SHIBAURA MACHINE 2024)', 'POWER CUT', '2026-04-22 11:36:36', 25434, 25434),
(33, 3, 'MACHINE -3(250 TONNAGE SHIBAURA MACHINE 2024)', 'POWER CUT', '2026-04-22 11:36:36', 16904, 16904),
(34, 4, 'MACHINE -4(180 TONNAGE SHIBAURA MACHINE 2024)', 'POWER CUT', '2026-04-22 11:36:36', 8436, 8436),
(35, 5, 'MACHINE -5(180 TONNAGE SHIBAURA MACHINE 2024)', 'POWER CUT', '2026-04-22 11:36:36', 8418, 8418),
(36, 6, 'MACHINE -6(180 TONNAGE SHIBAURA MACHINE 2025)', 'POWER CUT', '2026-04-22 11:36:36', 4644, 4644),
(37, 7, 'MACHINE -7(180 TONNAGE SHIBAURA MACHINE 2025)', 'POWER CUT', '2026-04-22 11:36:36', 33600, 33600),
(38, 8, 'MACHINE -8(250 TONNAGE SHIBAURA MACHINE 2025)', 'POWER CUT', '2026-04-22 11:36:36', 8386, 8386),
(39, 9, 'MACHINE -9(250 TONNAGE SHIBAURA MACHINE 2026)', 'POWER CUT', '2026-04-22 11:36:36', 1130, 1130),
(40, 10, 'MACHINE -10(180 TONNAGE SHIBAURA MACHINE 2026)', 'POWER CUT', '2026-04-22 11:36:36', 825, 825),
(41, 1, 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'POWER CUT', '2026-04-22 11:36:58', 17052, 17052),
(42, 2, 'MACHINE -2(250 TONNAGE SHIBAURA MACHINE 2024)', 'POWER CUT', '2026-04-22 11:36:58', 25446, 25446),
(43, 3, 'MACHINE -3(250 TONNAGE SHIBAURA MACHINE 2024)', 'POWER CUT', '2026-04-22 11:36:58', 16912, 16912),
(44, 4, 'MACHINE -4(180 TONNAGE SHIBAURA MACHINE 2024)', 'POWER CUT', '2026-04-22 11:36:58', 8440, 8440),
(45, 5, 'MACHINE -5(180 TONNAGE SHIBAURA MACHINE 2024)', 'POWER CUT', '2026-04-22 11:36:58', 8422, 8422),
(46, 6, 'MACHINE -6(180 TONNAGE SHIBAURA MACHINE 2025)', 'POWER CUT', '2026-04-22 11:36:58', 4648, 4648),
(47, 7, 'MACHINE -7(180 TONNAGE SHIBAURA MACHINE 2025)', 'POWER CUT', '2026-04-22 11:36:58', 33616, 33616),
(48, 8, 'MACHINE -8(250 TONNAGE SHIBAURA MACHINE 2025)', 'POWER CUT', '2026-04-22 11:36:58', 8390, 8390),
(49, 9, 'MACHINE -9(250 TONNAGE SHIBAURA MACHINE 2026)', 'POWER CUT', '2026-04-22 11:36:58', 1139, 1139),
(50, 10, 'MACHINE -10(180 TONNAGE SHIBAURA MACHINE 2026)', 'POWER CUT', '2026-04-22 11:36:58', 834, 834),
(51, 1, 'MACHINE -1(250 TONNAGE SHIBAURA MACHINE 2024)', 'Rob\no', '2026-04-22 11:37:28', 17060, 17060),
(52, 2, 'MACHINE -2(250 TONNAGE SHIBAURA MACHINE 2024)', 'POWER CUT', '2026-04-22 12:04:46', 26862, 26862),
(53, 3, 'MACHINE -3(250 TONNAGE SHIBAURA MACHINE 2024)', 'POWER CUT', '2026-04-22 12:04:46', 17856, 17856),
(54, 4, 'MACHINE -4(180 TONNAGE SHIBAURA MACHINE 2024)', 'POWER CUT', '2026-04-22 12:04:46', 8912, 8912),
(55, 6, 'MACHINE -6(180 TONNAGE SHIBAURA MACHINE 2025)', 'POWER CUT', '2026-04-22 12:04:46', 5120, 5120),
(56, 7, 'MACHINE -7(180 TONNAGE SHIBAURA MACHINE 2025)', 'POWER CUT', '2026-04-22 12:04:46', 35504, 35504),
(57, 8, 'MACHINE -8(250 TONNAGE SHIBAURA MACHINE 2025)', 'POWER CUT', '2026-04-22 12:04:46', 8862, 8862),
(58, 10, 'MACHINE -10(180 TONNAGE SHIBAURA MACHINE 2026)', 'POWER CUT', '2026-04-22 12:04:46', 1670, 1670);

-- --------------------------------------------------------

--
-- Table structure for table `production_logs`
--

CREATE TABLE `production_logs` (
  `log_id` int(11) NOT NULL,
  `machine_id` int(11) NOT NULL,
  `shift` varchar(50) DEFAULT NULL,
  `material_type_1` varchar(100) DEFAULT NULL,
  `material_qty_1` decimal(10,2) DEFAULT NULL,
  `material_type_2` varchar(100) DEFAULT NULL,
  `material_qty_2` decimal(10,2) DEFAULT NULL,
  `material_type_3` varchar(100) DEFAULT NULL,
  `material_qty_3` decimal(10,2) DEFAULT NULL,
  `material_type_4` varchar(100) DEFAULT NULL,
  `material_qty_4` decimal(10,2) DEFAULT NULL,
  `material_color` varchar(100) DEFAULT NULL,
  `color_qty` decimal(10,2) DEFAULT NULL,
  `mold_type` varchar(100) DEFAULT NULL,
  `cavity` int(11) DEFAULT NULL,
  `cycle_timing` int(11) DEFAULT NULL,
  `start_time` datetime DEFAULT NULL,
  `stop_time` datetime DEFAULT NULL,
  `runned_time` varchar(50) DEFAULT NULL,
  `total_output` int(11) DEFAULT NULL,
  `stop_reason` varchar(512) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `approval_status` varchar(50) DEFAULT 'pending',
  `session_start_time` datetime DEFAULT NULL,
  `product_name` varchar(255) DEFAULT NULL,
  `operator_name` varchar(512) DEFAULT NULL,
  `rejection_reason` varchar(512) DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  `semi_finished_product` varchar(255) DEFAULT NULL,
  `wastage_lumps` decimal(15,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `production_logs`
--

INSERT INTO `production_logs` (`log_id`, `machine_id`, `shift`, `material_type_1`, `material_qty_1`, `material_type_2`, `material_qty_2`, `material_type_3`, `material_qty_3`, `material_type_4`, `material_qty_4`, `material_color`, `color_qty`, `mold_type`, `cavity`, `cycle_timing`, `start_time`, `stop_time`, `runned_time`, `total_output`, `stop_reason`, `created_at`, `approval_status`, `session_start_time`, `product_name`, `operator_name`, `rejection_reason`, `is_deleted`, `semi_finished_product`, `wastage_lumps`) VALUES
(1, 2, 'Day Shift', 'MRPL', 1.00, 'None', 0.00, 'None', 0.00, 'None', 0.00, 'Natural', 0.00, '100 ML ROUND LID NATURE 2024', 1, 5, '2026-04-03 12:04:53', '2026-04-03 12:05:27', NULL, 6, 'Hello', '2026-04-03 12:05:45', 'pending', NULL, '1test', NULL, NULL, 0, NULL, 0.00),
(2, 2, 'Day Shift', 'MRPL', 1.00, 'None', 0.00, 'None', 0.00, 'None', 0.00, 'Natural', 0.00, '100 ML ROUND LID NATURE 2024', 1, 5, '2026-04-03 16:15:52', '2026-04-03 16:16:10', NULL, 3, 'qdwfegrhtyj', '2026-04-03 16:16:11', 'pending', NULL, '1test', NULL, NULL, 0, '1test lid', 0.00),
(3, 2, 'Night Shift', 'MRPL', 1.00, 'None', 0.00, 'None', 0.00, 'None', 0.00, 'Natural', 0.00, '100 ML ROUND LID NATURE 2024', 1, 5, '2026-04-04 08:57:39', '2026-04-04 09:27:04', NULL, 336, 'fhdgfh', '2026-04-04 09:30:45', 'pending', NULL, NULL, NULL, NULL, 0, '1test lid', 0.00),
(4, 2, 'Day Shift', 'MRPL', 1.00, 'None', 0.00, 'None', 0.00, 'None', 0.00, 'Natural', 0.00, '250 ML ROUND CONTAINER NATURAL 2024', 1, 2, '2026-04-04 11:37:50', '2026-04-04 11:40:21', NULL, 69, 'Shift', '2026-04-04 11:40:36', 'approved', NULL, '250ML ROUND  CONTAINER( LID-BLU, BOTT-NAT)', 'Hello', NULL, 0, NULL, 0.00),
(5, 2, 'Day Shift', 'MRPL', 1.00, 'None', 0.00, 'None', 0.00, 'None', 0.00, 'Natural', 0.00, '500 ML ROUND CONTAINER BLACK 2024', 1, 2, '2026-04-04 12:41:28', '2026-04-04 12:50:53', NULL, 280, 'adsfghjk', '2026-04-04 12:51:21', 'pending', NULL, NULL, NULL, NULL, 0, '3test container', 0.00),
(6, 2, 'Night Shift', 'MRPL', 1.00, 'None', 0.00, 'None', 0.00, 'None', 0.00, 'Natural', 0.00, '500 ML ROUND CONTAINER BLACK 2024', 1, 2, '2026-04-04 13:34:36', '2026-04-04 13:42:44', NULL, 242, 'aSFDGFGH', '2026-04-04 13:43:33', 'pending', NULL, NULL, NULL, NULL, 0, '2test lid', 0.00),
(7, 1, 'Day Shift', 'MRPL', 1.00, 'None', 0.00, 'None', 0.00, 'None', 0.00, 'Natural', 0.00, 'test', 1, 2, '2026-04-08 17:08:21', '2026-04-08 17:09:42', NULL, 37, 'Mudunjuruchu', '2026-04-08 17:09:56', 'pending', NULL, '1test', NULL, NULL, 0, NULL, 0.00),
(8, 1, 'Day Shift', 'MRPL', 2.00, 'None', 0.00, 'None', 0.00, 'None', 0.00, 'Natural', 0.00, 'test', 1, 2, '2026-04-09 12:45:59', '2026-04-09 12:59:27', NULL, 401, 'hello', '2026-04-09 12:59:38', 'pending', NULL, NULL, NULL, NULL, 0, '3test container', 0.00),
(9, 1, 'Night Shift', 'MRPL', 1.00, 'None', 0.00, 'None', 0.00, 'None', 0.00, 'Natural', 0.00, 'test', 1, 2, NULL, '2026-04-16 08:46:48', NULL, 2, 'fgh', '2026-04-16 14:16:49', 'pending', '2026-04-16 08:46:40', NULL, NULL, NULL, 0, '2test lid', 0.00),
(10, 1, 'Day Shift', 'RELIANCE AM 650', 1.00, 'None', 0.00, 'None', 0.00, 'None', 0.00, 'Natural', 0.00, 'test', 1, 2, NULL, '2026-04-17 13:07:33', NULL, 5, 'Hi', '2026-04-17 13:07:35', 'pending', '2026-04-17 13:07:20', NULL, NULL, NULL, 0, '2test lid', 0.00),
(11, 1, 'Day Shift', 'RELIANCE AM 650', 1.00, 'None', 0.00, 'None', 0.00, 'None', 0.00, 'Natural', 0.00, 'test', 1, 5, NULL, '2026-04-18 04:50:43', NULL, 4, 'Shift over \n', '2026-04-18 04:50:51', 'pending', '2026-04-18 04:50:13', NULL, NULL, NULL, 0, '2test lid', 0.00),
(12, 2, 'Day Shift', 'MRPL', 10.00, 'None', 0.00, 'None', 0.00, 'None', 0.00, 'Natural', 0.00, '100 ML ROUND CONTAINER BLACK 2024', 1, 5, NULL, '2026-04-18 09:12:26', NULL, 305, 'completed ', '2026-04-18 09:13:47', 'approved', '2026-04-18 08:46:54', NULL, 'Mohan', NULL, 0, '2test lid', 0.00),
(13, 1, 'Night Shift', 'MRPL', 1.00, 'None', 0.00, 'None', 0.00, 'None', 0.00, 'Natural', 0.00, 'test', 1, 5, NULL, '2026-04-18 13:15:07', NULL, 48, 'shut down\nshift over', '2026-04-18 13:15:20', 'pending', '2026-04-18 13:10:57', NULL, NULL, NULL, 0, '2test lid', 0.00),
(14, 1, 'Day Shift', 'MRPL', 1.00, 'None', 0.00, 'None', 0.00, 'None', 0.00, 'Natural', 0.00, 'test', 1, 5, NULL, '2026-04-19 08:17:05', NULL, 1197, 'Shif over ', '2026-04-19 08:17:09', 'approved', '2026-04-19 06:37:07', NULL, 'Thirupathi ', NULL, 0, '2test lid', 0.00),
(15, 1, 'Night Shift', 'RELIANCE AM 650', 1.00, 'None', 0.00, 'None', 0.00, 'None', 0.00, 'Natural', 0.00, 'test', 1, 5, NULL, '2026-04-19 09:00:31', NULL, 14, 'sadaa', '2026-04-19 09:00:34', 'approved', '2026-04-19 08:59:18', NULL, 'Mohan ', NULL, 0, '2test lid', 0.00),
(16, 1, 'Day Shift', 'MRPL', 8.00, 'None', 0.00, 'None', 0.00, 'None', 0.00, 'Natural', 0.00, 'test', 1, 2, NULL, '2026-04-19 14:58:07', NULL, 4, 'Sh la', '2026-04-19 14:58:22', 'approved', '2026-04-19 14:57:52', NULL, 'Mohan ', NULL, 0, '2test lid', 0.00),
(17, 9, 'Night Shift', 'MRPL', 1.00, 'None', 0.00, 'None', 0.00, 'None', 0.00, 'Natural', 0.00, 'test', 1, 2, NULL, '2026-04-21 09:16:29', NULL, 36240, 'Stop', '2026-04-21 09:16:42', 'approved', '2026-04-20 13:07:55', NULL, 'Yes', NULL, 0, '2test lid', 0.00),
(18, 9, 'Day Shift', 'MRPL', 1.00, 'None', 0.00, 'None', 0.00, 'None', 0.00, 'Natural', 0.00, 'test', 1, 2, NULL, '2026-04-22 10:56:55', NULL, 4765, 'ello', '2026-04-22 10:56:57', 'approved', '2026-04-22 07:54:42', NULL, 'Mohan', NULL, 0, '2test lid', 0.00),
(19, 10, 'Day Shift', 'MRPL', 1.00, 'None', 0.00, 'None', 0.00, 'None', 0.00, 'Natural', 0.00, 'test', 1, 2, NULL, '2026-04-22 10:59:19', NULL, 5587, 'hello\n', '2026-04-22 10:59:50', 'approved', '2026-04-22 07:52:57', NULL, 'Mohan', NULL, 0, '3test container', 0.00),
(20, 1, 'Day Shift', 'RELIANCE AM 650', 150.00, 'RELIANCE B 650N', 15.00, 'RELIANCE SRM 100', 15.00, 'None', 0.00, 'Natural', 0.00, '500/650/750/1000ML REC LID NATURAL 2025', 4, 7, NULL, '2026-04-22 11:37:55', NULL, 17064, 'Shift over', '2026-04-22 11:38:22', 'pending', '2026-04-22 03:19:24', NULL, NULL, NULL, 0, '500/650/750/1000ML REC LID NATURAL', 0.00),
(21, 9, 'Day Shift', 'RELIANCE AM 650', 1.00, 'None', 0.00, 'None', 0.00, 'None', 0.00, 'Natural', 0.00, 'test', 1, 2, NULL, '2026-04-22 11:40:50', NULL, 1242, 'Thank yoi', '2026-04-22 11:40:52', 'pending', '2026-04-22 10:58:55', NULL, NULL, NULL, 0, 'TEST LID', 0.00),
(22, 10, 'Day Shift', 'RELIANCE B 650N', 1.00, 'None', 0.00, 'None', 0.00, 'None', 0.00, 'Natural', 0.00, 'test', 1, 2, NULL, '2026-04-22 11:42:30', NULL, 988, 'Th K you ', '2026-04-22 11:42:31', 'pending', '2026-04-22 11:09:06', NULL, NULL, NULL, 0, 'TEST LID', 0.00),
(23, 5, 'Day Shift', 'RELIANCE AM 650', 150.00, 'RELIANCE B 650N', 15.00, 'RELIANCE SRM 100', 15.00, 'None', 0.00, 'LINGAM BLACK', 1.80, '650 ML REC CONTAINER BLACK 2026', 2, 7, NULL, '2026-04-22 11:47:19', NULL, 8592, 'Die change ', '2026-04-22 11:47:21', 'pending', '2026-04-22 03:25:33', NULL, NULL, NULL, 0, '650 ML REC CONTAINER BLACK', 0.00),
(24, 3, 'Day Shift', 'RELIANCE AM 650', 150.00, 'RELIANCE B 650N', 15.00, 'RELIANCE SRM 100', 15.00, 'None', 0.00, 'Natural', 0.00, '250 ML ROUND CONTAINER NATURAL 2024', 4, 7, NULL, '2026-04-22 12:05:24', NULL, 17864, 'Shift over ', '2026-04-22 12:05:34', 'pending', '2026-04-22 03:23:28', NULL, NULL, NULL, 0, '250 ML ROUND CONTAINER NATURAL', 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `product_semi_finished_map`
--

CREATE TABLE `product_semi_finished_map` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `semi_finished_product_id` int(11) NOT NULL,
  `quantity_per_piece` decimal(10,2) NOT NULL DEFAULT 1.00,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `product_semi_finished_map`
--

INSERT INTO `product_semi_finished_map` (`id`, `product_id`, `semi_finished_product_id`, `quantity_per_piece`, `created_at`, `updated_at`) VALUES
(25, 4, 15, 1.00, '2026-04-01 01:28:47', '2026-04-01 01:28:47'),
(26, 4, 14, 1.00, '2026-04-01 01:28:47', '2026-04-01 01:28:47'),
(29, 11, 42, 1.00, '2026-04-01 01:37:03', '2026-04-01 01:37:03'),
(30, 11, 18, 1.00, '2026-04-01 01:37:03', '2026-04-01 01:37:03'),
(31, 10, 20, 1.00, '2026-04-01 01:38:10', '2026-04-01 01:38:10'),
(32, 10, 17, 1.00, '2026-04-01 01:38:10', '2026-04-01 01:38:10'),
(33, 7, 20, 1.00, '2026-04-01 01:39:44', '2026-04-01 01:39:44'),
(34, 7, 18, 1.00, '2026-04-01 01:39:44', '2026-04-01 01:39:44'),
(35, 8, 20, 1.00, '2026-04-01 01:40:33', '2026-04-01 01:40:33'),
(36, 8, 19, 1.00, '2026-04-01 01:40:33', '2026-04-01 01:40:33'),
(37, 9, 12, 1.00, '2026-04-01 01:41:22', '2026-04-01 01:41:22'),
(38, 9, 18, 1.00, '2026-04-01 01:41:22', '2026-04-01 01:41:22'),
(39, 84, 15, 1.00, '2026-04-01 01:42:32', '2026-04-01 01:42:32'),
(40, 84, 41, 1.00, '2026-04-01 01:42:32', '2026-04-01 01:42:32'),
(56, 86, 40, 1.00, '2026-04-01 01:49:19', '2026-04-01 01:49:19'),
(57, 86, 32, 1.00, '2026-04-01 01:49:19', '2026-04-01 01:49:19'),
(58, 85, 40, 1.00, '2026-04-01 01:49:51', '2026-04-01 01:49:51'),
(59, 85, 31, 1.00, '2026-04-01 01:49:51', '2026-04-01 01:49:51'),
(60, 87, 40, 1.00, '2026-04-01 01:50:25', '2026-04-01 01:50:25'),
(61, 87, 33, 1.00, '2026-04-01 01:50:25', '2026-04-01 01:50:25'),
(71, 76, 30, 1.00, '2026-04-01 01:54:30', '2026-04-01 01:54:30'),
(72, 76, 25, 1.00, '2026-04-01 01:54:30', '2026-04-01 01:54:30'),
(73, 74, 30, 1.00, '2026-04-01 01:55:11', '2026-04-01 01:55:11'),
(74, 74, 24, 1.00, '2026-04-01 01:55:11', '2026-04-01 01:55:11'),
(75, 77, 30, 1.00, '2026-04-01 01:55:42', '2026-04-01 01:55:42'),
(76, 77, 26, 1.00, '2026-04-01 01:55:42', '2026-04-01 01:55:42'),
(77, 82, 30, 1.00, '2026-04-01 01:56:41', '2026-04-01 01:56:41'),
(78, 82, 27, 1.00, '2026-04-01 01:56:41', '2026-04-01 01:56:41'),
(79, 98, 30, 1.00, '2026-04-01 01:57:42', '2026-04-01 01:57:42'),
(80, 98, 28, 1.00, '2026-04-01 01:57:42', '2026-04-01 01:57:42'),
(81, 83, 30, 1.00, '2026-04-01 01:58:17', '2026-04-01 01:58:17'),
(82, 83, 29, 1.00, '2026-04-01 01:58:17', '2026-04-01 01:58:17'),
(86, 99, 13, 1.00, '2026-04-01 10:15:51', '2026-04-01 10:15:51'),
(87, 99, 15, 1.00, '2026-04-01 10:15:51', '2026-04-01 10:15:51'),
(88, 99, 16, 1.00, '2026-04-01 10:15:51', '2026-04-01 10:15:51'),
(116, 16, 42, 1.00, '2026-04-05 15:09:11', '2026-04-05 15:09:11'),
(117, 16, 9, 1.00, '2026-04-05 15:09:11', '2026-04-05 15:09:11'),
(118, 75, 20, 1.00, '2026-04-05 15:09:29', '2026-04-05 15:09:29'),
(119, 75, 21, 1.00, '2026-04-05 15:09:29', '2026-04-05 15:09:29'),
(120, 13, 9, 1.00, '2026-04-05 15:09:46', '2026-04-05 15:09:46'),
(121, 13, 11, 1.00, '2026-04-05 15:09:46', '2026-04-05 15:09:46'),
(122, 14, 20, 1.00, '2026-04-05 15:10:06', '2026-04-05 15:10:06'),
(123, 14, 8, 1.00, '2026-04-05 15:10:06', '2026-04-05 15:10:06'),
(124, 15, 12, 1.00, '2026-04-05 15:10:24', '2026-04-05 15:10:24'),
(125, 15, 9, 1.00, '2026-04-05 15:10:24', '2026-04-05 15:10:24'),
(126, 89, 40, 1.00, '2026-04-05 15:10:37', '2026-04-05 15:10:37'),
(127, 89, 35, 1.00, '2026-04-05 15:10:37', '2026-04-05 15:10:37'),
(128, 88, 34, 1.00, '2026-04-05 15:10:52', '2026-04-05 15:10:52'),
(129, 88, 40, 1.00, '2026-04-05 15:10:52', '2026-04-05 15:10:52'),
(130, 90, 36, 1.00, '2026-04-05 15:11:08', '2026-04-05 15:11:08'),
(131, 90, 40, 1.00, '2026-04-05 15:11:08', '2026-04-05 15:11:08'),
(144, 6, 16, 1.00, '2026-04-21 15:37:43', '2026-04-21 15:37:43'),
(145, 6, 14, 1.00, '2026-04-21 15:37:43', '2026-04-21 15:37:43'),
(146, 100, 43, 1.00, '2026-04-21 19:22:58', '2026-04-21 19:22:58'),
(147, 100, 46, 1.00, '2026-04-21 19:22:58', '2026-04-21 19:22:58'),
(148, 3, 10, 1.00, '2026-04-21 19:23:02', '2026-04-21 19:23:02'),
(149, 5, 15, 1.00, '2026-04-22 08:11:40', '2026-04-22 08:11:40'),
(150, 5, 13, 1.00, '2026-04-22 08:11:40', '2026-04-22 08:11:40'),
(151, 101, 47, 1.00, '2026-04-22 10:24:49', '2026-04-22 10:24:49'),
(152, 101, 48, 1.00, '2026-04-22 10:24:49', '2026-04-22 10:24:49');

-- --------------------------------------------------------

--
-- Table structure for table `purchase_orders`
--

CREATE TABLE `purchase_orders` (
  `id` int(11) NOT NULL,
  `request_id` int(11) DEFAULT NULL,
  `material_id` int(11) DEFAULT NULL,
  `material_name` varchar(512) NOT NULL,
  `requested_quantity` decimal(10,2) DEFAULT NULL,
  `purchased_quantity` decimal(10,2) DEFAULT NULL,
  `vendor_name` varchar(512) DEFAULT NULL,
  `price` decimal(15,2) DEFAULT NULL,
  `created_by` varchar(512) DEFAULT NULL,
  `status` varchar(512) DEFAULT 'PENDING_ADMIN_PURCHASE_APPROVAL',
  `created_at` datetime DEFAULT current_timestamp(),
  `admin_approval_date` datetime DEFAULT NULL,
  `category` varchar(512) DEFAULT 'Materials',
  `unit` varchar(512) DEFAULT 'kg',
  `is_deleted` tinyint(1) DEFAULT 0,
  `tally_push_status` varchar(20) DEFAULT 'PENDING',
  `tally_pushed_at` datetime DEFAULT NULL,
  `tally_reference` varchar(100) DEFAULT NULL,
  `paid_amount` decimal(15,2) DEFAULT 0.00,
  `balance_amount` decimal(15,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purchase_requests`
--

CREATE TABLE `purchase_requests` (
  `id` int(11) NOT NULL,
  `material_id` int(11) DEFAULT NULL,
  `material_name` varchar(512) NOT NULL,
  `current_stock` decimal(10,2) DEFAULT NULL,
  `requested_quantity` decimal(10,2) NOT NULL,
  `requested_by` varchar(512) DEFAULT NULL,
  `status` varchar(512) DEFAULT 'PENDING_ADMIN_APPROVAL',
  `created_at` datetime DEFAULT current_timestamp(),
  `vendor_price` decimal(15,2) DEFAULT NULL,
  `vendor_name` varchar(512) DEFAULT NULL,
  `vendor_id` int(11) DEFAULT NULL,
  `total_price` decimal(15,2) DEFAULT NULL,
  `category` varchar(512) DEFAULT 'Materials',
  `inventory_synced` tinyint(1) DEFAULT 0,
  `unit` varchar(512) DEFAULT 'kg',
  `is_deleted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `qc_logs`
--

CREATE TABLE `qc_logs` (
  `id` int(11) NOT NULL,
  `machine_id` int(11) DEFAULT NULL,
  `last_hour_production` int(11) DEFAULT NULL,
  `average_weight` decimal(10,3) DEFAULT NULL,
  `rejection_pcs` int(11) DEFAULT 0,
  `remarks` varchar(512) DEFAULT NULL,
  `timestamp` datetime DEFAULT current_timestamp(),
  `qa_staff` varchar(512) DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  `time_range` varchar(512) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `qc_logs`
--

INSERT INTO `qc_logs` (`id`, `machine_id`, `last_hour_production`, `average_weight`, `rejection_pcs`, `remarks`, `timestamp`, `qa_staff`, `is_deleted`, `time_range`) VALUES
(1, 1, 50, 11.000, 4, '4 pcs reject', '2026-04-06 14:47:30', 'QA System', 0, NULL),
(2, 6, 50, 20.000, 1, '1', '2026-04-06 14:47:47', 'QA System', 0, NULL),
(3, 2, 40, 5.000, 5, '5', '2026-04-06 14:59:01', 'QA System', 0, NULL),
(4, 2, 40, 5.000, 5, '5', '2026-04-06 14:59:03', 'QA System', 0, NULL),
(5, 2, 40, 5.000, 5, '5', '2026-04-06 14:59:06', 'QA System', 0, NULL),
(6, 2, 40, 5.000, 5, '5', '2026-04-06 14:59:18', 'QA System', 0, '11am-12am'),
(7, 2, 40, 5.000, 5, '5', '2026-04-06 14:59:19', 'QA System', 0, '11am-12am'),
(8, 2, 40, 5.000, 5, '5', '2026-04-06 14:59:19', 'QA System', 0, '11am-12am'),
(9, 2, 40, 5.000, 5, '5', '2026-04-06 14:59:19', 'QA System', 0, '11am-12am'),
(10, 2, 40, 5.000, 5, '5', '2026-04-06 14:59:20', 'QA System', 0, '11am-12am'),
(11, 2, 40, 5.000, 5, '5', '2026-04-06 14:59:20', 'QA System', 0, '11am-12am'),
(12, 2, 30, 3.000, 3, '3', '2026-04-06 15:00:52', 'QA System', 0, '11am-12am'),
(13, 2, 30, 3.000, 3, '3', '2026-04-06 15:00:53', 'QA System', 0, '11am-12am'),
(14, 2, 30, 3.000, 3, '3', '2026-04-06 15:00:53', 'QA System', 0, '11am-12am'),
(15, 2, 30, 3.000, 3, '3', '2026-04-06 15:00:53', 'QA System', 0, '11am-12am'),
(16, 2, 30, 3.000, 3, '3', '2026-04-06 15:00:54', 'QA System', 0, '11am-12am'),
(17, 2, 30, 3.000, 3, '3', '2026-04-06 15:00:54', 'QA System', 0, '11am-12am'),
(18, 1, 50, 1.000, 1, '1', '2026-04-06 15:07:00', 'QA System', 0, '12 AM - 1 AM'),
(19, 1, 50, 1.000, 1, '1', '2026-04-06 15:07:01', 'QA System', 0, '12 AM - 1 AM'),
(20, 1, 50, 1.000, 1, '1', '2026-04-06 15:07:01', 'QA System', 0, '12 AM - 1 AM'),
(21, 1, 50, 1.000, 1, '1', '2026-04-06 15:07:02', 'QA System', 0, '12 AM - 1 AM'),
(22, 1, 50, 1.000, 1, '1', '2026-04-06 15:07:02', 'QA System', 0, '12 AM - 1 AM'),
(23, 1, 50, 1.000, 1, '1', '2026-04-06 15:07:02', 'QA System', 0, '12 AM - 1 AM'),
(24, 1, 50, 1.000, 1, '1', '2026-04-06 15:07:02', 'QA System', 0, '12 AM - 1 AM'),
(25, 1, 50, 1.000, 1, '1', '2026-04-06 15:07:02', 'QA System', 0, '12 AM - 1 AM'),
(26, 1, 50, 1.000, 1, '1', '2026-04-06 15:07:02', 'QA System', 0, '12 AM - 1 AM'),
(27, 1, 50, 1.000, 1, '1', '2026-04-06 15:07:02', 'QA System', 0, '12 AM - 1 AM'),
(28, 1, 50, 1.000, 1, '1', '2026-04-06 15:07:03', 'QA System', 0, '12 AM - 1 AM'),
(29, 1, 50, 1.000, 1, '1', '2026-04-06 15:07:03', 'QA System', 0, '12 AM - 1 AM'),
(30, 1, 50, 1.000, 1, '1', '2026-04-06 15:07:03', 'QA System', 0, '12 AM - 1 AM'),
(31, 1, 50, 1.000, 1, '1', '2026-04-06 15:07:03', 'QA System', 0, '12 AM - 1 AM'),
(32, 1, 50, 1.000, 1, '1', '2026-04-06 15:07:03', 'QA System', 0, '12 AM - 1 AM'),
(33, 1, 50, 1.000, 1, '1', '2026-04-06 15:07:03', 'QA System', 0, '12 AM - 1 AM'),
(34, 1, 50, 1.000, 1, '1', '2026-04-06 15:07:04', 'QA System', 0, '12 AM - 1 AM'),
(35, 1, 50, 1.000, 1, '1', '2026-04-06 15:07:04', 'QA System', 0, '12 AM - 1 AM'),
(36, 1, 50, 1.000, 1, '1', '2026-04-06 15:07:04', 'QA System', 0, '12 AM - 1 AM'),
(37, 1, 50, 1.000, 1, '1', '2026-04-06 15:07:04', 'QA System', 0, '12 AM - 1 AM'),
(38, 1, 50, 1.000, 1, '1', '2026-04-06 15:07:04', 'QA System', 0, '12 AM - 1 AM'),
(39, 1, 50, 1.000, 1, '1', '2026-04-06 15:10:18', 'QA System', 0, '8 AM - 9 AM'),
(40, 1, 50, 1.000, 1, '1', '2026-04-06 15:10:20', 'QA System', 0, '8 AM - 9 AM'),
(41, 1, 50, 1.000, 1, '1', '2026-04-06 15:10:35', 'QA System', 0, '8 AM - 9 AM'),
(42, 1, 50, 1.000, 1, '1', '2026-04-06 15:10:51', 'QA System', 0, '8 AM - 9 AM'),
(43, 1, 50, 1.000, 1, '1', '2026-04-06 15:13:06', 'QA System', 0, '8 AM - 9 AM'),
(44, 1, 50, 1.000, 1, '1', '2026-04-06 15:13:08', 'QA System', 0, '8 AM - 9 AM'),
(45, 1, 50, 1.000, 1, '1', '2026-04-06 15:13:09', 'QA System', 0, '8 AM - 9 AM'),
(46, 1, 50, 1.000, 1, '1', '2026-04-06 15:13:12', 'QA System', 0, '8 AM - 9 AM'),
(47, 1, 50, 1.000, 1, '1', '2026-04-06 15:15:14', 'QA System', 0, '8 AM - 9 AM'),
(48, 1, 550, 3.000, 3, '3', '2026-04-06 15:16:03', 'QA System', 0, '6 AM - 7 AM'),
(49, 1, 200, 2.000, 2, '2', '2026-04-06 15:17:27', 'QA System', 0, '3 AM - 4 AM'),
(50, 1, 100, 5.000, 5, '5 pcs rej', '2026-04-09 13:29:52', 'QA System', 0, '12 AM - 1 AM'),
(51, 1, 100, 11.000, 1, 'no remarks', '2026-04-18 09:28:39', 'QA System', 0, '1 AM - 2 AM');

-- --------------------------------------------------------

--
-- Table structure for table `sales_customers`
--

CREATE TABLE `sales_customers` (
  `id` int(11) NOT NULL,
  `name` varchar(512) NOT NULL,
  `category` varchar(512) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `address` varchar(512) DEFAULT NULL,
  `phone_number` varchar(512) DEFAULT NULL,
  `alternate_phone_number` varchar(512) DEFAULT NULL,
  `email` varchar(512) DEFAULT NULL,
  `gst` varchar(512) DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  `previous_balance` decimal(15,2) DEFAULT 0.00,
  `total_receivable` decimal(15,2) DEFAULT 0.00,
  `total_paid` decimal(15,2) DEFAULT 0.00,
  `current_balance` decimal(15,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sales_customers`
--

INSERT INTO `sales_customers` (`id`, `name`, `category`, `created_at`, `address`, `phone_number`, `alternate_phone_number`, `email`, `gst`, `is_deleted`, `previous_balance`, `total_receivable`, `total_paid`, `current_balance`) VALUES
(57, 'Raming Packing', 'retail', '2026-03-28 05:24:20', '72, Elukadal Street,\\nMadurai', '9842462388', '', '', '33ACUPT5387P1ZC', 0, 0.00, 0.00, 0.00, 0.00),
(58, 'Mahi Packing', 'retail', '2026-03-28 05:34:24', 'B/16, Alagappan Nagar\\nPandiyan Street\\nMadurai', '6363500300', '', '', '33CWHPS2377D1ZG', 0, 0.00, 0.00, 0.00, 0.00),
(59, 'RN PLASTICS', 'retail', '2026-03-28 05:57:00', 'No:12/1,Max Tower Backside, Vilangudi,\\nMADURAI-625018', '9566938659', '', '', '33EFEPS1680M1ZI', 0, 0.00, 0.00, 0.00, 0.00),
(60, 'RENUKA MARKETNING', 'retail', '2026-03-28 05:58:30', '39A, GROUND FLOOR, NORTH MARAT STREET, Madurai Main,\\n MADURAI,  625001', '9443831463', '', '', '33COZPS1646R1ZR', 0, 78245.00, 0.00, 0.00, 0.00),
(61, 'Sri Karpaga Vinayaga Papers', 'wholesale', '2026-03-28 06:04:05', '68/1289 A, Thiruvonam Bldg,Valavi Road,\\nErnakulam\\nKerala', '9645227676', '', '', '32BLXPS9859Q1ZH', 0, 0.00, 0.00, 0.00, 0.00),
(62, 'ECO ENERGY', 'wholesale', '2026-03-28 06:20:33', 'First Floor, 13, Chakaravathi Nagar, \\t\\t\\nPUDHUKOTTAI-622001\\t\\t\\n', '9962474001', '', '', '33AHIPV0353J1Z8', 0, 0.00, 0.00, 0.00, 0.00),
(63, 'KARPHAGA VINAYAGAR PLASTICS', 'retail', '2026-03-28 06:40:25', 'No:26, Pandiya Vellalar Street,\\nMADURAI-625001', '9092929167', '', '', '', 0, 0.00, 0.00, 0.00, 0.00),
(64, 'PANDIAN PLASTIC TRADERS\\t\\t', 'retail', '2026-03-28 06:41:52', 'No:226,South Masi Street,\\t\\t\\nMADURAI-625001\\t\\n', '9843251937', '', '', '33PYKPS0828F1Z0', 0, 0.00, 0.00, 0.00, 0.00),
(65, 'VASANTHAM TRADERS\\t\\t', 'retail', '2026-03-28 06:44:27', 'No:2E, MUTHAIH CHETTIYAR                        PADITHURAI ROAD\\t\\t\\t\\t\\nKEELATHOPPU,SELLUR\\t\\t\\nMADURAI-625002\\t\\n\\n', '8667482454', '', '', '33AALFV1041R1ZT', 0, 0.00, 0.00, 0.00, 0.00),
(66, 'SHA MANAKCHAND & SONS', 'retail', '2026-03-28 06:48:07', '30,East Avani Moola Street \\nMADURAI-625001', '9442751500', '', '', '33AAVPN9394H1ZV', 0, 0.00, 0.00, 0.00, 0.00),
(67, 'M.R.ENTERPRISES', 'retail', '2026-03-28 07:57:23', 'S20, MANAGARATCHI COMPLEX, EAST NAPPALAYAM STREET, EAST MASI STREET, Madurai, Tamil Nadu, 625001', '9443295386', '', '', '33AOEPM4149J1ZW', 0, 38775.00, 0.00, 0.00, 0.00),
(68, 'BHAGAVATHI PACKAGING\\t\\t', 'retail', '2026-03-28 08:00:17', 'No:146 North Masi Street\\t\\t\\nMADURAI-625001\\t\\n', '7092230068', '', '', '33DGFPA3409H1ZX', 0, 0.00, 0.00, 0.00, 0.00),
(69, 'DGM Poly Pack', 'retail', '2026-03-28 08:11:49', '79C, South Masi Street,\\nMadurai- 625001', '9842130030', '0452-2344870', '', '', 0, 0.00, 0.00, 0.00, 0.00),
(70, 'ANBU', 'retail', '2026-03-28 08:13:28', 'Otthakadi\\nmadurai\\n', '8778955993', '', '', '', 0, 0.00, 0.00, 0.00, 0.00),
(71, 'REGINA PALSTIC\\t', 'retail', '2026-03-28 08:27:21', 'Madurai', '8098367878', '', '', '', 0, 0.00, 0.00, 0.00, 0.00),
(72, 'Krishna Agencies', 'retail', '2026-03-28 08:34:04', 'No:37/38 ELUKADAL AGRAHARAM,\\nMADURAI\\t625001\\n', '8056756337', '', '', '', 0, 0.00, 0.00, 0.00, 0.00),
(73, 'Madhani', 'retail', '2026-03-28 11:31:51', 'madurai\\n', '9150899014', '', '', '', 0, 0.00, 0.00, 0.00, 0.00),
(74, 'V1 TRADING COMPANY', 'retail', '2026-03-28 11:40:36', '14 W PRC COLONY,1ST STREET,\\nKOVILPAPAKUDI,\\nMADURAI', '99', '', '', '33CBIPN2656J1ZG', 0, 0.00, 0.00, 5000.00, 0.00),
(75, 'RAJTHANI', 'retail', '2026-03-28 11:48:00', 'MADURAI\\n\\n', '8807015000', '', '', '', 0, 263600.00, 0.00, 0.00, 0.00),
(76, 'TRB', 'retail', '2026-03-28 11:49:07', 'MADURAI', '8489934990', '', '', '', 0, 0.00, 0.00, 0.00, 0.00),
(77, 'SRI SOLANKI ENTERPRISES', 'retail', '2026-03-28 11:52:03', 'NO.64- A, East Avani Moola Steet,\\nMadurai -625001', '9894249274', '0452-2631430', '', '33AUWPK1466C1ZL', 0, 0.00, 0.00, 0.00, 0.00),
(78, 'ARS Enterprises', 'retail', '2026-03-28 11:53:28', 'Madurai', '9789240793', '', '', '', 0, 0.00, 0.00, 0.00, 0.00),
(79, 'Nakoda Plastic Company', 'retail', '2026-03-28 11:55:50', '57, Thasildhar Palllivasal Street,\\nMadurai -625001', '8072144145', '0452-2336421', '', '', 0, 0.00, 0.00, 0.00, 0.00),
(80, 'Jain (Manakchnad jain)', 'retail', '2026-03-28 11:58:39', 'Madurai', '8667323815', '9944835500', '', '', 0, 0.00, 0.00, 0.00, 0.00),
(81, 'Vimal Traders', 'retail', '2026-03-28 12:05:19', 'D.NO 171South Masi Street\\nMadurai', '9842167252', '', '', '33ACCPU2259F1ZP', 0, 0.00, 0.00, 0.00, 0.00),
(82, 'Mohan Plastic', 'retail', '2026-03-28 12:06:43', '70-A, South Masi Street,\\nMadurai', '9443961115', '', '', '33AAEFM6516F1ZK', 0, 0.00, 0.00, 0.00, 0.00),
(83, 'ABU ', 'retail', '2026-03-28 12:07:45', 'Madurai', '9940865511', '', '', '', 0, 0.00, 0.00, 0.00, 0.00),
(84, 'Kamatchi Amman', 'retail', '2026-03-28 12:08:53', 'Madurai', '8111004270', '', '', '', 0, 0.00, 0.00, 0.00, 0.00),
(85, 'Royal Trader', 'retail', '2026-03-28 12:12:04', 'Madurai', '9843113580', '', '', '', 0, 0.00, 0.00, 0.00, 0.00),
(86, 'Sulthan Royal Trader', 'retail', '2026-03-28 12:16:57', 'Madurai', '9629221782', '', '', '', 0, 0.00, 0.00, 0.00, 0.00),
(87, 'Jemini Plastic', 'retail', '2026-03-28 13:07:08', 'Madurai', '8248848596', '', '', '', 0, 0.00, 0.00, 0.00, 0.00),
(88, 'Meenakshi Trader', 'retail', '2026-03-28 13:08:20', 'Madurai', '9944053366', '', '', '', 0, 0.00, 0.00, 0.00, 0.00),
(89, 'K G F Briyani', 'retail', '2026-03-28 13:08:56', 'Sivagangai', '8122056438', '', '', '', 0, 0.00, 0.00, 0.00, 0.00),
(90, 'Arasan Traders', 'retail', '2026-03-28 13:09:45', 'Palayankottai', '9940769550', '', '', '', 0, 0.00, 0.00, 0.00, 0.00),
(91, 'Arumugam Plastic', 'retail', '2026-03-30 06:46:42', 'Madurai', '9677653934', '', '', '', 0, 0.00, 0.00, 0.00, 0.00),
(92, 'Olimbik Traders', 'retail', '2026-03-30 06:47:19', 'Madurai', '8248759539', '', '', '', 0, 0.00, 0.00, 0.00, 0.00),
(93, 'K.N. Polythene', 'retail', '2026-03-30 06:48:12', 'Madurai', '8883642958', '', '', '', 0, 0.00, 0.00, 0.00, 0.00),
(94, 'Saranya', 'retail', '2026-03-30 06:50:15', 'Thapalthandhi Nagar,\\nMadurai', '8825964208', '', '', '', 0, 0.00, 0.00, 0.00, 0.00),
(95, 'Vipro', 'retail', '2026-03-30 06:57:56', 'Madurai', '8825045812', '', '', '', 0, 18550.00, 0.00, 0.00, 0.00),
(97, 'C.R.Ganesan', 'retail', '2026-03-30 07:03:33', 'Chellappa Traders,\\n6,Nadar West Street,\\nAruppukottai', '9789010558', '', '', '', 0, 0.00, 0.00, 0.00, 0.00),
(98, 'VDP Mart PrivateLimited', 'wholesale', '2026-03-30 07:10:49', 'NO: 1/201, Prathana Salai, Pioneer Power\\nSystems Pvt Ltd, Padur, Kelambakkam,\\nChengalpattu,Chennai', '9384666333', '', '', '33AAHCV5821E1ZI', 0, 0.00, 0.00, 0.00, 0.00),
(99, 'Vajra', 'retail', '2026-03-30 07:13:32', 'Chinnamnnur -Thirumalamman lorry', '9842948726', '', '', '', 0, 0.00, 0.00, 0.00, 0.00),
(100, 'Balu Paper Store', 'retail', '2026-03-30 12:00:18', '65,North Car Street\\nSrivilliputtur\\nVirudhunagar', '9443543800', '', '', '33AWIPS3423K1ZD', 0, 0.00, 0.00, 0.00, 0.00),
(101, 'BALA SUPER MARKET', 'retail', '2026-03-30 12:02:50', 'CHINNAMNNUR', '6379552568', '', '', '', 0, 0.00, 0.00, 0.00, 0.00),
(102, 'SWATEEKHA MARKETING', 'retail', '2026-03-30 12:06:46', '443,R.G street\\nCoimbatore,\\n', '9842758395', '', '', '33ATBPR2701H1Z3', 0, 0.00, 0.00, 0.00, 0.00),
(103, 'BMR Eco-Greentec Industries', 'wholesale', '2026-03-30 12:09:32', 'Beside Triplex Agencies 14-386/1\\nApsrtc Depot 1 Road Kainikattu Street\\nChittoor, Andhra Pradesh', '9440077505', '', '', '37AEBPT0661H1ZH', 0, 0.00, 0.00, 0.00, 0.00),
(104, 'Santha Kumar Traders', 'wholesale', '2026-03-30 12:11:39', '19C,V.O.C.Street\\nKadayanallur\\nTirunelveli', '9842910015', '', '', '33CCHPM2940N1ZD', 0, 0.00, 0.00, 0.00, 0.00),
(105, 'BM TRADERS', 'retail', '2026-03-30 12:14:02', 'ERODE', '9629845124', '', '', '', 0, 0.00, 0.00, 0.00, 0.00),
(106, 'AIYYAPPA ESSENCE', 'retail', '2026-03-30 12:15:27', 'KARAIKUDI', '9894355813', '', '', '', 0, 0.00, 0.00, 6000.00, 0.00),
(107, 'N. Umamaheswara Iyer', 'retail', '2026-03-30 12:17:21', 'Gomathy Nivas Azad Lane\\nThirunakkaraKottayam\\nKottayam', '9387884646', '', '', '', 0, 0.00, 0.00, 0.00, 0.00),
(108, 'Cochin Limra Sales-KL', 'wholesale', '2026-03-30 12:19:50', 'First And Secnd Floor,\\n70/3383, Deshabhimani - National Public School Road,\\nOld Bismi Godown, Kaloor,Ernakulam\\nKochi-682017', '6379950651', '', '', '32AAJFC5829N1Z4', 0, 0.00, 0.00, 0.00, 0.00),
(109, 'Cochin Limra Sales (Thiruvananthapuram Branch)', 'wholesale', '2026-03-30 12:22:11', 'Ground Floor TC/74/125-1 Moonnattumukku Road\\nPoonthura  Thiruvananthapuram\\nKerala\\n\\n\\n', '6379950651', '', '', '32AAJFC5829N1Z4', 0, 0.00, 0.00, 0.00, 0.00),
(116, 'Plasto Agencies', 'wholesale', '2026-03-30 12:24:08', 'Tc 72/2424 (1) Near Govt LPS Kuriyathi\\nManacadu Chalai \\nTrivandrum', '989542426', '', '', '32BANPS0602Q1ZF', 0, 0.00, 0.00, 0.00, 0.00),
(118, 'National Agenceis', 'wholesale', '2026-03-31 12:43:02', '50/1134-A Masjit Lane,Raliway Station Raod\\nEdappally\\nErnakulam', '8129497218', '', '', '32AAHFN3526F1ZM', 0, 0.00, 0.00, 0.00, 0.00),
(119, 'Sri Karpaga Vinayaga Papers', 'wholesale', '2026-03-31 12:50:08', '68/1289 A, Thiruvonam Bldg,Valavi Road,\\nErnakulam', '9645227676', '', '', '32BLXPS9859Q1ZH', 0, 0.00, 0.00, 0.00, 0.00),
(120, 'Orchid Marketing', 'wholesale', '2026-03-31 12:51:30', '74/1370-1, Nh-66, Karmbuvila\\nPoonthura P.O.\\nTrivandram', '9400763327', '', '', '32ATAPA3974E1Z8', 0, 0.00, 0.00, 0.00, 0.00),
(121, 'Green Trade Links', 'wholesale', '2026-03-31 13:01:29', 'XII/259 C, Kutty Sahib Road,\\nSouth Chittoor,\\nErnakulam,', '9895379201', '', '', '32AREPV8088J1Z5', 0, 0.00, 0.00, 0.00, 0.00),
(122, 'Alfa Agencies', 'wholesale', '2026-03-31 13:02:44', 'Thirumudikunnu Road Koratty East P.O\\nChiranagara Thrissur Dist;\\nKerala', '8086079010', '', '', '32AJUPG3982G1ZY', 0, 0.00, 0.00, 0.00, 0.00),
(123, 'S.M.A Traders', 'wholesale', '2026-03-31 13:05:59', 'Near SBT Main Road Balaramapuram\\nChalai, Trivandrum', '7902266510', '', '', '32AMEPA9191N1ZU', 0, 0.00, 0.00, 0.00, 0.00),
(124, 'TEST', 'wholesale', '2026-04-02 11:05:18', 'ssets', '7845124578', '', '', '', 0, 0.00, 0.00, 0.00, 0.00),
(125, 'A M Essence', 'retail', '2026-04-08 06:00:21', 'Melapalayam\\n', '9751886487', '', '', '', 0, 0.00, 0.00, 0.00, 0.00),
(126, 'Deen Enterprises', 'retail', '2026-04-08 06:06:13', 'Maliyaduthurai\\n', '9629671366', '', '', '', 0, 0.00, 0.00, 0.00, 0.00),
(127, 'Siva Sakthi Bags', 'retail', '2026-04-08 06:07:13', 'Nagarkovil', '9597766273', '', '', '', 0, 0.00, 0.00, 0.00, 0.00),
(128, 'Sai Traders', 'retail', '2026-04-08 06:08:07', 'Nagarkovil', '9629777459', '', '', '', 0, 0.00, 0.00, 0.00, 0.00),
(129, 'Sai Agencies', 'retail', '2026-04-08 06:09:00', 'Nagarkovil', '9840408762', '', '', '', 0, 0.00, 0.00, 0.00, 0.00),
(130, 'Sha Marketing', 'retail', '2026-04-08 06:09:56', 'Palayamkottai', '7708334444', '', '', '', 0, 0.00, 0.00, 0.00, 0.00),
(131, 'Manimegalai', 'retail', '2026-04-08 06:17:16', 'Tenkasi Road                                                               Rajapalayam\\nVirudhunagar\\n\\n\\n', '9486737600', '', '', '33DQGPS3291L1ZC', 0, 0.00, 0.00, 0.00, 0.00),
(132, 'Santhi Poly', 'retail', '2026-04-08 07:55:18', 'Selam', '9442166815', '', '', '', 0, 0.00, 0.00, 0.00, 0.00),
(133, 'VAISHALI', 'retail', '2026-04-08 07:58:36', 'Srivilliputtur', '9025808328', '', '', '', 0, 81030.00, 0.00, 0.00, 0.00),
(134, 'Sarojini Super Market', 'retail', '2026-04-08 08:01:50', 'Sivakasi', '9894461617', '', '', '', 0, 0.00, 0.00, 0.00, 0.00),
(138, 'Zodiac Print And Pack', 'retail', '2026-04-08 08:07:31', '1929, Periya Karuppan Road,\\nSivakasi, Virudhunagar,', '7092659273', '', '', '33GTYPP9029M1ZI', 0, 0.00, 0.00, 0.00, 0.00),
(139, 'Abi Traders', 'retail', '2026-04-08 08:17:00', 'Thoothukudi', '7904445137', '', '', '', 0, 0.00, 0.00, 0.00, 0.00),
(140, 'Maggy', 'wholesale', '2026-04-08 08:18:29', '140,Railway Feeder Road\\nVirudhunagar', '7550265437', '', '', '33BJAPM3252L1ZB', 0, 576808.00, 0.00, 0.00, 0.00),
(141, 'Thangam Store', 'retail', '2026-04-08 08:23:42', '234,Pillai Street\\nThoothukudi,', '9894050498', '', '', '33ABBPT4804H1ZU', 0, 0.00, 0.00, 0.00, 0.00),
(142, 'Mass Traders', 'retail', '2026-04-08 08:25:08', 'Tanjore', '8220266627', '', '', '', 0, 0.00, 0.00, 0.00, 0.00),
(143, 'MPM Shoping', 'retail', '2026-04-08 08:26:27', 'Thoothukudi', '6380853009', '', '', '', 0, 0.00, 0.00, 0.00, 0.00),
(144, 'Database test', 'wholesale', '2026-04-18 08:53:22', 'test', '9025728998', '', 'kirtheeswarangrm@gmail.com', '123456', 0, 0.00, 0.00, 0.00, 0.00),
(146, 'customer', 'wholesale', '2026-04-18 09:57:34', 'asf', '9025728998', '', '', '', 0, 0.00, 0.00, 0.00, 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `sales_customer_products`
--

CREATE TABLE `sales_customer_products` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) DEFAULT 0,
  `price_per_unit` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sales_history`
--

CREATE TABLE `sales_history` (
  `id` int(11) NOT NULL,
  `invoice_number` varchar(20) DEFAULT NULL,
  `sales_request_id` int(11) DEFAULT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `customer_name_manual` varchar(255) DEFAULT NULL,
  `total_amount` decimal(12,2) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `approved_by` int(11) DEFAULT NULL,
  `invoice_pdf_url` varchar(512) DEFAULT NULL,
  `gst_enabled` tinyint(1) DEFAULT 0,
  `gst_amount` decimal(15,2) DEFAULT 0.00,
  `is_deleted` tinyint(1) DEFAULT 0,
  `tally_push_status` varchar(20) DEFAULT 'PENDING',
  `paid_amount` decimal(15,2) DEFAULT 0.00,
  `balance_amount` decimal(15,2) DEFAULT 0.00,
  `vehicle_number` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sales_history_items`
--

CREATE TABLE `sales_history_items` (
  `id` int(11) NOT NULL,
  `sales_history_id` int(11) NOT NULL,
  `product_id` int(11) DEFAULT NULL,
  `product_name` varchar(255) DEFAULT NULL,
  `color` varchar(100) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `unit_price` decimal(12,2) DEFAULT NULL,
  `line_total` decimal(12,2) DEFAULT NULL,
  `boxes` int(11) DEFAULT NULL,
  `pieces_per_box` int(11) DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sales_invoices`
--

CREATE TABLE `sales_invoices` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `customer_name` varchar(512) DEFAULT NULL,
  `category` char(1) DEFAULT NULL,
  `total_amount` decimal(12,2) DEFAULT 0.00,
  `invoice_date` datetime DEFAULT current_timestamp(),
  `approval_status` varchar(20) DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sales_invoice_items`
--

CREATE TABLE `sales_invoice_items` (
  `id` int(11) NOT NULL,
  `invoice_id` int(11) DEFAULT NULL,
  `product_id` int(11) NOT NULL,
  `product_name` varchar(512) DEFAULT NULL,
  `quantity` int(11) DEFAULT 0,
  `price_per_unit` decimal(10,2) DEFAULT 0.00,
  `line_total` decimal(12,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sales_requests`
--

CREATE TABLE `sales_requests` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL,
  `customer_name_manual` varchar(255) DEFAULT NULL,
  `total_amount` decimal(12,2) NOT NULL,
  `status` varchar(20) DEFAULT 'Pending approval',
  `created_at` datetime DEFAULT current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `date` date DEFAULT curdate(),
  `gst_enabled` tinyint(1) DEFAULT 0,
  `gst_amount` decimal(15,2) DEFAULT 0.00,
  `invoice_number` varchar(255) DEFAULT NULL,
  `vehicle_number` varchar(255) DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sales_request_items`
--

CREATE TABLE `sales_request_items` (
  `id` int(11) NOT NULL,
  `sales_request_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `product_name` varchar(255) DEFAULT NULL,
  `color` varchar(100) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `unit_price` decimal(12,2) NOT NULL,
  `line_total` decimal(12,2) NOT NULL,
  `boxes` int(11) DEFAULT NULL,
  `pieces_per_box` int(11) DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `staffs`
--

CREATE TABLE `staffs` (
  `id` int(11) NOT NULL,
  `staff_id` varchar(50) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `assigned_shift` varchar(50) DEFAULT 'General',
  `role` varchar(50) DEFAULT 'Operator',
  `is_deleted` tinyint(1) DEFAULT 0,
  `joining_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `staffs`
--

INSERT INTO `staffs` (`id`, `staff_id`, `name`, `gender`, `assigned_shift`, `role`, `is_deleted`, `joining_date`) VALUES
(14, 'WA001', 'testwa', 'Male', 'Day', 'WATCHMAN', 1, NULL),
(15, 'PR001', 'Ganesh kumar', 'Male', 'Night', 'PRODUCT HEAD', 1, NULL),
(18, 'PR002', 'gemini', 'Male', 'General', 'PRODUCT HEAD', 1, NULL),
(19, 'UN001', 'Jaya Pandi', 'Male', 'Night', 'UNSKILLEDLABOUR', 1, NULL),
(22, 'PR003', 'Thangam', 'Male', 'Day', 'PRODUCT HEAD', 1, NULL),
(23, 'AC001', 'Thangam', 'Male', 'General', 'ACCOUNTS', 1, NULL),
(24, 'QU001', 'thangam', 'Male', 'Day', 'QUALITY', 1, NULL),
(25, 'PR004', 'Ganesh Kumar', 'Male', 'General', 'PRODUCT HEAD', 0, NULL),
(26, 'SU001', 'Maha Lakshmi', 'Female', 'Night', 'SUPERVISOR', 0, NULL),
(27, 'UN002', 'jaya Pandi', 'Female', 'Night', 'UNSKILL LABOUR', 0, NULL),
(28, 'UN003', 'Priya', 'Female', 'Night', 'UNSKILL LABOUR', 0, NULL),
(29, 'UN004', 'Ramana', 'Female', 'Day', 'UNSKILL LABOUR', 0, NULL),
(30, 'UN005', 'Chithra', 'Female', 'General', 'UNSKILL LABOUR', 0, NULL),
(31, 'UN006', 'Chithirai Selvi', 'Female', 'Day', 'UNSKILL LABOUR', 0, NULL),
(32, 'UN007', 'Narmatha', 'Female', 'General', 'UNSKILL LABOUR', 0, NULL),
(33, 'QU002', 'Swetha', 'Female', 'General', 'QUALITY', 0, NULL),
(34, 'PA001', 'Amika', 'Female', 'Day', 'PACKING', 0, NULL),
(35, 'UN008', 'uma', 'Female', 'Day', 'UNSKILL LABOUR', 0, NULL),
(36, 'VA001', 'Arumugam', 'Male', 'General', 'VAN DRIVER', 0, NULL),
(37, 'WA002', 'Andiappan', 'Male', 'Day', 'WATCHMEN', 0, NULL),
(38, 'UN009', 'Sujith Kumar', 'Male', 'Day', 'UNSKILL LABOUR', 0, NULL),
(39, 'UN010', 'sonu kumar', 'Male', 'Night', 'UNSKILL LABOUR', 0, NULL),
(40, 'UN011', 'paramoth kumar', 'Male', 'Night', 'UNSKILL LABOUR', 0, NULL),
(41, 'UN012', 'mangal kumar', 'Male', 'General', 'UNSKILL LABOUR', 0, NULL),
(42, 'UN013', 'Chandan kumar', 'Male', 'General', 'UNSKILL LABOUR', 0, NULL),
(43, 'AC002', 'Preethi ', 'Female', 'Day', 'ACCOUNTS', 0, NULL),
(44, 'SA001', 'ganesh pandian', 'Male', 'Day', 'SALES', 0, NULL),
(45, 'SE001', 'vala vanthan', 'Male', 'Night', 'SEWAGE HELPER', 0, NULL),
(46, 'UN014', 'son kumar', 'Male', 'Day', 'UNSKILL LABOUR', 0, NULL),
(47, 'UN015', 'Ranjith kumar', 'Male', 'General', 'UNSKILL LABOUR', 0, NULL),
(48, 'OP001', 'kalai', 'Male', 'Night', 'OPERATOR', 1, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(512) NOT NULL,
  `password` varchar(512) NOT NULL,
  `role` varchar(512) NOT NULL,
  `push_token` varchar(512) DEFAULT NULL,
  `password_plain` varchar(512) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`, `push_token`, `password_plain`) VALUES
(7, 'admin', '$2b$10$Y1uzohIJnf8dltEsbax3qe30mtuKlQCcjRH05LLyT1uiuCqeL6zmC', 'ADMIN', NULL, NULL),
(16, 'gemini', '$2b$10$XQIoR7LcvRnrPl0orZUVoOpXwJF3oBBZn9ID9WZSWTKiU4gxog3RS', 'PRODUCTION HEAD', NULL, '123456'),
(18, 'tirupathi', '$2b$10$STWamzKntseVc.ZwCwnRp.ZGBIyXznnhwe2ZJpnvLqrP4AWs6jFNy', 'OPERATOR', NULL, '123456'),
(19, 'mohan', '$2b$10$kOKuzO9jESn0BPpVdLC68.8tIlXq6YCCtDy0Uze3G.tyKWVoqbSuC', 'OPERATOR', NULL, '123456'),
(20, 'ganeshpandian', '$2b$10$FtFAqrCFuDP2YFkh0YXAxOfDsIhzhYha143YmQbav/Nm2tQQJ7TXi', 'SALES', NULL, '123456'),
(21, 'preethi', '$2b$10$mOkPu1Mw/ceFovFZNbx4PuSlJb7rMxNYVygOYLxzybCdv.nO6ytLy', 'ACCOUNTS', NULL, '123456'),
(25, 'head', '$2b$10$jEQA4iaK6W16q4eIFp0FIO.s5t8T9m0z4PJb0QSGBHHM7MzuF2zmC', 'PRODUCTION HEAD', NULL, '123456'),
(27, 'pack', '$2b$10$vjaubuJAbbNB4cpyg988eenKVutPjmd3l4BhtkfXi5bBy7SqpGUEe', 'PACKING', NULL, 'pack123'),
(33, 'swetha', '$2b$10$0wM59UgEu98P3/o1oj.qFOqA9Mzc7nufQc4XMl4o/fYVW5OzkKh76', 'QUALITY', NULL, '123456'),
(34, 'ambika', '$2b$10$z48LKa6wViDFFS3ZxUZ84uVaNgriJwK8klvyUBQVusfiPtwVsW.Em', 'PACKING', NULL, '123456'),
(35, 'maha', '$2b$10$InPjdWRn3xlhFGuzOEqycu5kKqDYh2O/cLCqrc9d/A9H8uZ.WelAG', 'PACKING', NULL, '123456'),
(36, 'thangam', '$2b$10$0I.mwx98RVIUgNYQKy1wY.D5emgCmXxPa3T2Hb0yt4oCIXZrRs7Ye', 'OPERATOR', NULL, '123456');

-- --------------------------------------------------------

--
-- Table structure for table `vendors`
--

CREATE TABLE `vendors` (
  `id` int(11) NOT NULL,
  `name` varchar(512) NOT NULL,
  `created_by` varchar(512) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `address` varchar(512) DEFAULT NULL,
  `phone_number` varchar(512) DEFAULT NULL,
  `alternate_phone_number` varchar(512) DEFAULT NULL,
  `email` varchar(512) DEFAULT NULL,
  `gst` varchar(512) DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0,
  `previous_balance` decimal(15,2) DEFAULT 0.00,
  `total_payable` decimal(15,2) DEFAULT 0.00,
  `total_paid` decimal(15,2) DEFAULT 0.00,
  `current_balance` decimal(15,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vendors`
--

INSERT INTO `vendors` (`id`, `name`, `created_by`, `created_at`, `address`, `phone_number`, `alternate_phone_number`, `email`, `gst`, `is_deleted`, `previous_balance`, `total_payable`, `total_paid`, `current_balance`) VALUES
(2, 'Adhi Mangala Fabric', 'Admin', '2026-03-27 05:54:20', '18C/6, New Ramnad Road \\nMadurai-625010\\n', '9444196666', '0452-4378868', 'adhimangalafabric@gmail.com', '33AAVFA0748A1ZR', 0, 0.00, 0.00, 0.00, 0.00),
(3, 'SURESH PLASTICS', 'Admin', '2026-03-27 10:17:18', 'NEW NO 37, OLD NO.2 , MUNIAPPA STREET,\\nOLD WASHERMENPET , \\nCHENNAI-600021', '9444354433', '044-25960080', 'lovely.bpi@gmail.com', '33BEXPS6642Q1ZB', 0, 0.00, 0.00, 0.00, 0.00),
(4, 'Gem Orion Machinery P Ltd', 'Admin', '2026-03-27 10:21:40', '100/2A, Avinashi Road, Arasur, \\nCoimbatore -641407', '8870588822', '0422-2363807', 'sales@gemorion.in', '33AAGCG6621A1Z6', 0, 0.00, 0.00, 0.00, 0.00),
(5, 'JAY HARI ENTERPRISES', 'Admin', '2026-03-27 10:28:32', 'NO.12 BOOMBUHAR NAGAR FIRST STREET,\\nVALAR NAGAR MAIN ROAD,\\nUTHANGUDI, MADURAI -625107\\n', '8870014029', '0452-4502100', 'sales@jayhari.in', '33AAJFJ4871B1ZK', 0, 0.00, 0.00, 0.00, 0.00),
(6, 'Shibaura Machine India Private Limited', 'Admin', '2026-03-27 10:42:03', 'No.65 Chennai- Bangalore Highway,\\nChembarambakkam, Poonamallee Taluk,\\nChennai -600123', ' 8220017762.', '', 'sales@shibauramachine.co.in', '33AAACL6155E1ZU', 0, 0.00, 0.00, 0.00, 0.00),
(7, 'SRI MEENAKSHI TEX', 'Admin', '2026-03-27 10:45:22', '18-C/3, NEW RAMNAD ROAD,\\nMADURAI-625009\\n\\n\\n\\n\\n', '2624198', '', '', '33BCFPR9486P1ZK', 0, 0.00, 0.00, 0.00, 0.00),
(8, '4S SYSTEM and SOLUTIONS', 'Admin', '2026-03-27 10:47:35', 'NO.1/78, MEPPUR ROAD, AGARAM MEIL,\\nCHENNAI -600123', '9840536955', '', '', '33ACFFS2975K1ZR', 0, 0.00, 0.00, 0.00, 0.00),
(9, 'VERTEX POWER SOLUTIONS PVT.LTD', 'Admin', '2026-03-27 10:51:47', '38, Sri Saraswathi Muthupazhaniyappa Nagar,\\nSamy Street, Nagalkeni, Chrompet,\\nChennai -600044', '9940058974', '9164657788', 'admin@vertexpower.co.in', '33AADCV7655G1Z6', 0, 0.00, 0.00, 0.00, 0.00),
(10, 'Vaibavsri Solutions India Pvt.Ltd', 'Admin', '2026-03-27 10:56:48', 'No.211/3, Nehru Nagar 2nd Steet,\\nThiruvalluvar Main Road,(Near Kaviyan Apartment)\\nPalanganatham Bye Pass,\\nMadurai -625016', '0452-2384048', '2630270', '', '33AACCV6975C1ZA', 0, 0.00, 0.00, 0.00, 0.00),
(11, 'Inspra Machinery and Automation Pvt. Ltd', 'Admin', '2026-03-27 11:13:42', 'No. 208/6A2, Shanthi Garden,\\nPalanthandalam, Thirumudivakkam,\\nKancheepuram  - 600044', '98', '', '', '33AAECI7368C1ZO', 0, 0.00, 0.00, 0.00, 0.00),
(12, 'S POLYMER', 'Admin', '2026-03-27 11:21:53', 'D -10, Sidco Indurtrial Estate,\\nKappalur\\nmadurai -625008', '9', '', '', '33AWBPN3072C1Z1', 0, 0.00, 0.00, 0.00, 0.00),
(13, 'TEST', 'Admin', '2026-04-02 11:02:16', 'TEST', '9025728998', '', '', '', 0, 0.00, 0.00, 1000.00, 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `vendor_material_prices`
--

CREATE TABLE `vendor_material_prices` (
  `id` int(11) NOT NULL,
  `vendor_id` int(11) DEFAULT NULL,
  `material_id` int(11) DEFAULT NULL,
  `price_per_kg` decimal(10,2) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `category` varchar(512) DEFAULT 'Materials'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `without_gst_bills`
--

CREATE TABLE `without_gst_bills` (
  `id` int(11) NOT NULL,
  `party_name` varchar(255) NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `bill_date` date DEFAULT curdate(),
  `type` varchar(20) NOT NULL,
  `reference_no` varchar(100) DEFAULT NULL,
  `description` varchar(512) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `tally_push_status` varchar(20) DEFAULT 'PENDING',
  `paid_amount` decimal(15,2) DEFAULT 0.00,
  `balance_amount` decimal(15,2) DEFAULT 0.00,
  `reason` text DEFAULT NULL,
  `is_deleted` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `accounts_ledger`
--
ALTER TABLE `accounts_ledger`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `accounts_report_log`
--
ALTER TABLE `accounts_report_log`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `account_payments`
--
ALTER TABLE `account_payments`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `admin_profile`
--
ALTER TABLE `admin_profile`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `staff_id` (`staff_id`,`attendance_date`),
  ADD KEY `idx_attendance_date_shift` (`attendance_date`,`shift`);

--
-- Indexes for table `bank_accounts`
--
ALTER TABLE `bank_accounts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `profile_id` (`profile_id`);

--
-- Indexes for table `customer_product_prices`
--
ALTER TABLE `customer_product_prices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `customer_id` (`customer_id`,`product_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `day_book`
--
ALTER TABLE `day_book`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `dispatch`
--
ALTER TABLE `dispatch`
  ADD PRIMARY KEY (`id`),
  ADD KEY `dispatched_by` (`dispatched_by`),
  ADD KEY `packing_list_id` (`packing_list_id`),
  ADD KEY `packing_sticker_id` (`packing_sticker_id`);

--
-- Indexes for table `dispatch_item`
--
ALTER TABLE `dispatch_item`
  ADD PRIMARY KEY (`id`),
  ADD KEY `dispatch_id` (`dispatch_id`);

--
-- Indexes for table `finished_goods_box_records`
--
ALTER TABLE `finished_goods_box_records`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `batch_number` (`batch_number`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `head_attendance`
--
ALTER TABLE `head_attendance`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `hourly_production_logs`
--
ALTER TABLE `hourly_production_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `inventory_colors`
--
ALTER TABLE `inventory_colors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `color_name` (`color_name`);

--
-- Indexes for table `inventory_finished_product`
--
ALTER TABLE `inventory_finished_product`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `inventory_materials`
--
ALTER TABLE `inventory_materials`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `material_name` (`material_name`);

--
-- Indexes for table `inventory_molds`
--
ALTER TABLE `inventory_molds`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `mold_name` (`mold_name`);

--
-- Indexes for table `inventory_others`
--
ALTER TABLE `inventory_others`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `inventory_packing`
--
ALTER TABLE `inventory_packing`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `item_name` (`item_name`);

--
-- Indexes for table `inventory_product`
--
ALTER TABLE `inventory_product`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `product_name` (`product_name`);

--
-- Indexes for table `inventory_semi_finished`
--
ALTER TABLE `inventory_semi_finished`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `inventory_usage_logs`
--
ALTER TABLE `inventory_usage_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `machine_status`
--
ALTER TABLE `machine_status`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `missed_record_requests`
--
ALTER TABLE `missed_record_requests`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `operators`
--
ALTER TABLE `operators`
  ADD PRIMARY KEY (`operator_id`);

--
-- Indexes for table `operator_active_shifts`
--
ALTER TABLE `operator_active_shifts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `operator_id` (`operator_id`);

--
-- Indexes for table `operator_machine_assignments`
--
ALTER TABLE `operator_machine_assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `shift_id` (`shift_id`),
  ADD KEY `machine_id` (`machine_id`);

--
-- Indexes for table `operator_report`
--
ALTER TABLE `operator_report`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `packing_list`
--
ALTER TABLE `packing_list`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `sales_history_id` (`sales_history_id`);

--
-- Indexes for table `packing_list_item`
--
ALTER TABLE `packing_list_item`
  ADD PRIMARY KEY (`id`),
  ADD KEY `packing_list_id` (`packing_list_id`);

--
-- Indexes for table `packing_material_report`
--
ALTER TABLE `packing_material_report`
  ADD PRIMARY KEY (`id`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `packing_list_id` (`packing_list_id`);

--
-- Indexes for table `packing_material_report_item`
--
ALTER TABLE `packing_material_report_item`
  ADD PRIMARY KEY (`id`),
  ADD KEY `packing_material_id` (`packing_material_id`),
  ADD KEY `report_id` (`report_id`);

--
-- Indexes for table `packing_sticker`
--
ALTER TABLE `packing_sticker`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `batch_number` (`batch_number`),
  ADD UNIQUE KEY `sticker_number` (`sticker_number`),
  ADD KEY `packing_list_id` (`packing_list_id`);

--
-- Indexes for table `pause_logs`
--
ALTER TABLE `pause_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `machine_id` (`machine_id`);

--
-- Indexes for table `production_logs`
--
ALTER TABLE `production_logs`
  ADD PRIMARY KEY (`log_id`);

--
-- Indexes for table `product_semi_finished_map`
--
ALTER TABLE `product_semi_finished_map`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `semi_finished_product_id` (`semi_finished_product_id`);

--
-- Indexes for table `purchase_orders`
--
ALTER TABLE `purchase_orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `request_id` (`request_id`);

--
-- Indexes for table `purchase_requests`
--
ALTER TABLE `purchase_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vendor_id` (`vendor_id`);

--
-- Indexes for table `qc_logs`
--
ALTER TABLE `qc_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sales_customers`
--
ALTER TABLE `sales_customers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sales_customer_products`
--
ALTER TABLE `sales_customer_products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indexes for table `sales_history`
--
ALTER TABLE `sales_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`),
  ADD KEY `sales_request_id` (`sales_request_id`);

--
-- Indexes for table `sales_history_items`
--
ALTER TABLE `sales_history_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sales_history_id` (`sales_history_id`);

--
-- Indexes for table `sales_invoices`
--
ALTER TABLE `sales_invoices`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indexes for table `sales_invoice_items`
--
ALTER TABLE `sales_invoice_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `invoice_id` (`invoice_id`);

--
-- Indexes for table `sales_requests`
--
ALTER TABLE `sales_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customer_id` (`customer_id`);

--
-- Indexes for table `sales_request_items`
--
ALTER TABLE `sales_request_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `sales_request_id` (`sales_request_id`);

--
-- Indexes for table `staffs`
--
ALTER TABLE `staffs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `staff_id` (`staff_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `vendors`
--
ALTER TABLE `vendors`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `vendor_material_prices`
--
ALTER TABLE `vendor_material_prices`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `vendor_id` (`vendor_id`,`material_id`,`category`),
  ADD UNIQUE KEY `vendor_material_prices_composite_key` (`vendor_id`,`material_id`,`category`);

--
-- Indexes for table `without_gst_bills`
--
ALTER TABLE `without_gst_bills`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `accounts_ledger`
--
ALTER TABLE `accounts_ledger`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `accounts_report_log`
--
ALTER TABLE `accounts_report_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `account_payments`
--
ALTER TABLE `account_payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `admin_profile`
--
ALTER TABLE `admin_profile`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `bank_accounts`
--
ALTER TABLE `bank_accounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `customer_product_prices`
--
ALTER TABLE `customer_product_prices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `day_book`
--
ALTER TABLE `day_book`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `dispatch`
--
ALTER TABLE `dispatch`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `dispatch_item`
--
ALTER TABLE `dispatch_item`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `finished_goods_box_records`
--
ALTER TABLE `finished_goods_box_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `head_attendance`
--
ALTER TABLE `head_attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `hourly_production_logs`
--
ALTER TABLE `hourly_production_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=958;

--
-- AUTO_INCREMENT for table `inventory_colors`
--
ALTER TABLE `inventory_colors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `inventory_finished_product`
--
ALTER TABLE `inventory_finished_product`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inventory_materials`
--
ALTER TABLE `inventory_materials`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `inventory_molds`
--
ALTER TABLE `inventory_molds`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT for table `inventory_others`
--
ALTER TABLE `inventory_others`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `inventory_packing`
--
ALTER TABLE `inventory_packing`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `inventory_product`
--
ALTER TABLE `inventory_product`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=102;

--
-- AUTO_INCREMENT for table `inventory_semi_finished`
--
ALTER TABLE `inventory_semi_finished`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT for table `inventory_usage_logs`
--
ALTER TABLE `inventory_usage_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=95;

--
-- AUTO_INCREMENT for table `machine_status`
--
ALTER TABLE `machine_status`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `missed_record_requests`
--
ALTER TABLE `missed_record_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `operator_active_shifts`
--
ALTER TABLE `operator_active_shifts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `operator_machine_assignments`
--
ALTER TABLE `operator_machine_assignments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=91;

--
-- AUTO_INCREMENT for table `operator_report`
--
ALTER TABLE `operator_report`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `packing_list`
--
ALTER TABLE `packing_list`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `packing_list_item`
--
ALTER TABLE `packing_list_item`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `packing_material_report`
--
ALTER TABLE `packing_material_report`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `packing_material_report_item`
--
ALTER TABLE `packing_material_report_item`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `packing_sticker`
--
ALTER TABLE `packing_sticker`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `pause_logs`
--
ALTER TABLE `pause_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

--
-- AUTO_INCREMENT for table `production_logs`
--
ALTER TABLE `production_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT for table `product_semi_finished_map`
--
ALTER TABLE `product_semi_finished_map`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=153;

--
-- AUTO_INCREMENT for table `purchase_orders`
--
ALTER TABLE `purchase_orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `purchase_requests`
--
ALTER TABLE `purchase_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `qc_logs`
--
ALTER TABLE `qc_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=52;

--
-- AUTO_INCREMENT for table `sales_customers`
--
ALTER TABLE `sales_customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=147;

--
-- AUTO_INCREMENT for table `sales_customer_products`
--
ALTER TABLE `sales_customer_products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sales_history`
--
ALTER TABLE `sales_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `sales_history_items`
--
ALTER TABLE `sales_history_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `sales_invoices`
--
ALTER TABLE `sales_invoices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sales_invoice_items`
--
ALTER TABLE `sales_invoice_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sales_requests`
--
ALTER TABLE `sales_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `sales_request_items`
--
ALTER TABLE `sales_request_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `staffs`
--
ALTER TABLE `staffs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `vendors`
--
ALTER TABLE `vendors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `vendor_material_prices`
--
ALTER TABLE `vendor_material_prices`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `without_gst_bills`
--
ALTER TABLE `without_gst_bills`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `admin_profile`
--
ALTER TABLE `admin_profile`
  ADD CONSTRAINT `admin_profile_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `bank_accounts`
--
ALTER TABLE `bank_accounts`
  ADD CONSTRAINT `bank_accounts_ibfk_1` FOREIGN KEY (`profile_id`) REFERENCES `admin_profile` (`id`);

--
-- Constraints for table `customer_product_prices`
--
ALTER TABLE `customer_product_prices`
  ADD CONSTRAINT `customer_product_prices_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `sales_customers` (`id`),
  ADD CONSTRAINT `customer_product_prices_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `inventory_product` (`id`);

--
-- Constraints for table `dispatch`
--
ALTER TABLE `dispatch`
  ADD CONSTRAINT `dispatch_ibfk_1` FOREIGN KEY (`dispatched_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `dispatch_ibfk_2` FOREIGN KEY (`packing_list_id`) REFERENCES `packing_list` (`id`),
  ADD CONSTRAINT `dispatch_ibfk_3` FOREIGN KEY (`packing_sticker_id`) REFERENCES `packing_sticker` (`id`);

--
-- Constraints for table `dispatch_item`
--
ALTER TABLE `dispatch_item`
  ADD CONSTRAINT `dispatch_item_ibfk_1` FOREIGN KEY (`dispatch_id`) REFERENCES `dispatch` (`id`);

--
-- Constraints for table `finished_goods_box_records`
--
ALTER TABLE `finished_goods_box_records`
  ADD CONSTRAINT `finished_goods_box_records_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `inventory_product` (`id`);

--
-- Constraints for table `inventory_finished_product`
--
ALTER TABLE `inventory_finished_product`
  ADD CONSTRAINT `inventory_finished_product_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `inventory_product` (`id`);

--
-- Constraints for table `operator_machine_assignments`
--
ALTER TABLE `operator_machine_assignments`
  ADD CONSTRAINT `fk_shift` FOREIGN KEY (`shift_id`) REFERENCES `operator_active_shifts` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `packing_list`
--
ALTER TABLE `packing_list`
  ADD CONSTRAINT `packing_list_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `packing_list_ibfk_2` FOREIGN KEY (`sales_history_id`) REFERENCES `sales_history` (`id`);

--
-- Constraints for table `packing_list_item`
--
ALTER TABLE `packing_list_item`
  ADD CONSTRAINT `packing_list_item_ibfk_1` FOREIGN KEY (`packing_list_id`) REFERENCES `packing_list` (`id`);

--
-- Constraints for table `packing_material_report`
--
ALTER TABLE `packing_material_report`
  ADD CONSTRAINT `packing_material_report_ibfk_1` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `packing_material_report_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `packing_material_report_ibfk_3` FOREIGN KEY (`packing_list_id`) REFERENCES `packing_list` (`id`);

--
-- Constraints for table `packing_material_report_item`
--
ALTER TABLE `packing_material_report_item`
  ADD CONSTRAINT `packing_material_report_item_ibfk_1` FOREIGN KEY (`packing_material_id`) REFERENCES `inventory_packing` (`id`),
  ADD CONSTRAINT `packing_material_report_item_ibfk_2` FOREIGN KEY (`report_id`) REFERENCES `packing_material_report` (`id`);

--
-- Constraints for table `packing_sticker`
--
ALTER TABLE `packing_sticker`
  ADD CONSTRAINT `packing_sticker_ibfk_1` FOREIGN KEY (`packing_list_id`) REFERENCES `packing_list` (`id`);

--
-- Constraints for table `pause_logs`
--
ALTER TABLE `pause_logs`
  ADD CONSTRAINT `pause_logs_ibfk_1` FOREIGN KEY (`machine_id`) REFERENCES `machine_status` (`id`);

--
-- Constraints for table `product_semi_finished_map`
--
ALTER TABLE `product_semi_finished_map`
  ADD CONSTRAINT `product_semi_finished_map_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `inventory_product` (`id`),
  ADD CONSTRAINT `product_semi_finished_map_ibfk_2` FOREIGN KEY (`semi_finished_product_id`) REFERENCES `inventory_semi_finished` (`id`);

--
-- Constraints for table `purchase_orders`
--
ALTER TABLE `purchase_orders`
  ADD CONSTRAINT `purchase_orders_ibfk_1` FOREIGN KEY (`request_id`) REFERENCES `purchase_requests` (`id`);

--
-- Constraints for table `purchase_requests`
--
ALTER TABLE `purchase_requests`
  ADD CONSTRAINT `purchase_requests_ibfk_1` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`);

--
-- Constraints for table `sales_customer_products`
--
ALTER TABLE `sales_customer_products`
  ADD CONSTRAINT `sales_customer_products_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `sales_customers` (`id`);

--
-- Constraints for table `sales_history`
--
ALTER TABLE `sales_history`
  ADD CONSTRAINT `sales_history_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `sales_customers` (`id`),
  ADD CONSTRAINT `sales_history_ibfk_2` FOREIGN KEY (`sales_request_id`) REFERENCES `sales_requests` (`id`);

--
-- Constraints for table `sales_history_items`
--
ALTER TABLE `sales_history_items`
  ADD CONSTRAINT `sales_history_items_ibfk_1` FOREIGN KEY (`sales_history_id`) REFERENCES `sales_history` (`id`);

--
-- Constraints for table `sales_invoices`
--
ALTER TABLE `sales_invoices`
  ADD CONSTRAINT `sales_invoices_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `sales_customers` (`id`);

--
-- Constraints for table `sales_invoice_items`
--
ALTER TABLE `sales_invoice_items`
  ADD CONSTRAINT `sales_invoice_items_ibfk_1` FOREIGN KEY (`invoice_id`) REFERENCES `sales_invoices` (`id`);

--
-- Constraints for table `sales_requests`
--
ALTER TABLE `sales_requests`
  ADD CONSTRAINT `sales_requests_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `sales_customers` (`id`);

--
-- Constraints for table `sales_request_items`
--
ALTER TABLE `sales_request_items`
  ADD CONSTRAINT `sales_request_items_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `inventory_product` (`id`),
  ADD CONSTRAINT `sales_request_items_ibfk_2` FOREIGN KEY (`sales_request_id`) REFERENCES `sales_requests` (`id`);

--
-- Constraints for table `vendor_material_prices`
--
ALTER TABLE `vendor_material_prices`
  ADD CONSTRAINT `vendor_material_prices_ibfk_1` FOREIGN KEY (`vendor_id`) REFERENCES `vendors` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
