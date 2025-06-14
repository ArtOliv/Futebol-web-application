show databases;
use campeonato_futebol;

INSERT INTO time
(c_nome_time, c_cidade_time, c_tecnico_time)
VALUES
('Flamengo', 'Rio de Janeiro', 'Filipe Luís'),
('Palmeiras', 'São Paulo', 'Abel Ferreira'),
('São Paulo', 'São Paulo', 'Luis Zubeldía'),
('Corinthians', 'São Paulo', 'Dorival Júnior'),
('Santos', 'Santos', 'Cléber Xavier'),
('Cruzeiro', 'Belo Horizonte', 'Leonardo Jardim'),
('Atlético', 'Belo Horizonte', 'Cuca'),
('Fluminense', 'Rio de Janeiro', 'Renato Gaúcho'),
('Vasco', 'Rio de Janeiro', 'Fernando Diniz'),
('Botafogo', 'Rio de Janeiro', 'Renato Paiva '),
('Grêmio', 'Porto Alegre', 'Mano Menezes'),
('Internacional', 'Porto Alegre', 'Roger Machado'),
('Bahia', 'Bahia', 'Rogério Ceni'),
('Ceará FC', 'Ceará', 'Léo Condé'),
('Mirassol', 'Mirassol', 'Rafael Guanaes'),
('Fortaleza', 'Fortaleza', 'Juan Pablo Vojvoda'),
('Juventude', 'Caxias do Sul', 'Claudio Tencati'),
('Sport Recife', 'Recife', 'Antônio Oliveira'),
('EC Vitória', 'Vitória', 'Thiago Carpini'),
('Bragantino', 'Bragança Paulista', 'Fernando Seabra');


INSERT INTO estadio
(c_nome_estadio, c_cidade_estadio, n_capacidade)
VALUES
('Maracanã','Rio de Janeiro','78838'),
('Mané Garrincha','Brasília','72788'),
('MorumBIS','São Paulo','72039'),
('Castelão','Fortaleza','63903'),
('Mineirão','Belo Horizonte','61846'),
('Arruda','Recife','60044'),
('Arena do Grêmio','Porto Alegre','55662'),
('Mangueirão','Belém','53645'),
('Beira-Rio','Porto Alegre','50942'),
('Arena Fonte Nova','Salvador','50025'),
('Neo Química Arena','São Paulo','48905'),
('Nilton Santos','Rio de Janeiro','46831'),
('Arena de Pernambuco','São Lourenço da Mata','46154'),
('Prudentão','Presidente Prudente','45954'),
('Arena MRV','Belo Horizonte','44892'),
('Albertão','Teresina','44200'),
('Morenão','Campo Grande','44200'),
('Arena Pantanal','Cuiabá','44097'),
('Arena da Amazônia','Manaus','44000'),
('Allianz Parque','São Paulo','43713'),
('Ligga Arena','Curitiba','42372'),
('Serra Dourada','Goiânia','42000'),
('Couto Pereira','Curitiba','40502'),
('Parque do Sabiá','Uberlândia','39990'),
('Barradão','Salvador','35000'),
('Pinheirão','Curitiba','35000'),
('Olímpico da USP','São Paulo','35000'),
('Teixeirão','São José do Rio Preto','32168'),
('Pituaçu','Salvador','32157'),
('Arena das Dunas','Natal','32050'),
('Helenão','Juiz de Fora','31863'),
('Arena Barueri','Barueri','31452'),
('Estádio do Café','Londrina','30000'),
('Douradão','Dourado',' 30000'),
('Brinco de Ouro','Campinas','29130'),
('Santa Cruz','Ribeirão Preto','28946'),
('Boca do Jacaré','Taguatinga','27000'),
('Ilha do Retiro','Recife','26418'),
('Irmão Gino Maria Rossi','Pouso Alegre','26000'),
('Pacaembu','São Paulo','25900'),
('Almeidão','João Pessoa','25770'),
('Amigão','Campina Grande','25770'),
('Regional Jacy Miguel Scanagatta','Cascavel','25000'),
('São Januário','Rio de Janeiro','24584'),
('Independência','Belo Horizonte','23018'),
('Ipatingão','Ipatinga','22500'),
('Arena Joinville','Joinville','22400'),
('Centenário','Caxias do Sul','22132'),
('Colosso da Lagoa','Erechim','22000'),
('Antônio Otoni Filho','Guará','22000');

select * from estadio;

select * from time