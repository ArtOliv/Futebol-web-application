import pymysql
from pymysql.err import IntegrityError
from src.models.gol.gol_model import Gol
from fastapi import HTTPException

def get_gols_por_partida(id_partida: int):
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
            query = """
                SELECT 
                    g.id_gol, 
                    g.n_minuto_gol,
                    CONCAT(j.c_Pnome_jogador, ' ', IFNULL(j.c_Unome_jogador, '')) AS c_nome_jogador,
                    t.c_nome_time
                FROM Gol g
                JOIN Jogador j ON g.id_jogador = j.id_jogador
                JOIN Time t ON j.c_nome_time = t.c_nome_time
                WHERE g.id_jogo = %s
                ORDER BY g.n_minuto_gol;
            """
            cursor.execute(query, (id_partida,))
            return cursor.fetchall()
    finally:
        conn.close()

def insert_gol(gol: Gol, id_partida: int, id_jogador: int):
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
            query = ("INSERT INTO "
                        "Gol (n_minuto_gol, id_jogo, id_jogador) "
                     "VALUES (%s, %s, %s);")
            cursor.execute(query, (gol.n_minuto_gol, id_partida, id_jogador))
    except IntegrityError as e:
        if all(s in str(e).lower() for s in ['foreign key constraint fails', 'fk_jogador_gol']):
            raise HTTPException(status_code=400, detail="Esse jogador não existe.")
        elif all(s in str(e).lower() for s in ['foreign key constraint fails', 'fk_jogo_gol']):
                    raise HTTPException(status_code=400, detail="Essa partida nao existe.")
        raise HTTPException(status_code=400, detail="Ocorreu um erro ao inserir o gol.")
    finally:
        conn.commit()
        conn.close()

def delete_gol(id_gol: int):
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
                        "Gol "
                     "WHERE "
                        "id_gol = %s;")
            cursor.execute(query, id_gol)
            conn.commit()
    finally:
        conn.close()
