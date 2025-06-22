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
AFTER INSERT ON campeonato
FOR EACH ROW
BEGIN
	insert into classificacao
    (c_nome_campeonato, d_ano_campeonato, c_nome_time, n_pontos, n_vitorias, n_empates, n_derrotas, n_gols_pro, n_gols_contra)
    SELECT 
		NEW.c_nome_campeonato,
        NEW.d_ano_campeonato,
        t.c_nome_time,
        0,
        0,
        0,
        0,
        0,
        0
	FROM
		`time` t;
        
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
CREATE TRIGGER verificar_time_jogador
BEFORE INSERT ON Jogador
FOR EACH ROW
BEGIN
  DECLARE ja_participa INT;
  SELECT COUNT(*) INTO ja_participa
  FROM Jogador j
  JOIN Time_participa_campeonato tpc ON j.c_nome_time = tpc.c_nome_time
  WHERE NEW.c_Pnome_jogador = j.c_Pnome_jogador
    AND NEW.c_Unome_jogador = j.c_Unome_jogador
    AND NEW.n_camisa = j.n_camisa;

  IF ja_participa > 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Jogador já participa de um time nesse campeonato.';
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
CREATE TRIGGER limitar_jogadores_por_time
BEFORE INSERT ON Jogador
FOR EACH ROW
BEGIN
  DECLARE total INT;
  SELECT COUNT(*) INTO total FROM Jogador WHERE c_nome_time = NEW.c_nome_time;
  IF total >= 11 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Time já possui 11 jogadores.';
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
    AND c_Pnome_jogador = NEW.c_Pnome_jogador
    AND c_Unome_jogador = NEW.c_Unome_jogador
    AND n_camisa = NEW.n_camisa
    AND n_minuto_gol = NEW.n_minuto_gol;

  IF ja_tem > 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Gol já registrado para esse minuto.';
  END IF;
END$$
DELIMITER ;
