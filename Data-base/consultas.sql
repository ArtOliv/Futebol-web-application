select * from gol;
select * from jogo;
select * from jogador;
select * from classificacao;

SELECT *
FROM jogador
WHERE id_jogador = 3842;

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
WHERE c_Pnome_jogador = 'Gabriel' AND c_nome_time = 'FLAMENGO';

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