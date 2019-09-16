-- phpMyAdmin SQL Dump
-- version 4.8.4
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jun 05, 2019 at 05:50 AM
-- Server version: 10.1.37-MariaDB
-- PHP Version: 5.6.40

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `openproject_parkir`
--

-- --------------------------------------------------------

--
-- Table structure for table `account`
--

CREATE TABLE `account` (
  `id` int(11) UNSIGNED NOT NULL,
  `roleid` int(11) NOT NULL,
  `username` varchar(20) NOT NULL DEFAULT '',
  `password` text NOT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `email` varchar(20) NOT NULL DEFAULT '',
  `address` text NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updateAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `account`
--

INSERT INTO `account` (`id`, `roleid`, `username`, `password`, `full_name`, `email`, `address`, `createdAt`, `updateAt`) VALUES
(1, 1, 'alfaben12', 'alfaben120700', 'Thariq Alfa Benriska', 'alfaben@example.com', 'Jl. Ikan Piranha Atas No. 105', '2019-06-05 10:01:32', '2019-06-05 10:47:13');

-- --------------------------------------------------------

--
-- Table structure for table `account_role`
--

CREATE TABLE `account_role` (
  `id` int(11) UNSIGNED NOT NULL,
  `name` varchar(50) NOT NULL DEFAULT '',
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `account_role`
--

INSERT INTO `account_role` (`id`, `name`, `createdAt`, `updatedAt`) VALUES
(1, 'Tukang Parkir', '2019-06-05 10:01:44', '2019-06-05 10:01:44'),
(2, 'Member', '2019-06-05 10:45:26', '2019-06-05 10:45:34');

-- --------------------------------------------------------

--
-- Table structure for table `payment_parking`
--

CREATE TABLE `payment_parking` (
  `id` int(11) UNSIGNED NOT NULL,
  `from_accountid` int(11) NOT NULL,
  `to_account_id` int(11) NOT NULL,
  `nominal` int(11) NOT NULL,
  `description` text,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updateAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `account`
--
ALTER TABLE `account`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `account_role`
--
ALTER TABLE `account_role`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `payment_parking`
--
ALTER TABLE `payment_parking`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `account`
--
ALTER TABLE `account`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `account_role`
--
ALTER TABLE `account_role`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `payment_parking`
--
ALTER TABLE `payment_parking`
  MODIFY `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
