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

# Função para inserir cartão (POST) - Adaptada para receber um dicionário (do model_dump)
def insert_cartao_action(cartao_data: Dict[str, Any]) -> str: # Renomeada para ser específica da ação
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

        # Validações de existência de jogo/jogador (essencial!)
        cursor.execute("SELECT id_jogo FROM Jogo WHERE id_jogo = %s", (cartao_data['id_jogo'],))
        if not cursor.fetchone():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Jogo com ID {cartao_data['id_jogo']} não encontrado.")
        
        cursor.execute("SELECT id_jogador FROM Jogador WHERE id_jogador = %s", (cartao_data['id_jogador'],))
        if not cursor.fetchone():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Jogador com ID {cartao_data['id_jogador']} não encontrado.")

        query = """
            INSERT INTO Cartao (
                id_jogo,
                id_jogador,
                n_minuto_cartao,
                e_tipo -- Corrigido de c_tipo_cartao para e_tipo (conforme seu DB)
                -- Adicione outras colunas se necessário
            ) VALUES (%s, %s, %s, %s)
        """
        values = (
            cartao_data['id_jogo'],
            cartao_data['id_jogador'],
            cartao_data['n_minuto_cartao'],
            cartao_data['c_tipo_cartao'] # O frontend envia c_tipo_cartao, que mapeia para e_tipo no DB
        )

        cursor.execute(query, values)
        conn.commit()
        return "Cartão adicionado com sucesso!"

    except IntegrityError as e:
        if conn: conn.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Erro de integridade ao adicionar cartão: {e}")
    except MySQLError as e:
        print(f"ERRO MYSQL CAPTURADO (insert_cartao_action): {e}") # Alterado: Nome da função no log
        if conn: conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro interno do servidor ao adicionar cartão: {e}")
    except HTTPException as e:
        if conn: conn.rollback()
        raise e
    except Exception as e:
        print(f"ERRO INESPERADO (insert_cartao_action): {e}")
        if conn: conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Ocorreu um erro inesperado ao adicionar cartão: {str(e)}")
    finally:
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