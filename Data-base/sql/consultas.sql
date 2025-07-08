select * from gol;
select * from jogo;
select * from jogador;
select * from classificacao;
select * from estadio;
select * from time;
select * from cartao;
select * from campeonato;

SELECT *
FROM jogador
WHERE id_jogador = 957;

SELECT * 
FROM jogo
WHERE id_jogo=1;

SELECT *
FROM jogador
WHERE c_nome_time = 'Palmeiras';

SELECT *
FROM jogador
WHERE c_nome_time = 'Corinthians';

SELECT *
FROM jogador
WHERE c_nome_time = 'Flamengo';

SELECT *
FROM jogador
WHERE c_Pnome_jogador = 'Wesley' AND c_nome_time = 'FLAMENGO';

SELECT *
FROM jogador
WHERE c_Pnome_jogador = 'Gabriel' AND c_Unome_jogador = 'Barbosa';

SELECT *
FROM jogador
WHERE c_Pnome_jogador = 'Gabriel' AND c_nome_time = 'SANTOS';

SELECT *
FROM jogador
WHERE c_Unome_jogador = 'Arrascaeta' AND c_nome_time = 'FLAMENGO';

SELECT COUNT(*)
FROM jogador
WHERE c_posicao = 'ZAGUEIRO';

SELECT COUNT(*)
FROM jogador
WHERE c_posicao = 'ATACANTE';

SELECT COUNT(*)
FROM jogador
WHERE c_posicao = 'MEIO-CAMPO';

SET SQL_SAFE_UPDATES = 0;
UPDATE Jogo
SET c_status = 'Finalizado'
WHERE dt_data_horario < NOW() AND c_status <> 'Finalizado';