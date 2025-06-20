import pymysql
from src.models.gol.gol_model import Gol

def insert_gol(gol: Gol, id_partida: int, id_jogador: int):
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
            query = ("INSERT INTO "
                        "Gol (n_minuto_gol, id_jogo, id_jogador) "
                     "VALUES (%s, %s, %s);")
            cursor.execute(query, (gol.n_minuto_gol, id_partida, id_jogador))
    finally:
        conn.commit()
        conn.close()
