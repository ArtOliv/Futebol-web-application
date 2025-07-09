import pymysql
from src.parser.camp_parser import parse_campeonato, parse_campeonato_for_dropdown

def insert_campeonato(nome_campeonato: str, ano_campeonato: int):
    conn = pymysql.connect(
        host="mysql",
        user="root",
        port=3306,
        password="root",
        database="meu_banco",
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
        host="mysql",
        user="root",
        port=3306,
        password="root",
        database="meu_banco",
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

def get_campeonato_by_name(nome_campeonato: str):
    conn = pymysql.connect(
        host="mysql",
        user="root",
        port=3306,
        password="root",
        database="meu_banco",
        cursorclass=pymysql.cursors.DictCursor,
        charset="utf8mb4"
    )
    conn.query("SET NAMES utf8mb4;")
    try:
        with conn.cursor() as cursor:
            # Selecione as colunas exatas do BD
            query = ("SELECT "
                        "c_nome_campeonato, d_ano_campeonato " # Usando 'campeonato'
                     "FROM Campeonato WHERE c_nome_campeonato LIKE %s;")
            cursor.execute(query, (f"%{nome_campeonato}%",))
            rows = cursor.fetchall()
    finally:
        conn.commit()
        conn.close()
    # Se esta função também for usada para alimentar dropdowns, use o NOVO parser.
    # Caso contrário, se for para exibir detalhes completos, use o parse_campeonato original.
    # Por padrão, assumindo que pode ser para dropdowns ou listagens simples.
    result = [parse_campeonato_for_dropdown(row) for row in rows]
    return result

# Função para buscar campeonato por nome E ano
def get_campeonato_by_name_and_year(nome_campeonato: str, ano_campeonato: int):
    conn = pymysql.connect(
        host="mysql",
        user="root",
        port=3306,
        password="root",
        database="meu_banco",
        cursorclass=pymysql.cursors.DictCursor,
        charset="utf8mb4"
    )
    conn.query("SET NAMES utf8mb4;")
    try:
        with conn.cursor() as cursor:
            # Selecione as colunas exatas do BD
            query = ("SELECT "
                        "c_nome_campeonato, d_ano_campeonato " # Usando 'campeonato'
                     "FROM Campeonato "
                     "WHERE c_nome_campeonato = %s AND d_ano_campeonato = %s;")
            cursor.execute(query, (nome_campeonato, ano_campeonato))
            rows = cursor.fetchall()
    finally:
        conn.commit()
        conn.close()
    # Use o NOVO parser aqui, pois esta função é explicitamente para a verificação do frontend
    result = [parse_campeonato_for_dropdown(row) for row in rows]
    return result


def delete_campeonato(nome_campeonato: str, ano_campeonato: int):
    conn = pymysql.connect(
        host="mysql",
        user="root",
        port=3306,
        password="root",
        database="meu_banco",
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
