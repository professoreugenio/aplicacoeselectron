



-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: estoque_bd
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `categorias_tb`
--




CREATE DATABASE IF NOT EXISTS estoque_bd
DEFAULT CHARACTER SET utf8mb4
COLLATE utf8mb4_0900_ai_ci;

USE estoque_bd;

DROP TABLE IF EXISTS `categorias_tb`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categorias_tb` (
  `id_categoria` int NOT NULL AUTO_INCREMENT,
  `nome_categoria` varchar(100) NOT NULL,
  `descricao_categoria` varchar(255) DEFAULT NULL,
  `data_cadastro` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_categoria`),
  UNIQUE KEY `nome_categoria` (`nome_categoria`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias_tb`
--

LOCK TABLES `categorias_tb` WRITE;
/*!40000 ALTER TABLE `categorias_tb` DISABLE KEYS */;
INSERT INTO `categorias_tb` VALUES (1,'Informática','Periféricos e acessórios de informática','2026-11-24 16:47:46'),(2,'Escritório','Material utilizado em escritórios','2026-11-24 16:47:46');
/*!40000 ALTER TABLE `categorias_tb` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `historico_tb`
--

DROP TABLE IF EXISTS `historico_tb`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `historico_tb` (
  `id_historico` bigint NOT NULL AUTO_INCREMENT,
  `id_usuario` int DEFAULT NULL,
  `acao` varchar(60) NOT NULL,
  `descricao` text,
  `entidade` varchar(60) DEFAULT NULL,
  `id_registro` bigint DEFAULT NULL,
  `resultado` enum('SUCESSO','FALHA') NOT NULL DEFAULT 'SUCESSO',
  `data_hora` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `ip_acesso` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id_historico`),
  KEY `idx_hist_usuario_data` (`id_usuario`,`data_hora`),
  KEY `idx_hist_acao_data` (`acao`,`data_hora`),
  CONSTRAINT `fk_hist_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios_tb` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `historico_tb`
--

LOCK TABLES `historico_tb` WRITE;
/*!40000 ALTER TABLE `historico_tb` DISABLE KEYS */;
INSERT INTO `historico_tb` VALUES (1,1,'USUARIO_CRIADO','Conta admin criada no preparo inicial','usuarios_tb',1,'SUCESSO','2026-11-24 20:12:32',NULL),(2,2,'USUARIO_CRIADO','Conta operador criada no preparo inicial','usuarios_tb',2,'SUCESSO','2026-11-24 20:12:57',NULL),(3,NULL,'LOGIN_FALHA','Falha de autenticação','usuarios_tb',NULL,'FALHA','2026-11-24 20:13:43',NULL),(4,1,'LOGIN_SUCESSO','Acesso ao sistema','usuarios_tb',NULL,'SUCESSO','2026-11-24 20:15:55',NULL),(5,1,'LOGOUT','Saída do sistema','usuarios_tb',NULL,'SUCESSO','2026-11-24 20:16:46',NULL),(6,NULL,'LOGIN_FALHA','Falha de autenticação','usuarios_tb',NULL,'FALHA','2026-11-24 20:16:51',NULL),(7,1,'LOGIN_FALHA','Falha de autenticação','usuarios_tb',NULL,'FALHA','2026-11-25 16:24:50',NULL),(8,1,'LOGIN_SUCESSO','Acesso ao sistema','usuarios_tb',NULL,'SUCESSO','2026-11-25 16:25:11',NULL),(9,1,'LOGOUT','Saída do sistema','usuarios_tb',NULL,'SUCESSO','2026-11-25 16:25:26',NULL),(10,NULL,'LOGIN_FALHA','Falha de autenticação','usuarios_tb',NULL,'FALHA','2026-11-25 16:25:36',NULL);
/*!40000 ALTER TABLE `historico_tb` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `movimentacoes_tb`
--

DROP TABLE IF EXISTS `movimentacoes_tb`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `movimentacoes_tb` (
  `id_movimentacao` bigint NOT NULL AUTO_INCREMENT,
  `id_produto` int NOT NULL,
  `id_usuario` int DEFAULT NULL,
  `tipo_movimentacao` enum('ENTRADA','SAIDA') NOT NULL,
  `quantidade` int NOT NULL,
  `observacao` varchar(255) DEFAULT NULL,
  `data_movimentacao` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_movimentacao`),
  KEY `fk_mov_produto` (`id_produto`),
  KEY `fk_mov_usuario` (`id_usuario`),
  KEY `idx_mov_data` (`data_movimentacao`),
  CONSTRAINT `fk_mov_produto` FOREIGN KEY (`id_produto`) REFERENCES `produtos_tb` (`id_produto`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `fk_mov_usuario` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios_tb` (`id_usuario`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `chk_mov_quantidade` CHECK ((`quantidade` > 0))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `movimentacoes_tb`
--

LOCK TABLES `movimentacoes_tb` WRITE;
/*!40000 ALTER TABLE `movimentacoes_tb` DISABLE KEYS */;
/*!40000 ALTER TABLE `movimentacoes_tb` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `produtos_tb`
--

DROP TABLE IF EXISTS `produtos_tb`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `produtos_tb` (
  `id_produto` int NOT NULL AUTO_INCREMENT,
  `id_categoria` int NOT NULL,
  `nome_produto` varchar(150) NOT NULL,
  `codigo_barras` varchar(60) DEFAULT NULL,
  `descricao_produto` text,
  `preco_custo` decimal(10,2) NOT NULL DEFAULT '0.00',
  `preco_venda` decimal(10,2) NOT NULL DEFAULT '0.00',
  `estoque_atual` int NOT NULL DEFAULT '0',
  `estoque_minimo` int NOT NULL DEFAULT '0',
  `imagem` varchar(255) DEFAULT NULL,
  `data_vencimento` date DEFAULT NULL,
  `data_cadastro` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_produto`),
  UNIQUE KEY `codigo_barras` (`codigo_barras`),
  KEY `fk_produto_categoria` (`id_categoria`),
  KEY `idx_produto_nome` (`nome_produto`),
  KEY `idx_produto_vencimento` (`data_vencimento`),
  CONSTRAINT `fk_produto_categoria` FOREIGN KEY (`id_categoria`) REFERENCES `categorias_tb` (`id_categoria`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `chk_estoque` CHECK (((`estoque_atual` >= 0) and (`estoque_minimo` >= 0))),
  CONSTRAINT `chk_precos` CHECK (((`preco_custo` >= 0) and (`preco_venda` >= 0)))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `produtos_tb`
--

LOCK TABLES `produtos_tb` WRITE;
/*!40000 ALTER TABLE `produtos_tb` DISABLE KEYS */;
INSERT INTO `produtos_tb` VALUES (1,2,'Papel A4','789000000002',NULL,18.00,29.90,0,5,'papel-a4.jpg',NULL,'2026-11-24 16:47:58');
/*!40000 ALTER TABLE `produtos_tb` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios_tb`
--

DROP TABLE IF EXISTS `usuarios_tb`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios_tb` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nome_usuario` varchar(100) NOT NULL,
  `login_usuario` varchar(60) NOT NULL,
  `email_usuario` varchar(150) NOT NULL,
  `senha_usuario` varchar(255) NOT NULL,
  `foto_usuario` varchar(255) NOT NULL DEFAULT 'usuario.jpg',
  `nivel_usuario` tinyint unsigned NOT NULL DEFAULT '0',
  `ativo_usuario` tinyint(1) NOT NULL DEFAULT '1',
  `data_cadastro` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `login_usuario` (`login_usuario`),
  UNIQUE KEY `email_usuario` (`email_usuario`),
  CONSTRAINT `chk_ativo_usuario` CHECK ((`ativo_usuario` in (0,1))),
  CONSTRAINT `chk_nivel_usuario` CHECK ((`nivel_usuario` in (0,1)))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios_tb`
--

LOCK TABLES `usuarios_tb` WRITE;
/*!40000 ALTER TABLE `usuarios_tb` DISABLE KEYS */;
INSERT INTO `usuarios_tb` VALUES (1,'Admin','admin','admin@admin.com','scrypt$cd0642e71d6b981ed6ca2e8078f428d6$a516837210912e34ede77d7ff3d8c1ee5ac60c33532b4c51579322dcf5234e0d52a08801e7e606243cbfce5270173c6a7c8d5f03b0eab388a1e82275093411de','usuario.jpg',1,1,'2026-11-24 20:12:32'),(2,'Usuário','operador','usuario@usuario.com','scrypt$e5ca790a1ecb39c347306952141550fb$c0262b36440a15990c9320cf8237d219299a20c3cf648391724fed2dde36d9888d1eec7c6ea084ad4a6cb8850d19653d2f2cd4588fded972279d93b5b85847f9','usuario.jpg',0,1,'2026-11-24 20:12:57');
/*!40000 ALTER TABLE `usuarios_tb` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-25 14:09:52
