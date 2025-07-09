import pymysql
import sys

try:
    conn = pymysql.connect(
        host="mysql",
        port=3306,
        user="root",
        password="root",
        database="meu_banco",
        cursorclass=pymysql.cursors.DictCursor, # Opcional, mas útil
        charset="utf8mb4"
    )
    print("Conectado ao banco de dados!")
    conn.query("SET NAMES utf8mb4;")

    with conn.cursor() as cursor:
        print("\n--- DESCRIBE Classificacao ---")
        cursor.execute("DESCRIBE Classificacao;")
        for row in cursor.fetchall():
            print(row)

        print("\n--- SHOW CREATE TABLE Classificacao ---")
        cursor.execute("SHOW CREATE TABLE Classificacao;")
        for row in cursor.fetchall():
            print(row)

        print("\n--- SELECT * FROM Classificacao LIMIT 10 ---")
        cursor.execute("SELECT * FROM Classificacao LIMIT 10;") # Limite para não carregar muitos dados
        for row in cursor.fetchall():
            print(row)


except pymysql.Error as e:
    print(f"Erro ao conectar ou consultar o banco de dados: {e}")
    sys.exit(1)
finally:
    if 'conn' in locals() and conn.open:
        conn.close()
        print("Conexão fechada.")