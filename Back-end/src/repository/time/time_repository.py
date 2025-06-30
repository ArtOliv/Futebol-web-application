from fastapi import HTTPException

import pymysql
from pymysql.err import IntegrityError
from collections import defaultdict

from decimal import Decimal
from src.models.cartao.cartao_model import Cartao
from src.models.time.time_model import Time
from src.parser.time_parser import parse_time, parse_list_times
from src.constant.posicao_enum import Posicao
from src.models.jogador.jogador_model import Jogador
from src.models.classificacao.classific_model import Classificacao

def get_time(nome_time: str):
    import pymysql

    conn = pymysql.connect(
        host="localhost",
        port=3308,
        user="root",
        password="root",
        database="campeonato_futebol",
        cursorclass=pymysql.cursors.DictCursor,
        charset="utf8mb4"
    )

    conn.query("SET NAMES utf8mb4;")

    try:
        with conn.cursor() as cursor:
            query = """
                SELECT 
                    t.c_nome_time, 
                    t.c_cidade_time, 
                    t.c_tecnico_time,
                    j.id_jogador,
                    CONCAT(j.c_Pnome_jogador, ' ', IFNULL(j.c_Unome_jogador, '')) AS nome_jogador
                FROM Time t
                LEFT JOIN Jogador j ON j.c_nome_time = t.c_nome_time
                WHERE t.c_nome_time = %s;
            """
            cursor.execute(query, (nome_time,))
            rows = cursor.fetchall()
    finally:
        conn.close()

    if not rows:
        return None

    time_info = {
        "name": rows[0]["c_nome_time"],
        "city": rows[0]["c_cidade_time"],
        "coach": rows[0]["c_tecnico_time"],
        "players": []
    }

    for row in rows:
        if row["nome_jogador"]:
            time_info["players"].append({
                "id": row["id_jogador"],
                "nome": row["nome_jogador"]
            })

    return time_info

def insert_time(time: Time, nome_campeonato: str, ano_campeonato: int):
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
                        "c_nome_time) "
                        "VALUES (%s, %s, %s, %s, %s, %s) "
                        "ON DUPLICATE KEY UPDATE "
                        "d_data_nascimento = VALUES(d_data_nascimento), "
                        "c_posicao = VALUES(c_posicao), "
                        "c_nome_time = VALUES(c_nome_time);")
                for jogador in time.jogadores:
                    cursor.execute(query, (
                        jogador.c_Pnome_jogador,
                        jogador.c_Unome_jogador,
                        jogador.n_camisa,
                        jogador.d_data_nascimento,
                        jogador.c_posicao,
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
            conn.commit()
    except IntegrityError as e:
        if all(s in str(e).lower() for s in ['foreign key constraint fails', 'fk_camp_time']):
            raise HTTPException(status_code=400, detail="Esse campeonato nao existe.")
        if all(s in str(e).lower() for s in ['foreign key constraint fails', 'fk_time_jogador']):
            raise HTTPException(status_code=400, detail="Vocẽ tentou inserir um jogador em um time inexistente.")
        raise HTTPException(status_code=400, detail="Ocorreu um erro ao cadastrar o time.")

    finally:

        conn.close()

def delete_time(nome_time: str):
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
        database="campeonato_futebol",
        charset="utf8mb4"
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
    team = get_time("Flamengo")

    print(team)
    # for row in team:
    #     print(row)
    # time = parse_time(team
