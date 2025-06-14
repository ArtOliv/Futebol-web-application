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
AFTER INSERT ON GOL
FOR EACH ROW
BEGIN
	DECLARE time_fez_gol varchar(100);
	SELECT c_nome_time INTO time_fez_gol
	FROM jogador
	WHERE c_Pnome_jogador = NEW.c_Pnome_jogador AND 
		  c_Unome_jogador = NEW.c_Unome_jogador AND
		  n_camisa = NEW.n_camisa;
    
	UPDATE jogo
    SET
		n_placar_casa = n_placar_casa + CASE WHEN time_fez_gol = c_time_casa THEN 1 ELSE 0 END,
        n_placar_visitante = n_placar_visitante + CASE WHEN time_fez_gol = c_time_vistante THEN 1 ELSE 0 END
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
BEFORE INSERT on cartao
FOR EACH ROW
BEGIN
	DECLARE num_cartao int;
    IF NEW.e_tipo = 'amarelo' THEN
		SELECT COUNT(*) INTO num_cartao
		FROM cartao
		WHERE NEW.id_jogo = id_jogo AND
			  NEW.c_Pnome_jogador = c_Pnome_jogador AND
			  NEW.c_Unome_jogador = c_Unome_jogador AND
			  NEW.n_camisa = n_camisa AND
			  e_tipo = 'amarelo';
		
        IF num_cartao >= 1 THEN
			SET NEW.e_tipo = 'vermelho';
		END IF;
	END IF;
END $$
