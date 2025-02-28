-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: soundle_database
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `game_scores`
--

DROP TABLE IF EXISTS `game_scores`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `game_scores` (
  `game_id` char(36) NOT NULL,
  `round` int NOT NULL,
  `user_id` char(36) NOT NULL,
  `user_score` int DEFAULT NULL,
  PRIMARY KEY (`game_id`,`round`,`user_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `game_scores_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`game_id`),
  CONSTRAINT `game_scores_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `game_scores`
--

LOCK TABLES `game_scores` WRITE;
/*!40000 ALTER TABLE `game_scores` DISABLE KEYS */;
/*!40000 ALTER TABLE `game_scores` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `games`
--

DROP TABLE IF EXISTS `games`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `games` (
  `game_id` char(36) NOT NULL,
  `game_creator` char(36) DEFAULT NULL,
  `num_players` int NOT NULL DEFAULT '0',
  `max_players` int NOT NULL DEFAULT '6',
  `rounds` int NOT NULL DEFAULT '5',
  `playlist` varchar(255) NOT NULL,
  `game_type` varchar(10) NOT NULL DEFAULT 'public',
  `code` char(6) DEFAULT NULL,
  `available` tinyint(1) NOT NULL DEFAULT '1',
  `creation_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`game_id`),
  KEY `game_creator` (`game_creator`),
  CONSTRAINT `games_ibfk_1` FOREIGN KEY (`game_creator`) REFERENCES `users` (`user_id`),
  CONSTRAINT `games_chk_1` CHECK ((`game_type` in (_utf8mb4'private',_utf8mb4'public')))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `games`
--

LOCK TABLES `games` WRITE;
/*!40000 ALTER TABLE `games` DISABLE KEYS */;
/*!40000 ALTER TABLE `games` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `before_insert_game` BEFORE INSERT ON `games` FOR EACH ROW BEGIN
    IF NEW.game_type = 'private' THEN
        SET NEW.code = UPPER(SUBSTRING(UUID(), 1, 6));  -- Extract 6 characters from UUID and convert to uppercase
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `playlist`
--

DROP TABLE IF EXISTS `playlist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `playlist` (
  `playlist_id` char(36) NOT NULL DEFAULT (uuid()),
  `playlist_name` varchar(255) NOT NULL,
  `playlist_description` varchar(255) DEFAULT NULL,
  `playlist_creator` char(36) NOT NULL,
  PRIMARY KEY (`playlist_id`),
  KEY `playlist_creator` (`playlist_creator`),
  CONSTRAINT `playlist_ibfk_1` FOREIGN KEY (`playlist_creator`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `playlist`
--

LOCK TABLES `playlist` WRITE;
/*!40000 ALTER TABLE `playlist` DISABLE KEYS */;
/*!40000 ALTER TABLE `playlist` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `playlisttrack`
--

DROP TABLE IF EXISTS `playlisttrack`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `playlisttrack` (
  `playlist_id` char(36) DEFAULT NULL,
  `track_id` varchar(255) DEFAULT NULL,
  KEY `playlist_id` (`playlist_id`),
  KEY `track_id` (`track_id`),
  CONSTRAINT `playlisttrack_ibfk_1` FOREIGN KEY (`playlist_id`) REFERENCES `playlist` (`playlist_id`),
  CONSTRAINT `playlisttrack_ibfk_2` FOREIGN KEY (`track_id`) REFERENCES `track` (`track_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `playlisttrack`
--

LOCK TABLES `playlisttrack` WRITE;
/*!40000 ALTER TABLE `playlisttrack` DISABLE KEYS */;
/*!40000 ALTER TABLE `playlisttrack` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `track`
--

DROP TABLE IF EXISTS `track`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `track` (
  `track_id` varchar(255) NOT NULL,
  `track_name` varchar(255) NOT NULL,
  `track_artist` varchar(255) NOT NULL,
  `track_release_date` date NOT NULL,
  `track_cover_url` varchar(255) NOT NULL,
  `track_preview_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`track_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `track`
--

LOCK TABLES `track` WRITE;
/*!40000 ALTER TABLE `track` DISABLE KEYS */;
/*!40000 ALTER TABLE `track` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` char(36) NOT NULL DEFAULT (uuid()),
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `user_email` varchar(50) NOT NULL,
  `user_name` varchar(50) NOT NULL,
  `user_password` char(32) NOT NULL,
  `join_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `user_email` (`user_email`),
  UNIQUE KEY `user_name` (`user_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_unicode_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'IGNORE_SPACE,ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `after_user_insert` AFTER INSERT ON `users` FOR EACH ROW BEGIN
    INSERT INTO userStats (user_id, total_games, total_wins)
    VALUES (NEW.user_id, 0, 0);
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `userstats`
--

DROP TABLE IF EXISTS `userstats`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `userstats` (
  `user_id` char(36) DEFAULT NULL,
  `total_games` int NOT NULL DEFAULT '0',
  `total_wins` int NOT NULL DEFAULT '0',
  KEY `user_id` (`user_id`),
  CONSTRAINT `userstats_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `userstats`
--

LOCK TABLES `userstats` WRITE;
/*!40000 ALTER TABLE `userstats` DISABLE KEYS */;
/*!40000 ALTER TABLE `userstats` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-02-28 16:15:03
