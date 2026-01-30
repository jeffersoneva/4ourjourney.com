-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 30/01/2026 às 18:29
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `db_4ourjourney`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `tb_interesses`
--

CREATE TABLE `tb_interesses` (
  `id` int(10) UNSIGNED NOT NULL,
  `interesse` varchar(60) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `tb_interesses`
--

INSERT INTO `tb_interesses` (`id`, `interesse`, `created_at`) VALUES
(1, 'Músicas', '2026-01-21 00:58:20'),
(2, 'Filmes & Séries', '2026-01-21 00:58:20'),
(3, 'Modas', '2026-01-21 00:58:20'),
(4, 'Política', '2026-01-21 00:58:20'),
(5, 'Viagens', '2026-01-21 00:58:20'),
(6, 'Tecnologia', '2026-01-21 00:58:20'),
(7, 'Esportes', '2026-01-21 00:58:20'),
(8, 'Gastronomia', '2026-01-21 00:58:20'),
(9, 'Espiritualidade', '2026-01-21 00:58:20');

-- --------------------------------------------------------

--
-- Estrutura para tabela `tb_login`
--

CREATE TABLE `tb_login` (
  `id` int(10) UNSIGNED NOT NULL,
  `email` varchar(60) NOT NULL,
  `pass` varchar(255) NOT NULL,
  `session_token` varchar(64) DEFAULT NULL,
  `last_activity` datetime DEFAULT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL DEFAULT 5,
  `situation` tinyint(1) NOT NULL DEFAULT 1,
  `fk_user` int(10) UNSIGNED NOT NULL,
  `session_id` varchar(128) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `tb_users`
--

CREATE TABLE `tb_users` (
  `id` int(10) UNSIGNED NOT NULL,
  `nome` varchar(100) NOT NULL,
  `sobrenome` varchar(100) NOT NULL,
  `nascimento_usuario` date NOT NULL,
  `nome_conjuge` varchar(100) NOT NULL,
  `sobrenome_conjuge` varchar(100) NOT NULL,
  `nascimento_conjuge` date NOT NULL,
  `nickname` varchar(60) NOT NULL,
  `tempo_juntos` int(10) UNSIGNED NOT NULL COMMENT 'Tempo do casal em meses ou anos (definir padrão)',
  `interesses` varchar(255) DEFAULT NULL COMMENT 'Filmes, séries, músicas, etc',
  `localizacao` varchar(100) DEFAULT NULL COMMENT 'Cidade/Estado ou região aproximada',
  `fk_login` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estrutura para tabela `tb_user_interesses`
--

CREATE TABLE `tb_user_interesses` (
  `id` int(10) UNSIGNED NOT NULL,
  `fk_user` int(10) UNSIGNED NOT NULL,
  `fk_interesse` int(10) UNSIGNED NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `tb_interesses`
--
ALTER TABLE `tb_interesses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `interesse` (`interesse`);

--
-- Índices de tabela `tb_login`
--
ALTER TABLE `tb_login`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_tb_login_email` (`email`),
  ADD KEY `fk_user` (`fk_user`),
  ADD KEY `idx_session_token` (`session_token`),
  ADD KEY `idx_tb_login_session_token` (`session_token`);

--
-- Índices de tabela `tb_users`
--
ALTER TABLE `tb_users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nickname` (`nickname`),
  ADD KEY `fk_login` (`fk_login`);

--
-- Índices de tabela `tb_user_interesses`
--
ALTER TABLE `tb_user_interesses`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_user_interesse` (`fk_user`,`fk_interesse`),
  ADD KEY `fk_interesse` (`fk_interesse`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `tb_interesses`
--
ALTER TABLE `tb_interesses`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de tabela `tb_login`
--
ALTER TABLE `tb_login`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `tb_users`
--
ALTER TABLE `tb_users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de tabela `tb_user_interesses`
--
ALTER TABLE `tb_user_interesses`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `tb_users`
--
ALTER TABLE `tb_users`
  ADD CONSTRAINT `tb_users_ibfk_1` FOREIGN KEY (`fk_login`) REFERENCES `tb_login` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Restrições para tabelas `tb_user_interesses`
--
ALTER TABLE `tb_user_interesses`
  ADD CONSTRAINT `tb_user_interesses_ibfk_1` FOREIGN KEY (`fk_user`) REFERENCES `tb_users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tb_user_interesses_ibfk_2` FOREIGN KEY (`fk_interesse`) REFERENCES `tb_interesses` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
