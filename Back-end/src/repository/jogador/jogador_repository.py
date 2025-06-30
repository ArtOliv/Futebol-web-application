import pymysql
from src.models.jogador.jogador_model import Jogador
from pymysql.err import IntegrityError
from fastapi import HTTPException

def get_jogadores_por_nome(name: str):
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
            if name:
                cursor.execute("""
                    SELECT *, 
                    CONCAT(c_Pnome_jogador, ' ', IFNULL(c_Unome_jogador, '')) AS nome_completo 
                    FROM Jogador 
                    WHERE CONCAT(c_Pnome_jogador, ' ', IFNULL(c_Unome_jogador, '')) 
                    LIKE %s
                """, (f"%{name}%",))
            else:
                cursor.execute("SELECT *, CONCAT(c_Pnome_jogador, ' ', IFNULL(c_Unome_jogador, '')) AS nome_completo FROM Jogador")
            return cursor.fetchall()
    finally:
        conn.close()

def get_jogador_por_id(jogador_id: int):
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
            cursor.execute("""
                SELECT *, 
                CONCAT(c_Pnome_jogador, ' ', IFNULL(c_Unome_jogador, '')) AS nome_completo 
                FROM Jogador 
                WHERE id_jogador = %s
            """, (jogador_id,))
            result = cursor.fetchone()
            if not result:
                raise HTTPException(status_code=404, detail="Jogador não encontrado")
            return result
    finally:
        conn.close()

def insert_jogador(jogador: Jogador, nome_time: str):
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
                     "Jogador (c_pnome_jogador, "
                     "c_unome_jogador, "
                     "n_camisa, "
                     "c_posicao, "
                     "d_data_nascimento, "
                     "n_altura, "
                     "n_peso, "
                     "c_nome_time) "
                     "VALUES (%s, %s, %s, %s, %s, %s, %s, %s)")
            values = (jogador.c_Pnome_jogador,
                      jogador.c_Unome_jogador,
                      jogador.n_camisa,
                      jogador.c_posicao,
                      jogador.d_data_nascimento,
                      jogador.n_altura,
                      jogador.n_peso,
                      nome_time)
            cursor.execute(query, values)
            conn.commit()
    except IntegrityError as e:
        if all(s in str(e).lower() for s in ['foreign key constraint fails', 'fk_time_jogador']):
            raise HTTPException(status_code=400, detail="Vocẽ tentou inserir um jogador em um time inexistente.")
        raise HTTPException(status_code=400, detail="Ocorreu um erro ao cadastrar o time.")

    finally:
        conn.close()


def delete_jogador(id_jogador: int):
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
                        "Jogador "
                     "WHERE "
                        "id_jogador = %s;")
            cursor.execute(query, id_jogador)
            conn.commit()
    finally:
        conn.close()
