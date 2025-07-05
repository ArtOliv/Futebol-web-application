import pymysql
from src.models.jogador.jogador_model import Jogador
from pymysql.err import IntegrityError
from fastapi import HTTPException, status 
from typing import Dict, Any, Optional, List 
from src.database import get_db_connection


def get_jogadores_por_nome(name: Optional[str] = None, nome_time: Optional[str] = None) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    try:
        cursor = conn.cursor() 

        query = """
            SELECT
                j.id_jogador,
                j.c_Pnome_jogador,
                j.c_Unome_jogador,
                j.n_camisa,
                j.c_posicao,
                j.d_data_nascimento,
                j.c_nome_time AS nome_time -- <--- !!! CRUCIAL CHANGE HERE !!!
                                          -- Selects from 'j' (jogador alias) and aliases it to 'nome_time'
            FROM
                Jogador j -- Make sure 'Jogador' matches case if your DB is case-sensitive (sometimes it's 'jogador')
            WHERE 1=1
        """
        params = []

        if name:
            query += " AND j.c_Pnome_jogador LIKE %s"
            params.append(f"%{name}%")
        if nome_time:
            query += " AND j.c_nome_time LIKE %s" 
            params.append(f"%{nome_time}%")

        cursor.execute(query, tuple(params))
        results = cursor.fetchall()
        return results
    finally:
        if cursor:
            cursor.close()
        if conn:
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
          
            cursor.execute("SELECT c_nome_time FROM Time WHERE c_nome_time = %s", (nome_time,))
            time_exists = cursor.fetchone()

            if not time_exists:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Time '{nome_time}' não encontrado. Não é possível adicionar jogador.")

          
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
                jogador["c_posicao"], 
                jogador["d_data_nascimento"],
                nome_time 
            )

            cursor.execute(sql_insert_player, values_to_insert)
            conn.commit()
            return {"message": "Jogador cadastrado com sucesso!"}

    except IntegrityError as e:
        if conn:
            conn.rollback()
      
        error_message_lower = str(e).lower()
        if 'duplicate entry' in error_message_lower and 'primary' in error_message_lower and 'id_jogador' in error_message_lower:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Um jogador com este ID já existe.")
        elif 'foreign key constraint fails' in error_message_lower and 'fk_jogador_time' in error_message_lower: # Verifique o nome da sua FK se for diferente
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Não foi possível associar o jogador ao time. Verifique se o nome do time está correto.")
        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Erro de integridade ao cadastrar jogador: {e}")

    except KeyError as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=f"Dados do jogador incompletos ou incorretos: campo '{e}' ausente no payload da requisição.")

    except MySQLError as e:
        print(f"ERRO MYSQL CAPTURADO: {e}")
        if conn:
            conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro interno do servidor ao cadastrar jogador: {e}")

    except HTTPException as e:
        raise e 

    except Exception as e:  
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