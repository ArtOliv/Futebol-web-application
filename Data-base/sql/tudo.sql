use campeonato_futebol;

DROP TABLE IF EXISTS Cartao;
DROP TABLE IF EXISTS Gol;
DROP TABLE IF EXISTS Jogo;
DROP TABLE IF EXISTS Classificacao;
DROP TABLE IF EXISTS Estadio;
DROP TABLE IF EXISTS Jogador;
DROP TABLE IF EXISTS Time_participa_campeonato;
DROP TABLE IF EXISTS Time;
DROP TABLE IF EXISTS Campeonato;
DROP TABLE IF EXISTS Administrador;

create table if not exists Administrador(
    c_email_adm VARCHAR(100) primary key,
    c_Pnome_adm VARCHAR(100) not null,
    c_Unome_adm VARCHAR(100) not null,
    c_senha_adm VARCHAR(100) not null);

create table if not exists Campeonato(
    c_nome_campeonato VARCHAR(100) not null,
    d_ano_campeonato YEAR not null,
    primary key (c_nome_campeonato, d_ano_campeonato));

create table if not exists Time(
    c_nome_time VARCHAR(100) primary key,
    c_cidade_time VARCHAR(100),
    c_tecnico_time VARCHAR(100));

create table if not exists Time_participa_campeonato(
    c_nome_time VARCHAR(100) not null,
    c_nome_campeonato VARCHAR(100) not null,
    d_ano_campeonato YEAR not null,
    primary key (c_nome_time, c_nome_campeonato, d_ano_campeonato),
    constraint fk_time_camp foreign key (c_nome_time) references Time(c_nome_time)
        ON UPDATE CASCADE,
    constraint fk_camp_time foreign key (c_nome_campeonato,d_ano_campeonato) references Campeonato(c_nome_campeonato,d_ano_campeonato)
        ON UPDATE CASCADE);

create table if not exists Jogador(
    id_jogador INT auto_increment primary key,
    c_Pnome_jogador VARCHAR(100),
    c_Unome_jogador VARCHAR(100),
    n_camisa INT CHECK (n_camisa >= 0 AND n_camisa < 100),
    d_data_nascimento DATE,
    c_posicao VARCHAR(100),
    c_nome_time VARCHAR(100),
    constraint fk_time_jogador foreign key (c_nome_time) references Time(c_nome_time)
        ON DELETE SET NULL ON UPDATE CASCADE);

create table if not exists Estadio(
    c_nome_estadio VARCHAR(100) primary key,
    c_cidade_estadio VARCHAR(100),
    n_capacidade INT);

create table if not exists Jogo(
    id_jogo INT auto_increment primary key,
    dt_data_horario DATETIME not null,
    n_rodada INT CHECK (n_rodada>=1 AND n_rodada<=38),
    n_placar_casa INT default 0 CHECK (n_placar_casa >= 0),
    n_placar_visitante INT default 0 CHECK (n_placar_visitante >= 0),
    c_nome_campeonato VARCHAR(100) not null,
    d_ano_campeonato YEAR not null,
    c_nome_estadio VARCHAR(100),
    c_time_casa VARCHAR(100),
    c_time_visitante VARCHAR(100),
    c_status VARCHAR(20) NOT NULL DEFAULT 'Agendado' CHECK (c_status IN ('Agendado', 'Em Andamento', 'Finalizado')),
    constraint fk_estadio_jogo foreign key (c_nome_estadio) references Estadio(c_nome_estadio)
            ON DELETE SET NULL ON UPDATE CASCADE,
    constraint fk_time_casa_jogo foreign key (c_time_casa) references Time(c_nome_time)
            ON DELETE SET NULL ON UPDATE CASCADE,
    constraint fk_time_visitante_jogo foreign key (c_time_visitante) references Time(c_nome_time)
            ON DELETE SET NULL ON UPDATE CASCADE,
    constraint fk_campeonato_jogo foreign key (c_nome_campeonato,d_ano_campeonato) references Campeonato(c_nome_campeonato,d_ano_campeonato)
            ON UPDATE CASCADE);

create table if not exists Gol(
    id_gol INT auto_increment,
    n_minuto_gol INT not null CHECK (n_minuto_gol>=0 AND n_minuto_gol<=200),
    id_jogo INT not null,
    id_jogador INT,
    primary key (id_gol, id_jogo),
    constraint fk_jogo_gol foreign key (id_jogo) references Jogo(id_jogo)
        ON UPDATE CASCADE,
    CONSTRAINT fk_jogador_gol FOREIGN KEY (id_jogador) REFERENCES Jogador(id_jogador)
        ON DELETE SET NULL ON UPDATE CASCADE
);

create table if not exists Cartao(
    id_cartao INT auto_increment,
    e_tipo ENUM('amarelo', 'vermelho') not null,
    n_minuto_cartao INT not null CHECK (n_minuto_cartao>=0 AND n_minuto_cartao<=200),
    id_jogo INT not null,
    id_jogador INT,
    primary key (id_cartao, id_jogo),
    constraint fk_jogo_cartao foreign key (id_jogo) references Jogo(id_jogo)
            ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_jogador_cartao FOREIGN KEY (id_jogador) REFERENCES Jogador(id_jogador)
            ON DELETE SET NULL ON UPDATE CASCADE);

create table if not exists Classificacao(
    c_nome_campeonato VARCHAR(100) not null,
    d_ano_campeonato YEAR not null, -- CORRIGIDO AQUI
    c_nome_time VARCHAR(100) not null,
    n_pontos INT generated always AS (3*n_vitorias + n_empates) STORED,
    n_jogos INT GENERATED ALWAYS AS (n_vitorias + n_empates + n_derrotas) STORED,
    n_vitorias INT default 0,
    n_empates INT default 0,
    n_derrotas INT default 0,
    n_gols_pro INT default 0,
    n_gols_contra INT default 0,
    n_saldo_gols INT generated always as (n_gols_pro - n_gols_contra) stored,
    primary key (c_nome_campeonato,d_ano_campeonato, c_nome_time), -- CORRIGIDO AQUI
    constraint fk_time_classificacao foreign key (c_nome_time) references Time(c_nome_time)
            ON UPDATE CASCADE,
    constraint fk_campeonato_classificacao foreign key (c_nome_campeonato,d_ano_campeonato) references Campeonato(c_nome_campeonato,d_ano_campeonato) -- CORRIGIDO AQUI
            ON UPDATE CASCADE
);

DELIMITER $$
CREATE TRIGGER atualizar_jogo_na_tabela
AFTER UPDATE ON JOGO
FOR EACH ROW
BEGIN
	IF NEW.c_status = 'Finalizado' AND OLD.c_status <> 'Finalizado' THEN
		UPDATE classificacao
		SET
			n_vitorias = n_vitorias + CASE WHEN NEW.n_placar_casa > NEW.n_placar_visitante THEN 1 ELSE 0 END,
			n_derrotas = n_derrotas + CASE WHEN NEW.n_placar_casa < NEW.n_placar_visitante THEN 1 ELSE 0 END,
			n_empates = n_empates + CASE WHEN NEW.n_placar_casa = NEW.n_placar_visitante THEN 1 ELSE 0 END,
			n_gols_pro = n_gols_pro + NEW.n_placar_casa,
			n_gols_contra = n_gols_contra + NEW.n_placar_visitante
		WHERE c_nome_time = NEW.c_time_casa AND NEW.c_nome_campeonato = c_nome_campeonato AND NEW.d_ano_campeonato = d_ano_campeonato;
		
		UPDATE classificacao
		SET 
			n_vitorias = n_vitorias + CASE WHEN NEW.n_placar_casa < NEW.n_placar_visitante THEN 1 ELSE 0 END,
			n_derrotas = n_derrotas + CASE WHEN NEW.n_placar_casa > NEW.n_placar_visitante THEN 1 ELSE 0 END,
			n_empates = n_empates + CASE WHEN NEW.n_placar_casa = NEW.n_placar_visitante THEN 1 ELSE 0 END,
			n_gols_pro = n_gols_pro + NEW.n_placar_visitante,
			n_gols_contra = n_gols_contra + NEW.n_placar_casa
		WHERE c_nome_time = NEW.c_time_visitante AND NEW.c_nome_campeonato = c_nome_campeonato AND NEW.d_ano_campeonato = d_ano_campeonato;
	END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER atulizar_pontuacao_no_jogo
AFTER INSERT ON Gol
FOR EACH ROW
BEGIN
	DECLARE time_fez_gol VARCHAR(100);
	SELECT c_nome_time INTO time_fez_gol
	FROM Jogador
	WHERE id_jogador = NEW.id_jogador;

	UPDATE Jogo
	SET
		n_placar_casa = n_placar_casa + CASE WHEN time_fez_gol = c_time_casa THEN 1 ELSE 0 END,
		n_placar_visitante = n_placar_visitante + CASE WHEN time_fez_gol = c_time_visitante THEN 1 ELSE 0 END
	WHERE id_jogo = NEW.id_jogo;
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER criar_classificacao
AFTER INSERT ON time_participa_campeonato 
FOR EACH ROW
BEGIN
    INSERT INTO Classificacao
        (c_nome_campeonato, d_ano_campeonato, c_nome_time,n_vitorias, n_empates, n_derrotas, n_gols_pro, n_gols_contra)
    SELECT
        NEW.c_nome_campeonato,
        NEW.d_ano_campeonato,
        NEW.c_nome_time, 
        0,
        0, 
        0,
        0, 
        0;
END$$
DELIMITER ;
        
DELIMITER $$
CREATE TRIGGER cartao_vermelho_automatico
BEFORE INSERT ON Cartao
FOR EACH ROW
BEGIN
	DECLARE num_cartao INT;

	IF NEW.e_tipo = 'amarelo' AND NEW.id_jogador IS NOT NULL THEN
		SELECT COUNT(*) INTO num_cartao
		FROM Cartao
		WHERE id_jogo = NEW.id_jogo
		  AND id_jogador = NEW.id_jogador
		  AND e_tipo = 'amarelo';

		IF num_cartao >= 1 THEN
			SET NEW.e_tipo = 'vermelho';
		END IF;
	END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER verificar_capacidade_estadio
BEFORE INSERT ON Jogo
FOR EACH ROW
BEGIN
  DECLARE capacidade INT;
  SELECT n_capacidade INTO capacidade FROM Estadio WHERE c_nome_estadio = NEW.c_nome_estadio;
  IF capacidade IS NULL OR capacidade <= 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Estádio com capacidade inválida.';
  END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER impedir_jogo_mesmo_time
BEFORE INSERT ON Jogo
FOR EACH ROW
BEGIN
  IF NEW.c_time_casa = NEW.c_time_visitante THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Um time não pode jogar contra si mesmo.';
  END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER impedir_inserção_mesmo_jogo
BEFORE INSERT ON Jogo
FOR EACH ROW
BEGIN
	DECLARE ja_tem INT;
	SELECT COUNT(*) INTO ja_tem FROM Jogo
    WHERE dt_data_horario = NEW.dt_data_horario
		AND c_nome_campeonato = NEW.c_nome_campeonato
        AND d_ano_campeonato = NEW.d_ano_campeonato
        AND c_time_casa = NEW.c_time_casa
        AND c_time_visitante = NEW.c_time_visitante;
	
    IF ja_tem > 0 THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Jogo já está armazenado.';
	END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER impedir_gol_por_jogador_inválido
BEFORE INSERT ON GOL
FOR EACH ROW
BEGIN
	DECLARE time_jogador VARCHAR(100);
    DECLARE time_casa VARCHAR(100);
    DECLARE time_visitante VARCHAR(100);
    
	SELECT c_nome_time INTO time_jogador
    FROM jogador 
    WHERE id_jogador = NEW.id_jogador;
    
    SELECT c_time_casa,c_time_visitante INTO time_casa,time_visitante
    FROM jogo
    WHERE id_jogo = NEW.id_jogo;
    
    IF time_jogador != time_casa AND time_jogador != time_visitante THEN
		SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Jogador não pertence a nenhum dos times da partida.';
	END IF;
END$$
DELIMITER ;

DELIMITER $$

CREATE TRIGGER impedir_gol_update_por_jogador_inválido
BEFORE UPDATE ON GOL
FOR EACH ROW
BEGIN
    DECLARE time_jogador VARCHAR(100);
    DECLARE time_casa VARCHAR(100);
    DECLARE time_visitante VARCHAR(100);

    SELECT c_nome_time INTO time_jogador
    FROM jogador
    WHERE id_jogador = NEW.id_jogador;

    SELECT c_time_casa, c_time_visitante INTO time_casa, time_visitante
    FROM jogo
    WHERE id_jogo = NEW.id_jogo;

    IF time_jogador != time_casa AND time_jogador != time_visitante THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Modificação não permitida: Jogador não pertence a nenhum dos times da partida.';
    END IF;
END$$

DELIMITER ;

DELIMITER $$
CREATE TRIGGER impedir_novo_cartao_apos_vermelho
BEFORE INSERT ON CARTAO
FOR EACH ROW
BEGIN
	DECLARE expulso INT;
    
    SELECT COUNT(*) INTO expulso
    FROM cartao
    WHERE id_jogo = NEW.id_jogo
		AND id_jogador = NEW.id_jogador
		AND e_tipo = 'vermelho';
    
    IF expulso > 0 THEN
		SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Jogador expulso não pode receber novos cartões';
	END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER impedir_gol_apos_cartao_vermelho
BEFORE INSERT ON GOL
FOR EACH ROW
BEGIN
	DECLARE expulso INT;
    
    SELECT COUNT(*) INTO expulso
    FROM cartao
    WHERE id_jogo = NEW.id_jogo
		AND id_jogador = NEW.id_jogador
		AND e_tipo = 'vermelho';
    
    IF expulso > 0 THEN
		SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Jogador expulso não pode fazer gol';
	END IF;
END$$
DELIMITER ;

INSERT INTO time
(c_nome_time, c_cidade_time, c_tecnico_time)
VALUES
('Flamengo', 'Rio de Janeiro', 'Filipe Luís'),
('Palmeiras', 'São Paulo', 'Abel Ferreira'),
('Sao Paulo', 'São Paulo', 'Luis Zubeldía'),
('Corinthians', 'São Paulo', 'Dorival Júnior'),
('Santos', 'Santos', 'Cléber Xavier'),
('Cruzeiro', 'Belo Horizonte', 'Leonardo Jardim'),
('Atletico-MG', 'Belo Horizonte', 'Cuca'),
('Fluminense', 'Rio de Janeiro', 'Renato Gaúcho'),
('Vasco', 'Rio de Janeiro', 'Fernando Diniz'),
('Botafogo-RJ', 'Rio de Janeiro', 'Renato Paiva '),
('Gremio', 'Porto Alegre', 'Mano Menezes'),
('Internacional', 'Porto Alegre', 'Roger Machado'),
('Bahia', 'Bahia', 'Rogério Ceni'),
('Ceara', 'Ceará', 'Léo Condé'),
('Mirassol', 'Mirassol', 'Rafael Guanaes'),
('Fortaleza', 'Fortaleza', 'Juan Pablo Vojvoda'),
('Juventude', 'Caxias do Sul', 'Claudio Tencati'),
('Sport', 'Recife', 'Antônio Oliveira'),
('Cuiaba', 'Cuiabá', 'Guto Ferreira'),
('Bragantino', 'Bragança Paulista', 'Fernando Seabra'),
('Goias', 'Goiânia', 'Vagner Mancini'),
('Coritiba', 'Curitiba', 'Mozart Santos'),
('America-MG', 'Belo Horizonte', 'Enderson Moreira'),
('Athletico-PR', 'Curitiba', 'Odair Hellmann'),
('Paysandu', 'Belém', 'Claudinei Oliveira'),
('Ponte Preta', 'Campinas', 'Alberto Valentim'),
('Criciuma', 'Criciúma', 'Eduardo Baptista'),
('Figueirense', 'Florianópolis', 'Pintado'),
('Vitoria', 'Vitória', 'N. da Silveira Júnior'),
('Sao Caetano', 'São Caetano do Sul', 'Carlos Eduardo Gonçalves'),
('Parana', 'Curitiba', 'Ademir Fesan'),
('Brasiliense', 'Taguatinga', 'Roberto Cavalo'),
('Santa Cruz', 'Recife', 'E. Da Conceição Silva'),
('Nautico', 'Recife', 'Hélio dos Anjos'),
('America-RN', 'Natal', 'Moacir Júnior'),
('Ipatinga', 'Ipatinga', 'Marcos Valadares'),
('Portuguesa', 'São Paulo', 'Pintado'),
('Guarani', 'Campinas', 'Marcelo Fernandes'),
('Avai', 'Florianópolis', 'G. Kleina'),
('Santo Andre', 'Santo André', 'José Oliveira'),
('Atletico-GO', 'Goiânia', 'M. Ribeiro Cabo'),
('Gremio Prudente', 'Presidente Prudente', 'Rogério Correa'),
('Chapecoense', 'Chapecó', 'G. Dal Pozzo'),
('Joinville', 'Joinville', 'H. Maria'),
('CSA', 'Maceió', 'M. Ribeiro Cabo'),
('Barueri', 'Barueri', 'João Batista');

INSERT INTO campeonato
(c_nome_campeonato,d_ano_campeonato)
VALUES
('Brasileirão 2024', 2024),
('Brasileirão 2023', 2023),
('Brasileirão 2022', 2022),
('Brasileirão 2021', 2021),
('Brasileirão 2020', 2020),
('Brasileirão 2019', 2019),
('Brasileirão 2018', 2018),
('Brasileirão 2017', 2017),
('Brasileirão 2016', 2016),
('Brasileirão 2015', 2015),
('Brasileirão 2014', 2014);


INSERT INTO time_participa_campeonato
(c_nome_time, c_nome_campeonato, d_ano_campeonato)
VALUES
('Athletico-PR', 'Brasileirão 2014', 2014),
('Atletico-MG', 'Brasileirão 2014', 2014),
('Bahia', 'Brasileirão 2014', 2014),
('Botafogo-RJ', 'Brasileirão 2014', 2014),
('Chapecoense', 'Brasileirão 2014', 2014),
('Corinthians', 'Brasileirão 2014', 2014),
('Coritiba', 'Brasileirão 2014', 2014),
('Criciuma', 'Brasileirão 2014', 2014),
('Cruzeiro', 'Brasileirão 2014', 2014),
('Figueirense', 'Brasileirão 2014', 2014),
('Flamengo', 'Brasileirão 2014', 2014),
('Fluminense', 'Brasileirão 2014', 2014),
('Goias', 'Brasileirão 2014', 2014),
('Gremio', 'Brasileirão 2014', 2014),
('Internacional', 'Brasileirão 2014', 2014),
('Palmeiras', 'Brasileirão 2014', 2014),
('Santos', 'Brasileirão 2014', 2014),
('Sao Paulo', 'Brasileirão 2014', 2014),
('Sport', 'Brasileirão 2014', 2014),
('Vitoria', 'Brasileirão 2014', 2014),
('Athletico-PR', 'Brasileirão 2015', 2015),
('Atletico-MG', 'Brasileirão 2015', 2015),
('Avai', 'Brasileirão 2015', 2015),
('Chapecoense', 'Brasileirão 2015', 2015),
('Corinthians', 'Brasileirão 2015', 2015),
('Coritiba', 'Brasileirão 2015', 2015),
('Cruzeiro', 'Brasileirão 2015', 2015),
('Figueirense', 'Brasileirão 2015', 2015),
('Flamengo', 'Brasileirão 2015', 2015),
('Fluminense', 'Brasileirão 2015', 2015),
('Goias', 'Brasileirão 2015', 2015),
('Gremio', 'Brasileirão 2015', 2015),
('Internacional', 'Brasileirão 2015', 2015),
('Joinville', 'Brasileirão 2015', 2015),
('Palmeiras', 'Brasileirão 2015', 2015),
('Ponte Preta', 'Brasileirão 2015', 2015),
('Santos', 'Brasileirão 2015', 2015),
('Sao Paulo', 'Brasileirão 2015', 2015),
('Sport', 'Brasileirão 2015', 2015),
('Vasco', 'Brasileirão 2015', 2015),
('America-MG', 'Brasileirão 2016', 2016),
('Athletico-PR', 'Brasileirão 2016', 2016),
('Atletico-MG', 'Brasileirão 2016', 2016),
('Botafogo-RJ', 'Brasileirão 2016', 2016),
('Chapecoense', 'Brasileirão 2016', 2016),
('Corinthians', 'Brasileirão 2016', 2016),
('Coritiba', 'Brasileirão 2016', 2016),
('Cruzeiro', 'Brasileirão 2016', 2016),
('Figueirense', 'Brasileirão 2016', 2016),
('Flamengo', 'Brasileirão 2016', 2016),
('Fluminense', 'Brasileirão 2016', 2016),
('Gremio', 'Brasileirão 2016', 2016),
('Internacional', 'Brasileirão 2016', 2016),
('Palmeiras', 'Brasileirão 2016', 2016),
('Ponte Preta', 'Brasileirão 2016', 2016),
('Santa Cruz', 'Brasileirão 2016', 2016),
('Santos', 'Brasileirão 2016', 2016),
('Sao Paulo', 'Brasileirão 2016', 2016),
('Sport', 'Brasileirão 2016', 2016),
('Vitoria', 'Brasileirão 2016', 2016),
('Athletico-PR', 'Brasileirão 2017', 2017),
('Atletico-GO', 'Brasileirão 2017', 2017),
('Atletico-MG', 'Brasileirão 2017', 2017),
('Avai', 'Brasileirão 2017', 2017),
('Bahia', 'Brasileirão 2017', 2017),
('Botafogo-RJ', 'Brasileirão 2017', 2017),
('Chapecoense', 'Brasileirão 2017', 2017),
('Corinthians', 'Brasileirão 2017', 2017),
('Coritiba', 'Brasileirão 2017', 2017),
('Cruzeiro', 'Brasileirão 2017', 2017),
('Flamengo', 'Brasileirão 2017', 2017),
('Fluminense', 'Brasileirão 2017', 2017),
('Gremio', 'Brasileirão 2017', 2017),
('Palmeiras', 'Brasileirão 2017', 2017),
('Ponte Preta', 'Brasileirão 2017', 2017),
('Santos', 'Brasileirão 2017', 2017),
('Sao Paulo', 'Brasileirão 2017', 2017),
('Sport', 'Brasileirão 2017', 2017),
('Vasco', 'Brasileirão 2017', 2017),
('Vitoria', 'Brasileirão 2017', 2017),
('America-MG', 'Brasileirão 2018', 2018),
('Athletico-PR', 'Brasileirão 2018', 2018),
('Atletico-MG', 'Brasileirão 2018', 2018),
('Bahia', 'Brasileirão 2018', 2018),
('Botafogo-RJ', 'Brasileirão 2018', 2018),
('Ceara', 'Brasileirão 2018', 2018),
('Chapecoense', 'Brasileirão 2018', 2018),
('Corinthians', 'Brasileirão 2018', 2018),
('Cruzeiro', 'Brasileirão 2018', 2018),
('Flamengo', 'Brasileirão 2018', 2018),
('Fluminense', 'Brasileirão 2018', 2018),
('Gremio', 'Brasileirão 2018', 2018),
('Internacional', 'Brasileirão 2018', 2018),
('Palmeiras', 'Brasileirão 2018', 2018),
('Parana', 'Brasileirão 2018', 2018),
('Santos', 'Brasileirão 2018', 2018),
('Sao Paulo', 'Brasileirão 2018', 2018),
('Sport', 'Brasileirão 2018', 2018),
('Vasco', 'Brasileirão 2018', 2018),
('Vitoria', 'Brasileirão 2018', 2018),
('Athletico-PR', 'Brasileirão 2019', 2019),
('Atletico-MG', 'Brasileirão 2019', 2019),
('Avai', 'Brasileirão 2019', 2019),
('Bahia', 'Brasileirão 2019', 2019),
('Botafogo-RJ', 'Brasileirão 2019', 2019),
('CSA', 'Brasileirão 2019', 2019),
('Ceara', 'Brasileirão 2019', 2019),
('Chapecoense', 'Brasileirão 2019', 2019),
('Corinthians', 'Brasileirão 2019', 2019),
('Cruzeiro', 'Brasileirão 2019', 2019),
('Flamengo', 'Brasileirão 2019', 2019),
('Fluminense', 'Brasileirão 2019', 2019),
('Fortaleza', 'Brasileirão 2019', 2019),
('Goias', 'Brasileirão 2019', 2019),
('Gremio', 'Brasileirão 2019', 2019),
('Internacional', 'Brasileirão 2019', 2019),
('Palmeiras', 'Brasileirão 2019', 2019),
('Santos', 'Brasileirão 2019', 2019),
('Sao Paulo', 'Brasileirão 2019', 2019),
('Vasco', 'Brasileirão 2019', 2019),
('Athletico-PR', 'Brasileirão 2020', 2020),
('Atletico-GO', 'Brasileirão 2020', 2020),
('Atletico-MG', 'Brasileirão 2020', 2020),
('Bahia', 'Brasileirão 2020', 2020),
('Botafogo-RJ', 'Brasileirão 2020', 2020),
('Bragantino', 'Brasileirão 2020', 2020),
('Ceara', 'Brasileirão 2020', 2020),
('Corinthians', 'Brasileirão 2020', 2020),
('Coritiba', 'Brasileirão 2020', 2020),
('Flamengo', 'Brasileirão 2020', 2020),
('Fluminense', 'Brasileirão 2020', 2020),
('Fortaleza', 'Brasileirão 2020', 2020),
('Goias', 'Brasileirão 2020', 2020),
('Gremio', 'Brasileirão 2020', 2020),
('Internacional', 'Brasileirão 2020', 2020),
('Palmeiras', 'Brasileirão 2020', 2020),
('Santos', 'Brasileirão 2020', 2020),
('Sao Paulo', 'Brasileirão 2020', 2020),
('Sport', 'Brasileirão 2020', 2020),
('Vasco', 'Brasileirão 2020', 2020),
('America-MG', 'Brasileirão 2021', 2021),
('Athletico-PR', 'Brasileirão 2021', 2021),
('Atletico-GO', 'Brasileirão 2021', 2021),
('Atletico-MG', 'Brasileirão 2021', 2021),
('Bahia', 'Brasileirão 2021', 2021),
('Bragantino', 'Brasileirão 2021', 2021),
('Ceara', 'Brasileirão 2021', 2021),
('Chapecoense', 'Brasileirão 2021', 2021),
('Corinthians', 'Brasileirão 2021', 2021),
('Cuiaba', 'Brasileirão 2021', 2021),
('Flamengo', 'Brasileirão 2021', 2021),
('Fluminense', 'Brasileirão 2021', 2021),
('Fortaleza', 'Brasileirão 2021', 2021),
('Gremio', 'Brasileirão 2021', 2021),
('Internacional', 'Brasileirão 2021', 2021),
('Juventude', 'Brasileirão 2021', 2021),
('Palmeiras', 'Brasileirão 2021', 2021),
('Santos', 'Brasileirão 2021', 2021),
('Sao Paulo', 'Brasileirão 2021', 2021),
('Sport', 'Brasileirão 2021', 2021),
('America-MG', 'Brasileirão 2022', 2022),
('Athletico-PR', 'Brasileirão 2022', 2022),
('Atletico-GO', 'Brasileirão 2022', 2022),
('Atletico-MG', 'Brasileirão 2022', 2022),
('Avai', 'Brasileirão 2022', 2022),
('Botafogo-RJ', 'Brasileirão 2022', 2022),
('Bragantino', 'Brasileirão 2022', 2022),
('Ceara', 'Brasileirão 2022', 2022),
('Corinthians', 'Brasileirão 2022', 2022),
('Coritiba', 'Brasileirão 2022', 2022),
('Cuiaba', 'Brasileirão 2022', 2022),
('Flamengo', 'Brasileirão 2022', 2022),
('Fluminense', 'Brasileirão 2022', 2022),
('Fortaleza', 'Brasileirão 2022', 2022),
('Goias', 'Brasileirão 2022', 2022),
('Internacional', 'Brasileirão 2022', 2022),
('Juventude', 'Brasileirão 2022', 2022),
('Palmeiras', 'Brasileirão 2022', 2022),
('Santos', 'Brasileirão 2022', 2022),
('Sao Paulo', 'Brasileirão 2022', 2022),
('America-MG', 'Brasileirão 2023', 2023),
('Athletico-PR', 'Brasileirão 2023', 2023),
('Atletico-MG', 'Brasileirão 2023', 2023),
('Bahia', 'Brasileirão 2023', 2023),
('Botafogo-RJ', 'Brasileirão 2023', 2023),
('Bragantino', 'Brasileirão 2023', 2023),
('Corinthians', 'Brasileirão 2023', 2023),
('Coritiba', 'Brasileirão 2023', 2023),
('Cruzeiro', 'Brasileirão 2023', 2023),
('Cuiaba', 'Brasileirão 2023', 2023),
('Flamengo', 'Brasileirão 2023', 2023),
('Fluminense', 'Brasileirão 2023', 2023),
('Fortaleza', 'Brasileirão 2023', 2023),
('Goias', 'Brasileirão 2023', 2023),
('Gremio', 'Brasileirão 2023', 2023),
('Internacional', 'Brasileirão 2023', 2023),
('Palmeiras', 'Brasileirão 2023', 2023),
('Santos', 'Brasileirão 2023', 2023),
('Sao Paulo', 'Brasileirão 2023', 2023),
('Vasco', 'Brasileirão 2023', 2023),
('Athletico-PR', 'Brasileirão 2024', 2024),
('Atletico-GO', 'Brasileirão 2024', 2024),
('Atletico-MG', 'Brasileirão 2024', 2024),
('Bahia', 'Brasileirão 2024', 2024),
('Botafogo-RJ', 'Brasileirão 2024', 2024),
('Bragantino', 'Brasileirão 2024', 2024),
('Corinthians', 'Brasileirão 2024', 2024),
('Criciuma', 'Brasileirão 2024', 2024),
('Cruzeiro', 'Brasileirão 2024', 2024),
('Cuiaba', 'Brasileirão 2024', 2024),
('Flamengo', 'Brasileirão 2024', 2024),
('Fluminense', 'Brasileirão 2024', 2024),
('Fortaleza', 'Brasileirão 2024', 2024),
('Gremio', 'Brasileirão 2024', 2024),
('Internacional', 'Brasileirão 2024', 2024),
('Juventude', 'Brasileirão 2024', 2024),
('Palmeiras', 'Brasileirão 2024', 2024),
('Sao Paulo', 'Brasileirão 2024', 2024),
('Vasco', 'Brasileirão 2024', 2024),
('Vitoria', 'Brasileirão 2024', 2024);

insert into estadio
(c_nome_estadio,c_cidade_estadio,n_capacidade)
VALUES
('Allianz Parque', 'São Paulo', '43713'),
('Estádio Raimundo Sampaio', 'Belo Horizonte', '23000'),
('Nabizão', 'Bragança Paulista', '15010'),
('Ligga Arena', 'Curitiba', '42372'),
('Arena Castelão', 'Fortaleza', '63903'),
('Estádio Nilton Santos', 'Rio de Janeiro', '44661'),
('Mineirão', ' Belo Horizonte', '61927'),
('Maracanã', ' Rio de Janeiro', '78838'),
('Neo Química Arena', 'São Paulo', '49205'),
('Alfredo Jaconi', 'Caxias do Sul', '19924'),
('Arena Pantanal', 'Cuiabá', '44097'),
('Morumbi', ' São Paulo', '66795'),
('Estádio Beira-Rio', 'Porto Alegre', '50842'),
('Estádio Urbano Caldeira', 'Santos', '16068'),
('Couto Pereira', 'Curitiba', '40502'),
('Estádio Hailé Pinheiro - Serrinha', 'Goiânia', '14450'),
('Itaipava Arena Fonte Nova', 'Salvador', '48092'),
('Estádio São Januário', 'Rio de Janeiro', '21880'),
('Arena do Grêmio', 'Porto Alegre', '55396'),
('Estádio Joaquim Henrique Nogueira-Arena do jacaré', 'Sete Lagoas', '20000'),
('Estádio Municipal Parque do Sabiá', 'Uberlândia', '52990'),
('Estádio Municipal General Raulino de Oliveira', 'Volta Redonda', '18230'),
('Luso-Brasileiro', 'Rio de Janeiro', '5994'),
('Arena MRV', 'Belo Horizonte', '44892'),
('Estádio Presidente Vargas', 'Fortaleza', '20600'),
('Kléber Andrade', 'Cariacica', '21152'),
('Arena Barueri', 'Barueri', '31452'),
('Arena BRB Mané Garrincha', 'Brasília', '72788'),
('Brinco de Ouro', 'Campinas', '18170'),
('Serra Dourada', 'Goiânia', '50049'),
('Heriberto Hulse', 'Criciúma', '19225'),
('Barradão', 'Salvador', '30793'),
('Pacaembu', 'São Paulo', '25000'),
('Orlando Scarpelli', 'Florianópolis', '19584'),
('Mangueirão', 'Belém', '53635'),
('Moisés Lucarelli', 'Campinas', '17728'),
('Pinheirão', 'Curitiba', '45000'),
('Anacleto Campanella', 'São Caetano do Sul', '16744'),
('Édson Passos', 'Mesquita', '13544'),
('Giulite Coutinho', 'Mesquita', '13544'),
('Santa Cruz', 'Ribeirão Preto', '29292'),
('Willie Davids', 'Maringá', '16226'),
('Municipal Juiz de Fora', 'Juiz de Fora', '31863'),
('Benedito Teixeira', 'São José do Rio Preto', '32168'),
('Estádio do Café', 'Londrina', '36056'),
('Batistão', 'Aracaju', '15575'),
('Ressacada', 'Florianópolis', '17800'),
('Pedro Pedrossian', 'Campo Grande', '44200'),
('Ipatingão', 'Ipatinga', '22500'),
('Caio Martins', 'Niterói', '12000'),
('Wilson de Barros', 'Mogi Mirim', '19900'),
('Mário Helênio', 'Juiz de Fora', '31863'),
('Bento Freitas', 'Pelotas', '18000'),
('Prudentão', 'Presidente Prudente', '45954'),
('Colosso da Lagoa', 'Erechim', '22000'),
('Bruno J Daniel', 'Santo André', '11440'),
('Boca do Jacaré', 'Taguatinga', '27000'),
('Serejão', 'Taguatinga', '27000'),
('Curuzu*(PF)', 'Belém', '16200'),
('Olímpico Regional', 'Cascavel', '45000'),
('Arruda', 'Recife', '60044'),
('Papa J.Paulo II (*PF)', 'Mogi Mirim', '19900'),
('Durival de Brito', 'Curitiba', '20000'),
('Machadão', 'Natal', '45000'),
('Ilha do Retiro', 'Recife', '26418'),
('Aflitos', 'Recife', '22856'),
('Engenheiro Araripe', 'Vitória', '7700'),
('Canindé', 'São Paulo', '21004'),
('Antônio Guimarães', 'Tombos', '6555'),
('Juscelino Kubitscheck', 'Itabira', '14445'),
('Bezerrão', 'Gama', '20310'),
('Eduardo José Farah', 'Presidente Prudente', '45954'),
('Luiz Lacerda', 'Caruaru', '19478'),
('Fonte Luminosa', 'Araraquara', '20000'),
('Cláudio Moacyr', 'Macaé', '15000'),
('Pituaçu', 'Salvador', '32157'),
('Morenão', 'Campo Grande', '44200'),
('Romildo Ferreira', 'Mogi Mirim', '19900'),
('Melão', 'Varginha', '15471'),
('Vila Olímpica', 'Goiânia', '45000'),
('Arena Joinville', 'Joinville', '22400'),
('Jóia da Princesa', 'Feira de Santana', '16274'),
('Arena Pernambuco', 'São Lourenço da Mata', '45440'),
('Estádio do Vale', 'Novo Hamburgo', '5196'),
('Romildão', 'Santa Maria', '19900'),
('Novelli Júnior', 'Itu', '18560'),
('Arena Condá', 'Chapecó', '20089'),
('Estádio Doutor Adhemar de Barros', 'Presidente Prudente', '20030'),
('Estádio Alberto Oliveira', 'Feira de Santana', '16274'),
('Estádio Paulo Constantino', 'Presidente Prudente', '45954'),
('Primeiro de Maio São Bernardo do Campo', 'São Bernardo do Campo', '15159'),
('Arena da Amazônia', 'Manaus', '44300'),
('Castelão de São Luís', 'São Luís', '40149'),
('Arena das Dunas', 'Natal', '31375'),
('Estádio Rei Pelé', 'Maceió', '19105'),
('Estádio Antônio Accioly', 'Goiânia', '12500'),
('Vila Capanema', 'Curitiba', '20083'),
('A Campanella*(PF)', 'São Caetano do Sul', '16744'),
('A.Campanella*(PF)', 'São Caetano do Sul', '16744'),
('Adelmar da Costa Carvalho', 'Recife', '26418'),
('Arena Fonte Nova', 'Salvador', '48092'),
('Arena da Baixada', 'Curitiba', '42372'),
('Arena de Pernambuco', 'São Lourenço da Mata', '45440'),
('Arena do Jacaré', 'Sete Lagoas', '20000'),
('Beira Rio', 'Porto Alegre', '50842'),
('Bruno J.Daniel (*PF)', 'Santo André', '11440'),
('Bruno José Daniel', 'Santo André', '11440'),
('Castelão', 'Fortaleza', '63903'),
('Castelão (CE)', 'Fortaleza', '63903'),
('Centenário (*PF)', 'Caxias do Sul', '22132'),
('Centenário (RS)', 'Caxias do Sul', '22132'),
('Centenário*(PF)', 'Caxias do Sul', '22132'),
('Couto Pereira*(PF)', 'Curitiba', '40502'),
('Durival de Brito (*PF)', 'Curitiba', '20000'),
('Engenhão', 'Rio de Janeiro', '44661'),
('Estádio Antônio Accioly - Atlético Goianiense', 'Goiânia', '12500'),
('Estádio Brinco de Ouro', 'Campinas', '18170'),
('Estádio Dr. Oswaldo Teixeira Duarte', 'São Paulo', '21004'),
('Estádio Francisco Stédile (Centenário)', 'Caxias do Sul', '22132'),
('Estádio Francisco Stédile | Centenário', 'Caxias do Sul', '22132'),
('Estádio Giulite Coutinho', 'Mesquita', '13544'),
('Estádio Heriberto Hülse', 'Criciúma', '19225'),
('Estádio Independência', 'Belo Horizonte', '23000'),
('Estádio Ipatingão', 'Ipatinga', '22500'),
('Estádio Joaquim Américo Guimarães', 'Curitiba', '42372'),
('Estádio José Pinheiro Borda', 'Porto Alegre', '50842'),
('Estádio Municipal Juscelino Kubitschek', 'Itabira', '14445'),
('Estádio Municipal Paulo Machado de Carvalho', 'São Paulo', '25000'),
('Estádio Nacional de Brasília', 'Brasília', '72788'),
('Estádio Olímpico Pedro Ludovico Teixeira', 'Goiânia', '13500'),
('Estádio Serra Dourada', 'Goiânia', '50049'),
('Estádio Vasco da Gama', 'Rio de Janeiro', '21880'),
('Estádio Willie Davids', 'Maringá', '16226'),
('Estádio da Serrinha', 'Goiânia', '14450'),
('Estádio de Pituaçu', 'Salvador', '32157'),
('Estádio do Arruda', 'Recife', '60044'),
('Estádio do Governo do Estado de Goiás (Serra Dourada)', 'Goiânia', '50049'),
('Fonte Nova', 'Salvador', '48092'),
('G Coutinho*(PF)', 'Mesquita', '13544'),
('Helenão', 'Juiz de Fora', '31863'),
('Independência', 'Belo Horizonte', '23000'),
('Independência (*PF)', 'Belo Horizonte', '23000'),
('Independência*(PF)', 'Belo Horizonte', '23000'),
('Juiz de Fora', 'Juiz de Fora', '31863'),
('Kyocera Arena', 'Curitiba', '42372'),
('Luso Brasileiro', 'Rio de Janeiro', '5994'),
('Luso Brasileiro*(PF)', 'Rio de Janeiro', '5994'),
('Mané Garrincha', 'Brasília', '72788'),
('Mj José Levi Sobrinho', 'Limeira', '18000'),
('Moacyrzão', 'Macaé', '15000'),
('MorumBIS', 'São Paulo', '66795'),
('Olímpico', 'Porto Alegre', '45000'),
('Olímpico Engenhão', 'Rio de Janeiro', '44661'),
('Pacaembu*(PF)', 'São Paulo', '25000'),
('Palestra Itália', 'São Paulo', '27650'),
('Parque Antártica', 'São Paulo', '27650'),
('Parque Antártica*(PF)', 'São Paulo', '27650'),
('Parque do Sabiá', 'Uberlândia', '52990'),
('Plácido Castelo', 'Fortaleza', '63903'),
('Pres Vargas*(PF)', 'Fortaleza', '20600'),
('Presidente Vargas', 'Fortaleza', '20600'),
('R de Oliveira*(PF)', 'Porto Alegre', '50842'),
('Raulino de Oliveira', 'Volta Redonda', '18230'),
('São Januário', 'Rio de Janeiro', '21880'),
('Teixeirão', 'São José do Rio Preto', '32168'),
('Vila Belmiro', 'Santos', '16068'),
('Vivaldo Lima', 'Manaus', '31000'),
('Wilson de Barros*(PF)', 'Mogi Mirim', '19900');

INSERT INTO administrador (c_email_adm, c_Pnome_adm, c_Unome_adm, c_senha_adm) VALUES ('adm@gmail.com','Arthur','Silva',123);