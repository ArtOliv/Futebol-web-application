import getpass
import os
import mysql.connector

from insert_jogos import importar_jogos
from insert_jogadores import importar_jogadores
from insert_gols import importar_gols
from insert_cartoes import importar_cartoes

def main():
    senha = getpass.getpass("Digite a senha do banco de dados: ")
    os.environ['DB_PASSWORD'] = senha
    porta = getpass.getpass("Digite a porta do banco de dados: ")
    os.environ['DB_PORT'] = porta
    host = getpass.getpass("Digite a host do banco de dados: ")
    os.environ['DB_HOST'] = host

    print("\n=== Importando jogos ===")
    importar_jogos()

    print("\n=== Importando jogadores ===")
    importar_jogadores()

    print("\n=== Importando gols ===")
    importar_gols()

    print("\n=== Importando cartões ===")
    importar_cartoes()
    
    try:
        print("\n=== Atualizando status dos jogos para 'Finalizado' ===")
        conn = mysql.connector.connect(
            host="mysql",
            port=3306,
            user="root",
            password=senha,
            database="meu_banco"
        )
        cursor = conn.cursor()
    
        cursor.execute("SET SQL_SAFE_UPDATES = 0;")
        cursor.execute("""
            UPDATE Jogo
            SET c_status = 'Finalizado'
            WHERE dt_data_horario < NOW() AND c_status <> 'Finalizado';
        """)
        conn.commit()
    
        print("Status dos jogos atualizado com sucesso.")
    
    except mysql.connector.Error as err:
        print(f"Erro ao atualizar status dos jogos: {err}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

if __name__ == "__main__":
    main()