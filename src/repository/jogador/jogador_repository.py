import pymysql
from src.models.jogador.jogador_model import Jogador


def insert_jogador(jogador: Jogador, nome_time: str):
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

    finally:
        conn.commit()
        conn.close()


