import pymysql
from src.models.cartao.cartao_model import Cartao
from pymysql.err import IntegrityError
from fastapi import HTTPException

def get_cartoes_por_partida(id_partida: int):
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
                    c.id_cartao, 
                    c.e_tipo, 
                    c.n_minuto_cartao,
                    CONCAT(j.c_Pnome_jogador, ' ', IFNULL(j.c_Unome_jogador, '')) AS c_nome_jogador,
                    t.c_nome_time
                FROM Cartao c
                JOIN Jogador j ON c.id_jogador = j.id_jogador
                JOIN Time t ON j.c_nome_time = t.c_nome_time
                WHERE c.id_jogo = %s
                ORDER BY c.n_minuto_cartao;
            """
            cursor.execute(query, (id_partida,))
            return cursor.fetchall()
    finally:
        conn.close()

def insert_cartao(cartao: Cartao, id_partida, id_jogador):
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
                        "Cartao (e_tipo, n_minuto_cartao, id_jogo, id_jogador) "
                     "VALUES (%s, %s, %s, %s);")
            cursor.execute(query, (str(cartao.e_tipo), cartao.n_minuto_cartao,id_partida,id_jogador))
            conn.commit()
    except IntegrityError as e:
        if all(s in str(e).lower() for s in ['foreign key constraint fails', 'fk_jogo_cartao']):
            raise HTTPException(status_code=400, detail="Essa partida não existe.")
        elif all(s in str(e).lower() for s in ['foreign key constraint fails', 'fk_jogador_cartao']):
                    raise HTTPException(status_code=400, detail="Esse jogador não existe.")
        raise HTTPException(status_code=400, detail="Erro de integridade do banco ao inserir o cartão.")
    finally:
        conn.close()

def delete_cartao(id_cartao: int):
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
                        "Cartao "
                     "WHERE id_cartao = %s;")
            cursor.execute(query, id_cartao)
            conn.commit()
    finally:
        conn.close()