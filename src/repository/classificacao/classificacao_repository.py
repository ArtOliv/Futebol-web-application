import pymysql

def get_all_ordered_classificacao():
    conn = pymysql.connect(
        host="localhost",
        user="root",
        port=3308,
        password="root",
        database="meu_banco"
    )
    try:
        with conn.cursor() as cursor:
            query = ("SELECT * FROM "
                        "Classificacao "
                     "ORDER BY n_pontos DESC;")
        cursor.execute(query)
    finally:
        conn.commit()
        conn.close()

def get_classificacao(nome_time: str):
    conn = pymysql.connect(
        host="localhost",
        user="root",
        port=3308,
        password="root",
        database="meu_banco"
    )
    try:
        with conn.cursor() as cursor:
            query = ("SELECT * FROM "
                        "Classificacao "
                     "WHERE c_nome_time = %s;")
            cursor.execute(query, nome_time)
    finally:
        conn.commit()
        conn.close()

