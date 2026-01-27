-- Criação da Base de Dados (opcional, se ainda não tiveres uma)
CREATE DATABASE IF NOT EXISTS royaldrive_db;
USE royaldrive_db;

-- 1. Tabela de Utilizadores (Clientes e Admins)
CREATE TABLE utilizadores (
    id_utilizador INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- RNF1: Segurança de passwords [cite: 159]
    nif VARCHAR(9) UNIQUE,
    telefone VARCHAR(20),
    morada VARCHAR(255),
    data_registo DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultimo_login DATETIME,
    role ENUM('Cliente', 'GestorAgencia', 'Administrador') DEFAULT 'Cliente' NOT NULL, -- [cite: 118]
    is_ativo BOOLEAN DEFAULT TRUE
);

-- 2. Tabela de Agências (Filiais)
CREATE TABLE agencias (
    id_agencia INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    morada VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(150),
    latitude DECIMAL(9,6) NOT NULL, -- UC05: Necessário para Google Maps [cite: 120, 299]
    longitude DECIMAL(9,6) NOT NULL, -- UC05: Necessário para Google Maps [cite: 120, 299]
    horario_funcionamento VARCHAR(255)
);

-- 3. Tabela de Tipos de Veículo (Categorias)
CREATE TABLE tipos_veiculo (
    id_tipo_veiculo INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) UNIQUE NOT NULL, -- Ex: Compacto, SUV, Luxo [cite: 122]
    descricao TEXT,
    caracteristicas VARCHAR(255),
    preco_base_diario DECIMAL(10,2) NOT NULL
);

-- 4. Tabela de Veículos (Frota)
CREATE TABLE veiculos (
    id_veiculo INT AUTO_INCREMENT PRIMARY KEY,
    matricula VARCHAR(15) UNIQUE NOT NULL,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(100) NOT NULL,
    ano_fabrico YEAR NOT NULL, -- [cite: 124]
    cor VARCHAR(50),
    id_tipo_veiculo INT NOT NULL,
    id_agencia_atual INT NOT NULL,
    estado ENUM('Disponível', 'Alugado', 'Manutenção') DEFAULT 'Disponível' NOT NULL, -- [cite: 124]
    quilometragem INT,
    FOREIGN KEY (id_tipo_veiculo) REFERENCES tipos_veiculo(id_tipo_veiculo),
    FOREIGN KEY (id_agencia_atual) REFERENCES agencias(id_agencia)
);

-- 5. Tabela de Reservas (Unificada com Pagamentos)
CREATE TABLE reservas (
    id_reserva INT AUTO_INCREMENT PRIMARY KEY,
    id_utilizador INT NOT NULL,
    id_veiculo INT NOT NULL,
    id_agencia_levantamento INT NOT NULL,
    id_agencia_devolucao INT NOT NULL,
    
    data_levantamento DATETIME NOT NULL,
    data_devolucao DATETIME NOT NULL,
    data_reserva DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    valor_total DECIMAL(10,2) NOT NULL,
    
    -- Dados de Pagamento e Estado [cite: 126]
    metodo_pagamento ENUM('Cartão de Crédito', 'MB Way', 'PayPal', 'Transferência'),
    estado_pagamento ENUM('Pendente', 'Concluído', 'Falhado', 'Devolvido') DEFAULT 'Pendente' NOT NULL,
    estado_reserva ENUM('Pendente', 'Confirmada', 'Cancelada', 'Concluída') DEFAULT 'Pendente' NOT NULL,
    
    -- Campo Extra para Integração Easypay
    easypay_transaction_id VARCHAR(100),
    observacoes TEXT,
    
    FOREIGN KEY (id_utilizador) REFERENCES utilizadores(id_utilizador),
    FOREIGN KEY (id_veiculo) REFERENCES veiculos(id_veiculo),
    FOREIGN KEY (id_agencia_levantamento) REFERENCES agencias(id_agencia),
    FOREIGN KEY (id_agencia_devolucao) REFERENCES agencias(id_agencia)
);