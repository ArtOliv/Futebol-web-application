
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
    c_Pnome_jogador VARCHAR(100),
    c_Unome_jogador VARCHAR(100),
    n_camisa INT CHECK (n_camisa >= 0 AND n_camisa < 100),
    d_data_nascimento DATE not null,
    c_posicao VARCHAR(100),
    n_altura DECIMAL(4,2) not null CHECK (n_altura > 0 AND n_altura < 3),
    n_peso DECIMAL(5,2) not null CHECK (n_peso > 0 AND n_peso < 200),
    c_nome_time VARCHAR(100),
    primary key (c_PNome_jogador,c_Unome_jogador, n_camisa),
    constraint fk_time_jogador foreign key (c_nome_time) references Time(c_nome_time)
        ON DELETE SET NULL ON UPDATE CASCADE);
    
create table if not exists Estadio(
    c_nome_estadio VARCHAR(100) primary key,
    c_cidade_estadio VARCHAR(100),
    n_capacidade INT);
    
create table if not exists Jogo(
    id_jogo INT auto_increment primary key,
    dt_data_horario DATETIME not null,
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
    n_minuto_gol INT not null CHECK (n_minuto_gol>=0 AND n_minuto_gol<=90),
    id_jogo INT not null,
    c_Pnome_jogador VARCHAR(100),
    c_Unome_jogador VARCHAR(100),
    n_camisa INT,
    primary key (id_gol, id_jogo),
    constraint fk_jogo_gol foreign key (id_jogo) references Jogo(id_jogo)
       ON UPDATE CASCADE,
    constraint fk_jogador_gol foreign key (c_Pnome_jogador,c_Unome_jogador, n_camisa) references Jogador(c_Pnome_jogador,c_Unome_jogador, n_camisa)
       ON DELETE SET NULL ON UPDATE CASCADE);

create table if not exists Cartao(
    id_cartao INT auto_increment,
    e_tipo ENUM('amarelo', 'vermelho') not null,
    n_minuto_cartao INT not null CHECK (n_minuto_cartao>=0 AND n_minuto_cartao<=90),
    id_jogo INT not null,
    c_Pnome_jogador VARCHAR(100),
    c_Unome_jogador VARCHAR(100),
    n_camisa INT,
    primary key (id_cartao, id_jogo),
    constraint fk_jogo_cartao foreign key (id_jogo) references Jogo(id_jogo)
            ON DELETE CASCADE ON UPDATE CASCADE,
    constraint fk_jogador_cartao foreign key (c_Pnome_jogador,c_Unome_jogador, n_camisa) references Jogador(c_Pnome_jogador,c_Unome_jogador, n_camisa)
            ON DELETE SET NULL ON UPDATE CASCADE);
    
create table if not exists Classificacao(
    c_nome_campeonato VARCHAR(100) not null,
    d_ano_campeonato YEAR not null,
    c_nome_time VARCHAR(100) not null,
    n_pontos INT default 0 generated always as (3*n_vitorias + n_empates) stored,
    n_jogos INT generated always as (n_vitorias + n_empates + n_derrotas) stored,
    n_vitorias INT default 0,
    n_empates INT default 0,
    n_derrotas INT default 0,
    n_gols_pro INT default 0,
    n_gols_contra INT default 0,
    n_saldo_gols INT generated always as (n_gols_pro - n_gols_contra) stored,
    primary key (c_nome_campeonato,d_ano_campeonato, c_nome_time),
    constraint fk_time_classificacao foreign key (c_nome_time) references Time(c_nome_time)
            ON UPDATE CASCADE,
    constraint fk_campeonato_classificacao foreign key (c_nome_campeonato,d_ano_campeonato) references Campeonato(c_nome_campeonato,d_ano_campeonato)
            ON UPDATE CASCADE);


CREATE OR REPLACE TRIGGER Tg_Cartao_DoisAmarelos
    AFTER INSERT ON Cartao
    FOR EACH ROW
    BEGIN
        DECLARE total_amarelos INT;
        DECLARE ja_tem_vermelho INT;

        IF NEW.e_tipo = 'amarelo' THEN
            SELECT COUNT(*)
            INTO total_amarelos
            FROM Cartao
            WHERE id_jogo = NEW.id_jogo
                AND c_Pnome_jogador = NEW.c_Pnome_jogador
                AND c_Unome_jogador = NEW.c_Unome_jogador
                AND n_camisa = NEW.n_camisa
                AND e_tipo = 'amarelo';

            SELECT COUNT(*)
            INTO ja_tem_vermelho
            FROM Cartao
            WHERE id_jogo = NEW.id_jogo
                AND c_Pnome_jogador = NEW.c_Pnome_jogador
                AND c_Unome_jogador = NEW.c_Unome_jogador
                AND n_camisa = NEW.n_camisa
                AND e_tipo = 'vermelho';

            IF total_amarelos = 2 AND ja_tem_vermelho = 0 THEN
                INSERT INTO Cartao (e_tipo, n_minuto_cartao, id_jogo, c_Pnome_jogador, c_Unome_jogador, n_camisa)
                VALUES ('vermelho', NEW.n_minuto_cartao, NEW.id_jogo, NEW.c_Pnome_jogador, NEW.c_Unome_jogador, NEW.n_camisa);
            END IF;
        END IF;
    END;