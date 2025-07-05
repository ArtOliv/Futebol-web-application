import pymysql
from pymysql.err import IntegrityError, MySQLError # Impo
from fastapi import HTTPException, status 
from typing import List, Dict, Any, Optional

from src.models.cartao.cartao_model import Cartao, CartaoResponse
from src.database import get_db_connection 

def get_cartoes_por_partida(id_partida: int) -> List[Dict[str, Any]]: 
    conn = None
    cursor = None
    try:
        conn = get_db_connection() 
        cursor = conn.cursor() 
        query = """
                SELECT
                    c.id_cartao,
                    c.e_tipo,
                    c.n_minuto_cartao,
                    c.id_jogo, -- <--- Add id_jogo to selection for CartaoResponse
                    CONCAT(j.c_Pnome_jogador, ' ', IFNULL(j.c_Unome_jogador, '')) AS c_nome_jogador,
                    t.c_nome_time AS c_nome_time -- <--- Ensure this alias matches CartaoResponse
                FROM Cartao c
                JOIN Jogador j ON c.id_jogador = j.id_jogador
                JOIN Time t ON j.c_nome_time = t.c_nome_time
                WHERE c.id_jogo = %s
                ORDER BY c.n_minuto_cartao;
            """
        cursor.execute(query, (id_partida,))
        return cursor.fetchall()
    except MySQLError as e: 
        print(f"ERRO MYSQL CAPTURADO (get_cartoes_por_partida): {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro interno ao buscar cartões: {e}")
    except Exception as e: 
        print(f"ERRO INESPERADO (get_cartoes_por_partida): {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Ocorreu um erro inesperado ao buscar cartões: {str(e)}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def insert_cartao(cartao: Cartao, id_partida: int, id_jogador: int) -> Dict[str, str]:
    conn = None
    cursor = None
    try:
        conn = get_db_connection() 
        cursor = conn.cursor()
        query = ("INSERT INTO "
                    "Cartao (e_tipo, n_minuto_cartao, id_jogo, id_jogador) "
                 "VALUES (%s, %s, %s, %s);")
        cursor.execute(query, (str(cartao.e_tipo.value), cartao.n_minuto_cartao,id_partida,id_jogador)) 
        conn.commit()
        return {"message": "Cartão inserido com sucesso."}
    except IntegrityError as e:
        if conn: conn.rollback()
        error_message_lower = str(e).lower()
        if all(s in error_message_lower for s in ['foreign key constraint fails', 'fk_jogo_cartao']):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Essa partida não existe.")
        elif all(s in error_message_lower for s in ['foreign key constraint fails', 'fk_jogador_cartao']):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Esse jogador não existe.")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Erro de integridade do banco ao inserir o cartão: {e}")
    except MySQLError as e:
        print(f"ERRO MYSQL CAPTURADO (insert_cartao): {e}")
        if conn: conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro interno do servidor ao inserir cartão: {e}")
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"ERRO INESPERADO NA INSERÇÃO (Cartao): {e}")
        if conn: conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Ocorreu um erro interno inesperado no servidor: {str(e)}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def delete_cartao(id_cartao: int) -> Dict[str, str]:
    conn = None
    cursor = None
    try:
        conn = get_db_connection() 
        cursor = conn.cursor()
        query = ("DELETE FROM "
                    "Cartao "
                 "WHERE id_cartao = %s;")
        cursor.execute(query, id_cartao)
        conn.commit()
        if cursor.rowcount == 0:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Cartão com ID {id_cartao} não encontrado.")
        return {"message": "Cartão removido com sucesso."}
    except MySQLError as e:
        print(f"ERRO MYSQL CAPTURADO (delete_cartao): {e}")
        if conn: conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro interno ao deletar cartão: {e}")
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"ERRO INESPERADO NA DELEÇÃO (Cartao): {e}")
        if conn: conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Ocorreu um erro inesperado ao deletar cartão: {str(e)}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()