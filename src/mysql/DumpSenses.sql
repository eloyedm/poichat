CREATE DATABASE  IF NOT EXISTS `senses` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `senses`;
-- MySQL dump 10.13  Distrib 5.6.13, for osx10.6 (i386)
--
-- Host: 127.0.0.1    Database: senses
-- ------------------------------------------------------
-- Server version	5.7.18

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `idUser` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(50) NOT NULL,
  `info` varchar(255) DEFAULT NULL,
  `status` enum('conectado','ausente','ocupado','desconectado') NOT NULL DEFAULT 'conectado',
  `picture` text,
  `validToken` varchar(64) DEFAULT NULL,
  `secret` varchar(256) DEFAULT NULL,
  `fk_idGame` int(10) unsigned DEFAULT NULL,
  `points` int(10) unsigned DEFAULT '0',
  `record` int(10) unsigned DEFAULT '0',
  `confirmed` bit(1) NOT NULL DEFAULT b'0',
  PRIMARY KEY (`idUser`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_idGame` (`fk_idGame`),
  CONSTRAINT `user_ibfk_1` FOREIGN KEY (`fk_idGame`) REFERENCES `game` (`idGame`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'eloy.edm','eloy.edm@gmail.com','99ccabed315e3609cae2dd150db1210b',NULL,'conectado',NULL,'ff549e1b5d966b2fc1effa675d3475f6a243e06086b85e060ed0eaf1a78147ef','23a38d85aa96a9d53b554126fdba22d260f268b8e3224f05885fda0656d22fd7',NULL,4,0,'\0'),(2,'gerardo.soriano','gerardo.soriano@mail.com','4220c1473dfa337d52e21692dd061854',NULL,'conectado',NULL,'ec2ba1769647e459d378b3def0df9de8572c6439590c31eef499bae2f1d344ce','fc873c0db4dc9fcdaefa35d64f41dad90b2f6887cb5bd52f8c130bf4ee6e999d',NULL,0,0,'\0');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `badge`
--

DROP TABLE IF EXISTS `badge`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `badge` (
  `idbadge` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `description` varchar(300) DEFAULT NULL,
  `points` smallint(6) DEFAULT '-1',
  `wins` smallint(6) DEFAULT '-1',
  `rank` enum('rock','iron','silver','gold') DEFAULT 'rock',
  PRIMARY KEY (`idbadge`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=latin1;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `badge`
--

LOCK TABLES `badge` WRITE;
/*!40000 ALTER TABLE `badge` DISABLE KEYS */;
INSERT INTO `badge` VALUES (1,'Novato','Entra a la aplicacion por primera vez',0,0,'rock'),(2,'Suerte de novato','Gana tu primera partida',-1,1,'rock'),(3,'Primera sangre','Derrote a tu primer enemigo',1,-1,'rock'),(4,'Leyenda del espacio','Derrota a mil enemigos',1000,-1,'gold');
/*!40000 ALTER TABLE `badge` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'senses'
--
/*!50003 DROP PROCEDURE IF EXISTS `getBadges` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `getBadges`(
	in player varchar(50)
)
BEGIN
	declare playerPoints mediumint signed;
	declare playerRecord mediumint signed;

	SELECT points INTO playerPoints FROM user WHERE username = player;
	SELECT record INTO playerRecord FROM user WHERE username = player;

	SELECT name, description, rank 
	FROM badge 
	WHERE (points BETWEEN 0 AND playerPoints) OR (wins BETWEEN 0 AND playerRecord);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_insertMessage` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_insertMessage`(
	in _speaker varchar(50),
    in _recipient varchar(50),
    in _message text
)
begin
	declare idSpeaker int unsigned;
    declare idRecipient int unsigned;
    
	select idUser into idSpeaker from user where username = _speaker;
    
    select idUser into idRecipient from user where username = _recipient;
    
    insert into chat set
		speaker 	= idSpeaker,
        recipient 	= idRecipient,
        message 	= _message,
        sent 		= now();
end ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `sp_recoverMessages` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8 */ ;
/*!50003 SET character_set_results = utf8 */ ;
/*!50003 SET collation_connection  = utf8_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `sp_recoverMessages`(
	in _recipient varchar(50),
	in _speaker varchar(50)
)
BEGIN
	declare idRecipient int unsigned;
	declare idSpeaker int unsigned;
	select idUser into idRecipient from user where username = _recipient;
	select idUser into idSpeaker from user where username = _speaker;

	SELECT message FROM chat WHERE recipient = idRecipient AND speaker = idSpeaker;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2017-05-11 17:47:41
