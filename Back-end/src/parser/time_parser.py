from collections import defaultdict

from src.constant.posicao_enum import Posicao
from src.models.cartao.cartao_model import Cartao
from src.models.classificacao.classific_model import Classificacao
from src.models.jogador.jogador_model import Jogador
from src.models.time.time_model import Time
from decimal import Decimal
from src.constant.cartao_enum import CartaoEnum

def parse_time(rows):
    if not rows:
        return None

    first_row = rows[0]
    jogadores_dict = defaultdict(lambda: {
        'cartoes': [],
    })

    for row in rows:
        jogador_key = (row['c_Pnome_jogador'], row['c_Unome_jogador'], row['n_camisa'])
        jogador_data = jogadores_dict[jogador_key]

        if 'c_posicao' not in jogador_data:
            jogador_data.update({
                'id_jogador': row['id_jogador'],
                'c_Pnome_jogador': row['c_Pnome_jogador'],
                'c_Unome_jogador': row['c_Unome_jogador'],
                'n_camisa': row['n_camisa'],
                'c_posicao': Posicao[row['c_posicao'].split('.')[-1]],
                'd_data_nascimento': row['d_data_nascimento'],
                'n_altura': float(row['n_altura']),
                'n_peso': float(row['n_peso']),
            })

        if row['e_tipo'] and row['n_minuto_cartao'] is not None:
            jogador_data['cartoes'].append(
                Cartao(e_tipo=row['e_tipo'], n_minuto_cartao=row['n_minuto_cartao'])
            )

    jogadores = [Jogador(**data) for data in jogadores_dict.values()]

    classificacao = Classificacao(
        n_pontos=first_row.get('n_pontos'),
        n_vitorias=first_row.get('n_vitorias'),
        n_empates=first_row.get('n_empates'),
        n_derrotas=first_row.get('n_derrotas'),
        n_gols_pro=first_row.get('n_gols_pro'),
        n_gols_contra=first_row.get('n_gols_contra'),
    )

    time = Time(
        c_nome_time=first_row['c_nome_time'],
        c_cidade_time=first_row['c_cidade_time'],
        c_tecnico_time=first_row['c_tecnico_time'],
        classificacao=classificacao,
        jogadores=jogadores
    )

    return time

def parse_list_times(rows):
    times_dict = {}

    for row in rows:
        nome_time = row["c_nome_time"]

        # Se o time ainda não foi criado
        if nome_time not in times_dict:
            times_dict[nome_time] = {
                "c_nome_time": nome_time,
                "c_cidade_time": row["c_cidade_time"],
                "c_tecnico_time": row["c_tecnico_time"],
                "classificacao": Classificacao(
                    n_pontos=row["n_pontos"],
                    n_jogos=row["n_jogos"],
                    n_vitorias=row["n_vitorias"],
                    n_empates=row["n_empates"],
                    n_derrotas=row["n_derrotas"],
                    n_gols_pro=row["n_gols_pro"],
                    n_gols_contra=row["n_gols_contra"],
                    n_saldo_gols=row["n_saldo_gols"],
                ),
                "jogadores_dict": {},  # usamos dict para evitar duplicatas
            }

        time_data = times_dict[nome_time]

        # Chave única para o jogador (melhor usar id_jogador, mas vamos de nome + camisa)
        jogador_key = row['id_jogador']

        # Se o jogador ainda não foi adicionado
        if jogador_key not in time_data["jogadores_dict"]:
            time_data["jogadores_dict"][jogador_key] = {
                "id_jogador": row['id_jogador'],
                "c_Pnome_jogador": row["c_Pnome_jogador"],
                "c_Unome_jogador": row["c_Unome_jogador"],
                "n_camisa": row["n_camisa"],
                "d_data_nascimento": row["d_data_nascimento"],
                "c_posicao": Posicao[row["c_posicao"].split(".")[-1]] if row["c_posicao"] else None,
                "cartoes": []
            }

        # Se houver cartão, adiciona
        if row["e_tipo"] is not None:
            time_data["jogadores_dict"][jogador_key]["cartoes"].append(
                Cartao(
                    e_tipo= CartaoEnum.AMARELO if row["e_tipo"] == 'amarelo' else CartaoEnum.VERMELHO,
                    n_minuto_cartao=row["n_minuto_cartao"]
                )
            )

    # Monta a lista final de objetos Time
    result = []
    for time_dict in times_dict.values():
        jogadores = [Jogador(**j) for j in time_dict["jogadores_dict"].values()]
        time = Time(
            c_nome_time=time_dict["c_nome_time"],
            c_cidade_time=time_dict["c_cidade_time"],
            c_tecnico_time=time_dict["c_tecnico_time"],
            classificacao=time_dict["classificacao"],
            jogadores=jogadores
        )
        result.append(time)

    return result

