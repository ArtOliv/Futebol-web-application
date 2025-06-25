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
    n_rodada INT,
    n_placar_casa INT default 0 CHECK (n_placar_casa >= 0),
    n_placar_visitante INT default 0 CHECK (n_placar_visitante >= 0),
    c_nome_campeonato VARCHAR(100) not null,
    d_ano_campeonato YEAR not null,
    c_nome_estadio VARCHAR(100),
    c_time_casa VARCHAR(100),
    c_time_visitante VARCHAR(100),
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
    n_minuto_cartao INT not null CHECK (n_minuto_cartao>=0 AND n_minuto_cartao<=90),
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
CREATE TRIGGER inserir_jogo_na_tabela
AFTER INSERT ON JOGO
FOR EACH ROW
BEGIN
	UPDATE classificacao
    SET
        n_vitorias = n_vitorias + CASE WHEN NEW.n_placar_casa > NEW.n_placar_visitante THEN 1 ELSE 0 END,
        n_derrotas = n_derrotas + CASE WHEN NEW.n_placar_casa < NEW.n_placar_visitante THEN 1 ELSE 0 END,
        n_empates = n_empates + CASE WHEN NEW.n_placar_casa = NEW.n_placar_visitante THEN 1 ELSE 0 END,
        n_gols_pro = n_gols_pro + NEW.n_placar_casa,
        n_gols_contra = n_gols_contra + NEW.n_placar_visitante
    WHERE c_nome_time = NEW.c_time_casa;
	
	UPDATE classificacao
    SET 
		n_vitorias = n_vitorias + CASE WHEN NEW.n_placar_casa < NEW.n_placar_visitante THEN 1 ELSE 0 END,
        n_derrotas = n_derrotas + CASE WHEN NEW.n_placar_casa > NEW.n_placar_visitante THEN 1 ELSE 0 END,
        n_empates = n_empates + CASE WHEN NEW.n_placar_casa = NEW.n_placar_visitante THEN 1 ELSE 0 END,
		n_gols_pro = n_gols_pro + NEW.n_placar_visitante,
        n_gols_contra = n_gols_contra + NEW.n_placar_casa
	WHERE
		c_nome_time = NEW.c_time_visitante;
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
CREATE TRIGGER evitar_gol_duplicado
BEFORE INSERT ON Gol
FOR EACH ROW
BEGIN
  DECLARE ja_tem INT;
  SELECT COUNT(*) INTO ja_tem FROM Gol
  WHERE id_jogo = NEW.id_jogo
    AND id_jogador = NEW.id_jogador
    AND n_minuto_gol = NEW.n_minuto_gol;

  IF ja_tem > 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Gol já registrado para esse minuto.';
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
('Brasileirão 2023', 2023);

INSERT INTO time_participa_campeonato
(c_nome_time,c_nome_campeonato,d_ano_campeonato)
VALUES
('Palmeiras', 'Brasileirão 2023', 2023),
('Gremio', 'Brasileirão 2023', 2023),
('Atletico-MG', 'Brasileirão 2023', 2023),
('Flamengo', 'Brasileirão 2023', 2023),
('Botafogo-RJ', 'Brasileirão 2023', 2023),
('Bragantino', 'Brasileirão 2023', 2023),
('Fluminense', 'Brasileirão 2023', 2023),
('Athletico-PR', 'Brasileirão 2023', 2023),
('Internacional', 'Brasileirão 2023', 2023),
('Fortaleza', 'Brasileirão 2023', 2023),
('Sao Paulo', 'Brasileirão 2023', 2023),
('Cuiaba', 'Brasileirão 2023', 2023),
('Corinthians', 'Brasileirão 2023', 2023),
('Cruzeiro', 'Brasileirão 2023', 2023),
('Vasco', 'Brasileirão 2023', 2023),
('Bahia', 'Brasileirão 2023', 2023),
('Santos', 'Brasileirão 2023', 2023),
('Goias', 'Brasileirão 2023', 2023),
('Coritiba', 'Brasileirão 2023', 2023),
('America-MG', 'Brasileirão 2023', 2023);

insert into estadio
(c_nome_estadio,c_cidade_estadio,n_capacidade)
VALUES
('Allianz Parque','São Paulo','45000'),
('Estádio Raimundo Sampaio','Belo Horizonte','45000'),
('Nabizão','Bragança Paulista','45000'),
('Ligga Arena','Curitiba','45000'),
('Arena Castelão','Fortaleza','45000'),
('Estádio Nilton Santos','Rio de Janeiro','45000'),
('Mineirão',' Belo Horizonte','45000'),
('Maracanã',' Rio de Janeiro','45000'),
('Neo Química Arena','São Paulo','45000'),
('Alfredo Jaconi','Caxias do Sul','45000'),
('Arena Pantanal','Cuiabá','45000'),
('Morumbi',' São Paulo','45000'),
('Estádio Beira-Rio','Porto Alegre','45000'),
('Estádio Urbano Caldeira','Santos','45000'),
('Couto Pereira','Curitiba','45000'),
('Estádio Hailé Pinheiro - Serrinha','Goiânia','45000'),
('Itaipava Arena Fonte Nova','Salvador','45000'),
('Estádio São Januário','Rio de Janeiro','45000'),
('Arena do Grêmio','Porto Alegre','45000'),
('Estádio Joaquim Henrique Nogueira-Arena do jacaré','Sete Lagoas','45000'),
('Estádio Municipal Parque do Sabiá','Uberlândia','45000'),
('Estádio Municipal General Raulino de Oliveira','Volta Redonda','45000'),
('Luso-Brasileiro','Rio de Janeiro','45000'),
('Arena MRV','Belo Horizonte','45000'),
('Estádio Presidente Vargas','Fortaleza','45000'),
('Kléber Andrade','Cariacica','45000'),
('Arena Barueri','Barueri','45000'),
('Arena BRB Mané Garrincha','Brasília','45000'),
('Brinco de Ouro', 'Campinas', 45000),
('Serra Dourada', 'Goiânia', 45000),
('Heriberto Hulse', 'Criciúma', 45000),
('Barradão', 'Salvador', 45000),
('Pacaembu', 'São Paulo', 45000),
('Orlando Scarpelli', 'Florianópolis', 45000),
('Mangueirão', 'Belém', 45000),
('Moisés Lucarelli', 'Campinas', 45000),
('Pinheirão', 'Curitiba', 45000),
('Anacleto Campanella', 'São Caetano do Sul', 45000),
('Édson Passos', 'Mesquita', 45000),
('Giulite Coutinho', 'Mesquita', 45000),
('Santa Cruz', 'Ribeirão Preto', 45000),
('Willie Davids', 'Maringá', 45000),
('Municipal Juiz de Fora', 'Juiz de Fora', 45000),
('Benedito Teixeira', 'São José do Rio Preto', 45000),
('Estádio do Café', 'Londrina', 45000),
('Batistão', 'Aracaju', 45000),
('Ressacada', 'Florianópolis', 45000),
('Pedro Pedrossian', 'Campo Grande', 45000),
('Ipatingão', 'Ipatinga', 45000),
('Caio Martins', 'Niterói', 45000),
('Wilson de Barros', 'Taubaté', 45000),
('Mário Helênio', 'Juiz de Fora', 45000),
('Bento Freitas', 'Pelotas', 45000),
('Prudentão', 'Presidente Prudente', 45000),
('Colosso da Lagoa', 'Erechim', 45000),
('Bruno J Daniel', 'Santo André', 45000),
('Boca do Jacaré', 'Taguatinga', 45000),
('Serejão', 'Taguatinga', 45000),
('Curuzu*(PF)', 'Belém', 45000),
('Olímpico Regional', 'Cascavel', 45000),
('Arruda', 'Recife', 45000),
('Papa J.Paulo II (*PF)', 'Mogi Mirim', 45000),
('Durival de Brito', 'Curitiba', 45000),
('Machadão', 'Natal', 45000),
('Ilha do Retiro', 'Recife', 45000),
('Aflitos', 'Recife', 45000),
('Engenheiro Araripe', 'Vitória', 45000),
('Canindé', 'São Paulo', 45000),
('Antônio Guimarães', 'Rio Grande', 45000),
('Juscelino Kubitscheck', 'Itabira', 45000),
('Bezerrão', 'Gama', 45000),
('Eduardo José Farah', 'Presidente Prudente', 45000),
('Luiz Lacerda', 'Caruaru', 45000),
('Fonte Luminosa', 'Araraquara', 45000),
('Cláudio Moacyr', 'Macaé', 45000),
('Pituaçu', 'Salvador', 45000),
('Morenão', 'Campo Grande', 45000),
('Romildo Ferreira', 'Mogi Mirim', 45000),
('Melão', 'Varginha', 45000),
('Vila Olímpica', 'Goiânia', 45000),
('Arena Joinville', 'Joinville', 45000),
('Jóia da Princesa', 'Feira de Santana', 45000),
('Arena Pernambuco', 'São Lourenço da Mata', 45000),
('Estádio do Vale', 'Novo Hamburgo', 45000),
('Romildão', 'Santa Maria', 45000),
('Novelli Júnior', 'Itu', 45000),
('Arena Condá', 'Chapecó', 45000),
('Estádio Doutor Adhemar de Barros', 'Presidente Prudente', 45000),
('Estádio Alberto Oliveira', 'Feira de Santana', 45000),
('Estádio Paulo Constantino', 'Presidente Prudente', 45000),
('Primeiro de Maio São Bernardo do Campo', 'São Bernardo do Campo', 45000),
('Arena da Amazônia', 'Manaus', 45000),
('Castelão de São Luís', 'São Luís', 45000),
('Arena das Dunas', 'Natal', 45000),
('Estádio Rei Pelé', 'Maceió', 45000),
('Estádio Antônio Accioly', 'Goiânia', 45000),
('Vila Capanema','Curitiba','45000');