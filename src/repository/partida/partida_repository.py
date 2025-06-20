import pymysql
from src.models.partida.partida_model import Partida
from src.parser.partida_parser import parse_partidas


def get_all_ordered_partida(nome_campeonato: str, ano_campeonato: int):
    conn = pymysql.connect(
        host="localhost",
        user="root",
        port=3308,
        password="root",
        database="meu_banco",
        cursorclass=pymysql.cursors.DictCursor
    )
    try:
        with conn.cursor() as cursor:
            query = ("SELECT "
                        "p.id_jogo, "
                        "p.dt_data_horario,"
                        "p.n_placar_casa, "
                        "p.n_placar_visitante, "
                        "p.c_time_casa, "
                        "p.c_time_visitante, "
                     
                        "e.c_nome_estadio, "
                        "e.c_cidade_estadio, "
                        "e.n_capacidade, "
                     
                        "g.n_minuto_gol AS minuto_gol, "
                        "jg.id_jogador AS id_jogador_gol, "
                        "jg.c_Pnome_jogador AS nome_jogador_gol, "
                        "jg.c_Unome_jogador AS sobrenome_jogador_gol, "
                     
                        "c.e_tipo AS tipo_cartao, "
                        "c.n_minuto_cartao, "
                        "jc.id_jogador AS id_jogador_cartao, "
                        "jc.c_Pnome_jogador AS nome_jogador_cartao, "
                        "jc.c_Unome_jogador AS sobrenome_jogador_cartao "
                     "FROM "
                        "Jogo as p "
                     "JOIN "
                        "Estadio as e "
                        "ON e.c_nome_estadio = p.c_nome_estadio "
                     "LEFT JOIN "
                        "Gol as g "
                        "ON g.id_jogo = p.id_jogo "
                     "LEFT JOIN "
                        "Jogador as jg "
                        "ON jg.id_jogador = g.id_jogador "
                     "LEFT JOIN "
                        "Cartao as c "
                        "ON c.id_jogo = p.id_jogo "
                     "LEFT JOIN "
                        "Jogador as jc "
                        "ON jc.id_jogador = c.id_jogador "
                     "WHERE "
                        "p.c_nome_campeonato = %s AND p.d_ano_campeonato = %s "
                     "ORDER BY dt_data_horario DESC;")
            cursor.execute(query, (nome_campeonato, ano_campeonato))
            result = cursor.fetchall()
    finally:
        conn.close()
    result = parse_partidas(result)
    return result


def insert_partida(partida: Partida, nome_campeonato: str, ano_campeonato: int):
    conn = pymysql.connect(
        host="localhost",
        user="root",
        port=3308,
        password="root",
        database="meu_banco",
    )
    try:
        with conn.cursor() as cursor:
            query = ("INSERT IGNORE INTO "
                        "Estadio (c_nome_estadio, c_cidade_estadio, n_capacidade) "
                     "VALUES (%s, %s, %s) ")
            cursor.execute(query, (partida.estadio.c_nome_estadio,
                                   partida.estadio.c_cidade_estadio,
                                   partida.estadio.n_capacidade))

            query = ("INSERT INTO "
                        "Jogo ("
                            "dt_data_horario, "
                            "c_nome_campeonato, "
                            "d_ano_campeonato, "
                            "c_nome_estadio, "
                            "c_time_casa, "
                            "c_time_visitante, "
                            "n_placar_casa, "
                            "n_placar_visitante )"
                     "VALUES (%s, %s, %s, %s, %s, %s, %s, %s);")
            cursor.execute(query, (partida.dt_data_horario,
                                   nome_campeonato,
                                   ano_campeonato,
                                   partida.estadio.c_nome_estadio,
                                   partida.time_casa,
                                   partida.time_visitante,
                                   partida.n_placar_casa,
                                   partida.n_placar_visitante))
            id_partida = cursor.lastrowid
            if partida.gols:
                query = ("INSERT INTO "
                         "Gol (n_minuto_gol, id_jogo, id_jogador) "
                         "VALUES (%s, %s, %s);")
                for gol in partida.gols:
                    cursor.execute(query, (gol.n_minuto_gol, id_partida, gol.jogador.id_jogador))

            if partida.cartoes:
                query = ("INSERT INTO "
                            "Cartao (e_tipo, n_minuto_cartao, id_jogo, id_jogador) "
                         "VALUES (%s, %s, %s, %s);")
                for cartao in partida.cartoes:
                    cursor.execute(query, (str(cartao.e_tipo),
                                           cartao.n_minuto_cartao,
                                           id_partida,
                                           cartao.jogador.id_jogador))
    finally:
        conn.commit()
        conn.close()

def delete_partida(id_partida: int):
    conn = pymysql.connect(
        host="localhost",
        user="root",
        port=3308,
        password="root",
        database="meu_banco",
    )
    try:
        with conn.cursor() as cursor:
            query = ("DELETE FROM "
                        "Jogo "
                     "WHERE id_jogo = %s;")
            cursor.execute(query, id_partida)
    finally:
        conn.commit()
        conn.close()

