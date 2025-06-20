from datetime import date

from src.constant.cartao_enum import CartaoEnum
from src.constant.posicao_enum import Posicao
from src.models.cartao.cartao_model import Cartao
from src.models.classificacao.classific_model import Classificacao
from src.models.estadio.estadio_model import Estadio
from src.models.jogador.jogador_model import Jogador
from src.models.partida.partida_model import Partida
from src.models.time.time_model import Time

jogador = Jogador()
jogador.nome = "Rafael Blom"
jogador.n_peso = 76
jogador.n_altura = 1.73
jogador.n_camisa = 10
jogador.c_posicao = Posicao.ATACANTE
jogador.d_data_nascimento = date(1816, 1, 9)
#
# cartao = Cartao()
# cartao.jogador = jogador
# cartao.tipo = CartaoEnum.AMARELO
# cartao.minuto = 94
#
# jogador.cartoes = [cartao]
#
# time1 = Time()
# time1.nome = "Discípulos do Rafael Blom"
# time1.cidade = "São João del-Rei"
# time1.tecnico = "Rafael Blom"
# time1.jogadores = [jogador]
#
# classificacao = Classificacao()
# classificacao.pontos = 100
# classificacao.empates = 0
# classificacao.gols_pro = 8000
# classificacao.derrotas = 0
# classificacao.vitorias = 1000
#
# time1.classificacao = classificacao
#
# partida = Partida()
# partida.cartoes = []
# partida.gols = []
# partida.time_casa = time1
#
# time2 = Time()
# time2.nome = "Odiadores do Rafael Blom"
#
# partida.time_visitante = time2
# partida.placar_casa = 7
# partida.placar_visitante = 1
#
# estadio = Estadio()
# estadio.cidade = "Nova Lima"
# estadio.nome = "Casa do Rafael Blom"
# estadio.capacidade = 100000
#
# partida.estadio = estadio

if __name__ == '__main__':
    print(jogador.nome)
    # print(partida.cartoes)
    # print(partida.gols)
    # print(partida.time_casa.nome)
    # print(partida.placar_casa)
    # print(partida.time_visitante.nome)
    # print(partida.placar_visitante)
    # print(partida.estadio.nome)
    # print(partida.time_casa.classificacao.pontos)
    # print(partida.time_casa.classificacao.vitorias)