import pymysql
from src.parser.camp_parser import parse_campeonato

def insert_campeonato(nome_campeonato: str, ano_campeonato: int):
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
                        "Campeonato (c_nome_campeonato, d_ano_campeonato) "
                     "VALUES (%s, %s);")
            cursor.execute(query, (nome_campeonato, ano_campeonato))

    finally:
        conn.commit()
        conn.close()

def get_all_campeonato():
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
                        "c_nome_campeonato, d_ano_campeonato "
                     "FROM Campeonato;")
            cursor.execute(query)
            result = cursor.fetchall()
    finally:
        conn.commit()
        conn.close()

    result = [parse_campeonato(row) for row in result]
    return result


def delete_campeonato(nome_campeonato: str, ano_campeonato: int):
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
                        "Campeonato "
                     "WHERE "
                        "c_nome_campeonato = %s"
                        "AND d_ano_campeonato = %s;")
            cursor.execute(query, (nome_campeonato, ano_campeonato))
    finally:
        conn.commit()
        conn.close()


if __name__ == "__main__":
    # insert_campeonato('Brasileirao', 2025)
    resultad = get_all_campeonato()
    for camp in resultad:
        print(camp.model_dump_json())
