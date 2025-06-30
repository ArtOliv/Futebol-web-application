from collections import defaultdict
from datetime import datetime
from src.models.partida.partida_model import Partida, Gol, Cartao, Estadio
from src.models.jogador.jogador_model import Jogador
from src.constant.cartao_enum import CartaoEnum

def parse_partidas(rows):
    partidas_dict = defaultdict(lambda: {
        "gols": [],
        "cartoes": [],
    })

    for row in rows:
        # Chave única por data e times
        chave = (
            row["dt_data_horario"],
            row["c_time_casa"],
            row["c_time_visitante"]
        )
        partida_data = partidas_dict[chave]
        partida_data['id_partida'] = row["id_jogo"]
        partida_data['n_rodada'] = row["n_rodada"]
        # Atribuir dados da partida só uma vez
        if "time_casa" not in partida_data:
            partida_data.update({
                "n_placar_casa": row["n_placar_casa"],
                "n_placar_visitante": row["n_placar_visitante"],
                "time_casa": row["c_time_casa"],
                "time_visitante": row["c_time_visitante"],
                "dt_data_horario": row["dt_data_horario"],
                "c_status": row["c_status"],
                "estadio": Estadio(
                    c_nome_estadio=row["c_nome_estadio"],
                    c_cidade_estadio=row["c_cidade_estadio"],
                    n_capacidade=row["n_capacidade"]
                )
            })

        # Gol (se houver)
        if row.get("minuto_gol") is not None:
            jogador_gol = Jogador(
                id_jogador=row["id_jogador_gol"],
                c_Pnome_jogador=row["nome_jogador_gol"],
                c_Unome_jogador=row["sobrenome_jogador_gol"]
            )
            gol = Gol(
                n_minuto_gol=row["minuto_gol"],
                jogador=jogador_gol
            )
            partida_data["gols"].append(gol)

        # Cartão (se houver)
        if row.get("tipo_cartao") is not None and row.get("n_minuto_cartao") is not None:
            jogador_cartao = Jogador(
                id_jogador=row["id_jogador_cartao"],
                c_Pnome_jogador=row["nome_jogador_cartao"],
                c_Unome_jogador=row["sobrenome_jogador_cartao"]
            )
            cartao = Cartao(
                e_tipo= CartaoEnum.AMARELO if row["tipo_cartao"] == 'amarelo' else CartaoEnum.VERMELHO,
                n_minuto_cartao=row["n_minuto_cartao"],
                jogador=jogador_cartao
            )
            partida_data["cartoes"].append(cartao)

    # Criar objetos Partida
    partidas = []
    for dados in partidas_dict.values():
        partidas.append(Partida(**dados))

    return partidas
