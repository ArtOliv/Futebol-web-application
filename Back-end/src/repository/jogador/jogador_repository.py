import pymysql
from src.models.jogador.jogador_model import Jogador
from pymysql.err import IntegrityError
from fastapi import HTTPException, status 
from typing import Dict, Any # Import Dict and Any


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

def insert_jogador(jogador: Dict[str, Any], nome_time: str):
    conn = None
    try:
        conn = pymysql.connect(
            host="localhost",
            user="root",
            port=3308,
            password="root",
            database="campeonato_futebol",
            charset="utf8mb4",
            cursorclass=pymysql.cursors.DictCursor
        )
        conn.query("SET NAMES utf8mb4;")

        with conn.cursor() as cursor:
            # --- STEP 1: VERIFICAR SE O TIME EXISTE ---
            # Como c_nome_time é a PK do Time, basta tentar selecioná-lo.
            # Se não retornar nada, o time não existe.
            cursor.execute("SELECT c_nome_time FROM Time WHERE c_nome_time = %s", (nome_time,))
            time_exists = cursor.fetchone()

            if not time_exists:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Time '{nome_time}' não encontrado. Não é possível adicionar jogador.")

            # --- STEP 2: INSERIR O JOGADOR ---
            # Não incluir 'id_jogador' na lista de colunas, pois é auto_increment.
            # Usar 'c_nome_time' como chave estrangeira.
            sql_insert_player = """
            INSERT INTO Jogador (
                c_Pnome_jogador,
                c_Unome_jogador,
                n_camisa,
                c_posicao,
                d_data_nascimento,
                c_nome_time
            ) VALUES (%s, %s, %s, %s, %s, %s)
            """
            values_to_insert = (
                jogador["c_Pnome_jogador"],
                jogador["c_Unome_jogador"],
                jogador["n_camisa"],
                jogador["c_posicao"], # O valor do IntEnum já deve estar aqui
                jogador["d_data_nascimento"],
                nome_time # Usar o nome do time como FK
            )

            cursor.execute(sql_insert_player, values_to_insert)
            conn.commit()
            return {"message": "Jogador cadastrado com sucesso!"}

    except IntegrityError as e:
        if conn:
            conn.rollback()
        # Verifique a mensagem de erro para ser mais específico
        error_message_lower = str(e).lower()
        if 'duplicate entry' in error_message_lower and 'primary' in error_message_lower and 'id_jogador' in error_message_lower:
            # Este erro é improvável se id_jogador é auto_increment, a menos que você esteja tentando inserir um ID.
            # Mas é bom ter a condição.
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Um jogador com este ID já existe.")
        elif 'foreign key constraint fails' in error_message_lower and 'fk_jogador_time' in error_message_lower: # Verifique o nome da sua FK se for diferente
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Não foi possível associar o jogador ao time. Verifique se o nome do time está correto.")
        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Erro de integridade ao cadastrar jogador: {e}")

    except KeyError as e:
        if conn:
            conn.rollback()
        # Isso pode acontecer se o dicionário 'jogador' não tiver uma chave esperada
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=f"Dados do jogador incompletos ou incorretos: campo '{e}' ausente no payload da requisição.")

    except MySQLError as e:
        print(f"ERRO MYSQL CAPTURADO: {e}")
        if conn:
            conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro interno do servidor ao cadastrar jogador: {e}")

    except HTTPException as e:
        raise e # Re-raise FastAPI HTTPExceptions

    except Exception as e: # Captura qualquer outra exceção inesperada
        print(f"ERRO INESPERADO NA INSERÇÃO (Jogador): {e}")
        if conn:
            conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Ocorreu um erro interno inesperado no servidor: {str(e)}")

    finally:
        if conn:
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