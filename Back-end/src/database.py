import pymysql
from pymysql.cursors import DictCursor # Para obter resultados como dicionários
from pymysql.err import Error as PyMySQLError # Para capturar erros específicos do PyMySQL

# Detalhes da conexão com o banco de dados
DB_CONFIG = {
    "host": "mysql",
    "port": 3306,
    "user": "root",
    "password": "root",
    "database": "meu_banco",
    "charset": "utf8mb4",
}

# Uma exceção personalizada para erros de banco de dados (opcional, mas boa prática)
class DatabaseError(Exception):
    """Exceção personalizada para erros relacionados ao banco de dados."""
    pass

def get_db_connection():
    """
    Estabelece e retorna uma nova conexão com o banco de dados PyMySQL.
    Garante que o charset UTF-8mb4 seja configurado para a conexão.
    Usa DictCursor para que os resultados das consultas sejam dicionários.
    """
    conn = None # Inicializa conn para garantir que esteja definido
    try:
        conn = pymysql.connect(
            **DB_CONFIG,         # Desempacota as configurações do dicionário
            cursorclass=DictCursor # Usa o cursor que retorna dicionários
        )
        # Garante que o charset da conexão seja definido corretamente.
        # Isso é frequentemente redundante se 'charset' já está em connect(), mas é uma boa prática.
        conn.query("SET NAMES utf8mb4;")
        return conn
    except PyMySQLError as e:
        # Captura erros específicos do PyMySQL (ex: falha de conexão, credenciais erradas)
        print(f"ERRO: Não foi possível conectar ao banco de dados: {e}")
        raise DatabaseError(f"Falha ao conectar ao banco de dados: {e}")
    except Exception as e:
        # Captura outros erros inesperados durante a conexão
        print(f"ERRO: Ocorreu um erro inesperado durante a conexão com o banco de dados: {e}")
        raise DatabaseError(f"Ocorreu um erro inesperado durante a conexão com o banco de dados: {e}")