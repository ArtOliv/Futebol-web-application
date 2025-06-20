import pymysql
from collections import defaultdict

from decimal import Decimal
from src.models.cartao.cartao_model import Cartao
from src.models.time.time_model import Time
from src.parser.time_parser import parse_time, parse_list_times
from src.constant.posicao_enum import Posicao
from src.models.jogador.jogador_model import Jogador
from src.models.classificacao.classific_model import Classificacao
def get_time(nome_time: str):
    conn = pymysql.connect(
        host="localhost",
        port=3308,
        user="root",
        password="root",
        database="meu_banco",
        cursorclass=pymysql.cursors.DictCursor,
    )
    try:
        with conn.cursor() as cursor:
            query = ("SELECT "
                         "t.c_nome_time, "
                         "t.c_cidade_time, "
                         "t.c_tecnico_time, "
                         "j.c_Pnome_jogador, "
                         "j.c_Unome_jogador, "
                         "j.n_camisa, "
                         "j.d_data_nascimento, "
                         "j.c_posicao, "
                         "j.n_altura, "
                         "j.n_peso, "
                         "j.c_nome_time, "
                         "c.e_tipo, "
                         "c.n_minuto_cartao, "
                         "class.n_pontos, "
                        "n_jogos, "
                        "n_vitorias, "
                        "n_empates, "
                        "n_derrotas, "
                        "n_gols_pro, "
                        "n_gols_contra, "
                        "n_saldo_gols "
                     "FROM "
                        "Time AS t "
                     "JOIN "
                        "Jogador AS j "
                        "ON j.c_nome_time = t.c_nome_time "
                     "LEFT JOIN "
                        "Cartao AS c "
                        "ON c.id_jogador = j.id_jogador "
                     "JOIN "
                        "Classificacao AS class "
                        "ON class.c_nome_time = t.c_nome_time "
                     "WHERE "
                        "t.c_nome_time = %s;")
            cursor.execute(query, nome_time)
            result = cursor.fetchall()
    finally:
        conn.close()
    return parse_time(result)

def get_all_time(nome_campeonato: str, ano_campeonato: int):
    conn = pymysql.connect(
        host="localhost",
        port=3308,
        user="root",
        password="root",
        database="meu_banco",
        cursorclass=pymysql.cursors.DictCursor,
    )
    try:
        with conn.cursor() as cursor:
            query = ("SELECT "
                         "t.c_nome_time, "
                         "t.c_cidade_time, "
                         "t.c_tecnico_time, "
                         "j.id_jogador, "
                         "j.c_Pnome_jogador, "
                         "j.c_Unome_jogador, "
                         "j.n_camisa, "
                         "j.d_data_nascimento, "
                         "j.c_posicao, "
                         "j.n_altura, "
                         "j.n_peso, "
                         "c.e_tipo, "
                         "c.n_minuto_cartao, "
                         "classif.n_pontos, "
                        "n_jogos, "
                        "n_vitorias, "
                        "n_empates, "
                        "n_derrotas, "
                        "n_gols_pro, "
                        "n_gols_contra, "
                        "n_saldo_gols "
                     "FROM "
                        "Time AS t "
                     "JOIN "
                        "Jogador AS j "
                        "ON j.c_nome_time = t.c_nome_time "
                     "LEFT JOIN "
                        "Cartao AS c "
                        "ON c.id_jogador = j.id_jogador "
                     "JOIN "
                        "Classificacao AS classif "
                        "ON classif.c_nome_time = t.c_nome_time "
                     "JOIN "
                        "Time_participa_campeonato as tpc "
                        "ON tpc.c_nome_time = t.c_nome_time "
                     "JOIN "
                        "Campeonato AS camp "
                        "ON camp.c_nome_campeonato = tpc.c_nome_campeonato "
                        "AND camp.d_ano_campeonato = tpc.d_ano_campeonato "
                     "WHERE "
                        "tpc.c_nome_campeonato = %s "
                        "AND tpc.d_ano_campeonato = %s;")
            cursor.execute(query, (nome_campeonato, ano_campeonato))
            result = cursor.fetchall()
    finally:
        conn.close()

    return parse_list_times(result)



def insert_time(time: Time, nome_campeonato: str, ano_campeonato: int):
    conn = pymysql.connect(
        host="localhost",
        user="root",
        port=3308,
        password="root",
        database="meu_banco"
    )
    try:
        with conn.cursor() as cursor:
            query = ("INSERT INTO "
                     "Time (c_nome_time, c_cidade_time, c_tecnico_time)"
                     f"VALUES (%s, %s, %s) "
                     "ON DUPLICATE KEY UPDATE "
                     "c_cidade_time = VALUES(c_cidade_time), "
                     "c_tecnico_time = VALUES(c_tecnico_time);")
            cursor.execute(query, (time.c_nome_time, time.c_cidade_time, time.c_tecnico_time))

            if time.jogadores:
                query = ("INSERT INTO "
                         "Jogador "
                         "(c_Pnome_jogador"
                         ", c_Unome_jogador, "
                         "n_camisa, "
                         "d_data_nascimento, "
                         "c_posicao, "
                         "n_altura, "
                         "n_peso, "
                         "c_nome_time) "
                         "VALUES (%s, %s, %s, %s, %s, %s, %s, %s) "
                         "ON DUPLICATE KEY UPDATE "
                         "d_data_nascimento = VALUES(d_data_nascimento), "
                         "c_posicao = VALUES(c_posicao), "
                         "n_altura = VALUES(n_altura), "
                         "n_peso = VALUES(n_peso), "
                         "c_nome_time = VALUES(c_nome_time);")
                for jogador in time.jogadores:
                    cursor.execute(query, (
                        jogador.c_Pnome_jogador,
                        jogador.c_Unome_jogador,
                        jogador.n_camisa,
                        jogador.d_data_nascimento,
                        jogador.c_posicao,
                        jogador.n_altura,
                        jogador.n_peso,
                        time.c_nome_time
                    ))
            query = ("INSERT INTO "
                        "Time_participa_campeonato (c_nome_time, c_nome_campeonato, d_ano_campeonato) "
                     "VALUES (%s, %s, %s);")
            cursor.execute(query, (time.c_nome_time, nome_campeonato, ano_campeonato))
            query = ("INSERT INTO "
                        "Classificacao (c_nome_campeonato, d_ano_campeonato, c_nome_time)"
                     "VALUES (%s, %s, %s);")
            cursor.execute(query, (nome_campeonato, ano_campeonato, time.c_nome_time))

    finally:
        conn.commit()
        conn.close()

def delete_time(nome_time: str):
    conn = pymysql.connect(
        host="localhost",
        user="root",
        port=3308,
        password="root",
        database="meu_banco"
    )
    try:
        with conn.cursor() as cursor:
            query = ("DELETE FROM "
                        "Time "
                     "WHERE c_nome_time = %s;")
            cursor.execute(query, nome_time)
    finally:
        conn.commit()
        conn.close()

def update_time(time: Time):
    conn = pymysql.connect(
        host="localhost",
        user="root",
        port=3308,
        password="root",
        database="meu_banco"
    )
    try:
        with conn.cursor() as cursor:
            query = ("UPDATE "
                        "Time "
                     "SET "
                        "c_cidade_time = %s, "
                        "c_tecnico_time = %s "
                     "WHERE c_nome_time = %s;")
            cursor.execute(query, (time.c_cidade_time, time.c_tecnico_time, time.c_nome_time))
    finally:
        conn.commit()
        conn.close()



if __name__ == "__main__":
    team = get_all_time("Brasileirao", 2024)

    print(team)
    # for row in team:
    #     print(row)
    # time = parse_time(team
