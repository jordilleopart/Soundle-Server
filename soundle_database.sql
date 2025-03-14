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
  `track_audio_path` varchar(255) NOT NULL,
  PRIMARY KEY (`track_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `track`
--

LOCK TABLES `track` WRITE;
/*!40000 ALTER TABLE `track` DISABLE KEYS */;
INSERT INTO `track` VALUES ('0e7ipj03S05BNilyu5bRzt','rockstar','Post Malone, 21 Savage','2018-04-27','https://i.scdn.co/image/ab67616d0000b273b1c4b76e23414c9f20242268','mp3/PostMaloneft.21Savage-rockstar.mp3'),('0M9ydKzuF3oZTfYYPfaGX1','Bad and Boujee','Migos, Lil Uzi Vert','2017-01-27','https://i.scdn.co/image/ab67616d0000b2736275aeac316378b0dd4f31fd','mp3/Migos-BadandBoujeeftLilUziVert.mp3'),('0nbXyq5TXYPCO7pr3N8S4I','The Box','Roddy Ricch','2019-12-06','https://i.scdn.co/image/ab67616d0000b273600adbc750285ea1a8da249f','mp3/RoddyRicch-TheBox.mp3'),('0u695M7KyzXaPIjpEbxOkB','SICKO MODE','Travis Scott, Skrillex','2018-11-28','https://i.scdn.co/image/ab67616d0000b27318af0e1a13629cb52ec1ecb2','mp3/TravisScott-SICKOMODEft.Drake.mp3'),('0VgkVdmE4gld66l8iyGjgx','Mask Off','Future','2017-06-30','https://i.scdn.co/image/ab67616d0000b273e0b64c8be3c4e804abcb2696','mp3/Future-MaskOff.mp3'),('0wwPcA6wtMf6HUMpIRdeP7','Hotline Bling','Drake','2016-05-06','https://i.scdn.co/image/ab67616d0000b2739416ed64daf84936d89e671c','mp3/Drake-HotlineBling.mp3'),('1e1JKLEDKP7hEQzJfNAgPl','Magnolia','Playboi Carti','2017-04-14','https://i.scdn.co/image/ab67616d0000b273e31a279d267f3b3d8912e6f1','mp3/PlayboiCarti-Magnolia.mp3'),('1jaTQ3nqY3oAAYyCTbIvnM','WHATS POPPIN','Jack Harlow','2020-03-13','https://i.scdn.co/image/ab67616d0000b27305a448540b069450ccfba889','mp3/JackHarlow-WHATSPOPPIN.mp3'),('1wHZx0LgzFHyeIZkUydNXq','Antidote','Travis Scott','2015-09-04','https://i.scdn.co/image/ab67616d0000b2736cfd9a7353f98f5165ea6160','mp3/TravisScott-Antidote.mp3'),('285pBltuF7vW8TeWk8hdRR','Lucid Dreams','Juice WRLD','2018-12-10','https://i.scdn.co/image/ab67616d0000b273f7db43292a6a99b21b51d5b4','mp3/JuiceWRLD-LucidDreams.mp3'),('2SAqBLGA283SUiwJ3xOUVI','Laugh Now Cry Later','Drake, Lil Durk','2020-08-14','https://i.scdn.co/image/ab67616d0000b27352c75ed37313b889447011ef','mp3/Drake-LaughNowCryLater.mp3'),('34xTFwjPQ1dC6uJmleno7x','Godspeed','Frank Ocean','2016-08-20','https://i.scdn.co/image/ab67616d0000b273c5649add07ed3720be9d5526','mp3/FrankOcean-Godspeed.mp3'),('3AWDeHLc88XogCaCnZQLVI','Cry For Me','The Weeknd','2025-01-31','https://i.scdn.co/image/ab67616d0000b2737e7f1d0bdb2bb5a2afc4fb25','mp3/TheWeeknd-CryForMe.mp3'),('3s4mrPrEFFPF0LmAfutW0n','The London','Young Thug, J. Cole, Travis Scott','2019-08-16','https://i.scdn.co/image/ab67616d0000b2736fcd1b6e205d0d19d9efa0cc','mp3/YoungThug-The London.mp3'),('4EWCNWgDS8707fNSZ1oaA5','Heartless','Kanye West','2008-11-24','https://i.scdn.co/image/ab67616d0000b273346d77e155d854735410ed18','mp3/KanyeWest-Heartless.mp3'),('5yY9lUy8nbvjM1Uyo1Uqoc','Life Is Good','Future, Drake','2020-01-10','https://i.scdn.co/image/ab67616d0000b2738a01c7b77a34378a62f46402','mp3/Future-LifeIsGood.mp3'),('6AI3ezQ4o3HUoP6Dhudph3','Not Like Us','Kendric Lamar','2024-05-04','https://i.scdn.co/image/ab67616d0000b2731ea0c62b2339cbf493a999ad','mp3/NotLikeUs.mp3'),('6DCZcSspjsKoFjzjrWoCdn','Gods Plan','Drake','2018-06-29','https://i.scdn.co/image/ab67616d0000b273f907de96b9a4fbc04accc0d5','mp3/Drake-GodsPlan.mp3'),('6gBFPUFcJLzWGx4lenP6h2','goosebumps','Travis Scott','2016-09-16','https://i.scdn.co/image/ab67616d0000b273f54b99bf27cda88f4a7403ce','mp3/TravisScott-goosebumpsft.KendrickLamar.mp3'),('6KBYefIoo7KydImq1uUQlL','Bodak Yellow','Cardi B','2018-04-06','https://i.scdn.co/image/ab67616d0000b273a0caffda54afd0a65995bbab','mp3/CardiB-BodakYellow.mp3'),('722tgOgdIbNe3BEyLnejw4','Black Skinhead','Kanye West','2013-06-18','https://i.scdn.co/image/ab67616d0000b2731dacfbc31cc873d132958af9','mp3/KanyeWest-BLKKKSKKKNHEAD.mp3'),('78QR3Wp35dqAhFEc2qAGjE','Drip Too Hard','Lil Baby, Gunna','2018-10-05','https://i.scdn.co/image/ab67616d0000b273ce159a3ba2096e13fa9d4b4c','mp3/Lil BabyxGunna-DripTooHard.mp3'),('79s5XnCN4TJKTVMSmOx8Ep','Dior','Pop Smoke','2019-07-26','https://i.scdn.co/image/ab67616d0000b2738fe5d04b06aff90f9fe796f5','mp3/POPSMOKE-DIOR.mp3'),('7GX5flRQZVHRAGd6B4TmDO','XO Tour Llif3','Lil Uzi Vert','2017-08-25','https://i.scdn.co/image/ab67616d0000b273aab4824c720639a6a2d7d932','mp3/LilUziVert-XOTourLlif3.mp3'),('7IMwEtpAiJanqF6vQteZN2','Turks','NAV, Gunna, Travis Scott','2020-05-08','https://i.scdn.co/image/ab67616d0000b27336f15d38804d5bdd29b9fc7a','mp3/NAV&Gunna-Turks.mp3'),('7MXgrcOQAJ5VwSNUL0lDd3','Blinding Lights','The Weeknd','2020-12-04','https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36','mp3/TheWeeknd-BlindingLights.mp3'),('7wBJfHzpfI3032CSD7CE2m','STARGAZING','Travis Scott','2018-08-03','https://i.scdn.co/image/ab67616d0000b273072e9faef2ef7b6db63834a3','mp3/TravisScott-STARGAZING.mp3');
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

-- Dump completed on 2025-03-14 10:50:36
