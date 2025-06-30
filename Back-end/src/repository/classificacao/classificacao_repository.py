import pymysql
import traceback

def get_all_ordered_classificacao():
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
            query = ("SELECT "
                        "c_nome_campeonato, d_ano_campeonato, c_nome_time, "
                        "n_pontos, n_jogos, n_vitorias, n_empates, n_derrotas, "
                        "n_gols_pro, n_gols_contra, n_saldo_gols "
                        "FROM Classificacao "
                     "ORDER BY n_pontos DESC;")
            cursor.execute(query)
            result = cursor.fetchall()
            return result
    except Exception as e:
        print("Erro ao executar a consulta de classificação:")
        traceback.print_exc()
        raise e
    finally:
        conn.close()

def get_classificacao(nome_time: str):
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
            query = ("SELECT * FROM "
                        "Classificacao "
                     "WHERE c_nome_time = %s;")
            cursor.execute(query, (nome_time,))
            return cursor.fetchone()
    finally:
        conn.close()

