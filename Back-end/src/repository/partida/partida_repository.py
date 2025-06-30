import pymysql
from src.models.partida.partida_model import Partida
from src.parser.partida_parser import parse_partidas

def get_all_ordered_partida(nome_campeonato: str, ano_campeonato: int):
    conn = pymysql.connect(
        host="localhost",
        user="root",
        port=3308,
        password="root",
        database="campeonato_futebol",
        cursorclass=pymysql.cursors.DictCursor,
        charset="utf8mb4"
    )

    conn.query("SET NAMES utf8mb4;")

    try:
        with conn.cursor() as cursor:
            query = (
                "SELECT "
                    "p.c_nome_campeonato, "
                    "p.id_jogo, "
                    "p.dt_data_horario, "
                    "p.n_rodada, "
                    "p.n_placar_casa, "
                    "p.n_placar_visitante, "
                    "p.c_time_casa, "
                    "p.c_time_visitante, "
                    "e.c_nome_estadio, "
                    "p.c_status "
                "FROM Jogo AS p "
                "JOIN Estadio AS e ON e.c_nome_estadio = p.c_nome_estadio "
                "WHERE p.c_nome_campeonato = %s AND p.d_ano_campeonato = %s "
                "ORDER BY p.dt_data_horario ASC;"
            )
            cursor.execute(query, (nome_campeonato, ano_campeonato))
            result = cursor.fetchall()
    finally:
        conn.close()
    return result

def get_partidas_por_time(nome_time: str):
    conn = pymysql.connect(
        host="localhost",
        user="root",
        port=3308,
        password="root",
        database="campeonato_futebol",
        cursorclass=pymysql.cursors.DictCursor,
        charset="utf8mb4"
    )

    conn.query("SET NAMES utf8mb4;")

    try:
        with conn.cursor() as cursor:
            query = (
                "SELECT "
                    "j.id_jogo, "
                    "j.dt_data_horario, "
                    "j.c_nome_campeonato, "
                    "j.c_time_casa, "
                    "j.c_time_visitante, "
                    "j.n_placar_casa, "
                    "j.n_placar_visitante "
                "FROM Jogo AS j "
                "WHERE j.c_time_casa = %s OR j.c_time_visitante = %s "
                "ORDER BY j.dt_data_horario DESC;"
            )
            cursor.execute(query, (nome_time, nome_time))
            return cursor.fetchall()
    finally:
        conn.close()

def insert_partida(partida: Partida, nome_campeonato: str, ano_campeonato: int):
    conn = pymysql.connect(
        host="localhost",
        user="root",
        port=3308,
        password="root",
        database="campeonato_futebol",
        charset="utf8mb4"
    )

    conn.query("SET NAMES utf8mb4;")

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
                            "n_rodada, "
                            "c_nome_campeonato, "
                            "d_ano_campeonato, "
                            "c_nome_estadio, "
                            "c_time_casa, "
                            "c_time_visitante, "
                            "n_placar_casa, "
                            "n_placar_visitante, "
                            "c_status) "
                     "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s);")
            cursor.execute(query, (partida.dt_data_horario,
                                   partida.n_rodada,
                                   nome_campeonato,
                                   ano_campeonato,
                                   partida.estadio.c_nome_estadio,
                                   partida.time_casa,
                                   partida.time_visitante,
                                   partida.n_placar_casa,
                                   partida.n_placar_visitante,
                                   partida.c_status))
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
        database="campeonato_futebol",
        charset="utf8mb4"
    )

    conn.query("SET NAMES utf8mb4;")

    try:
        with conn.cursor() as cursor:
            query = ("DELETE FROM "
                        "Jogo "
                     "WHERE id_jogo = %s;")
            cursor.execute(query, id_partida)
    finally:
        conn.commit()
        conn.close()

