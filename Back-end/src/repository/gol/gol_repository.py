import pymysql
from pymysql.err import IntegrityError, MySQLError
from fastapi import HTTPException, status 
from typing import List, Dict, Any, Optional

from src.models.gol.gol_model import Gol, GolResponse 
from src.database import get_db_connection 
def get_gols_por_partida(id_partida: int) -> List[Dict[str, Any]]: 
    conn = None
    cursor = None
    try:
        conn = get_db_connection() 
        cursor = conn.cursor() 
        query = """
                SELECT
                    g.id_gol,
                    g.n_minuto_gol,
                    g.id_jogo, -- <--- Add id_jogo to selection for GolResponse
                    CONCAT(j.c_Pnome_jogador, ' ', IFNULL(j.c_Unome_jogador, '')) AS c_nome_jogador,
                    t.c_nome_time AS c_nome_time -- <--- Ensure this alias matches GolResponse
                FROM Gol g
                JOIN Jogador j ON g.id_jogador = j.id_jogador
                JOIN Time t ON j.c_nome_time = t.c_nome_time -- Assuming c_nome_time is directly on Time table
                WHERE g.id_jogo = %s
                ORDER BY g.n_minuto_gol;
            """
        cursor.execute(query, (id_partida,))
        return cursor.fetchall()
    except MySQLError as e:
        print(f"ERRO MYSQL CAPTURADO (get_gols_por_partida): {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro interno ao buscar gols: {e}")
    except Exception as e:
        print(f"ERRO INESPERADO (get_gols_por_partida): {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Ocorreu um erro inesperado ao buscar gols: {str(e)}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def insert_gol(gol: Gol, id_partida: int, id_jogador: int) -> Dict[str, str]: 
    conn = None
    cursor = None
    try:
        conn = get_db_connection() 
        cursor = conn.cursor()
        query = ("INSERT INTO "
                    "Gol (n_minuto_gol, id_jogo, id_jogador) "
                 "VALUES (%s, %s, %s);")
        cursor.execute(query, (gol.n_minuto_gol, id_partida, id_jogador))
        conn.commit()
        return {"message": "Gol inserido com sucesso."} 
    except IntegrityError as e:
        if conn: conn.rollback()
        error_message_lower = str(e).lower()
        if all(s in error_message_lower for s in ['foreign key constraint fails', 'fk_jogador_gol']):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Esse jogador não existe.")
        elif all(s in error_message_lower for s in ['foreign key constraint fails', 'fk_jogo_gol']):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Essa partida nao existe.")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Ocorreu um erro ao inserir o gol: {e}")
    except MySQLError as e:
        print(f"ERRO MYSQL CAPTURADO (insert_gol): {e}")
        if conn: conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro interno do servidor ao cadastrar gol: {e}")
    except HTTPException as e: 
        raise e
    except Exception as e:
        print(f"ERRO INESPERADO NA INSERÇÃO (Gol): {e}")
        if conn: conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Ocorreu um erro interno inesperado no servidor: {str(e)}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

def delete_gol(id_gol: int) -> Dict[str, str]:
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()

     
        select_goal_details_query = """
            SELECT
                g.id_jogo,
                j.c_nome_time AS jogador_time_nome,
                jo.c_time_casa,
                jo.c_time_visitante
            FROM Gol g
            JOIN Jogador j ON g.id_jogador = j.id_jogador
            JOIN Jogo jo ON g.id_jogo = jo.id_jogo
            WHERE g.id_gol = %s;
        """
        cursor.execute(select_goal_details_query, (id_gol,))
        goal_details = cursor.fetchone() 
        if not goal_details:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Gol com ID {id_gol} não encontrado.")

        id_jogo = goal_details['id_jogo']
        jogador_time_nome = goal_details['jogador_time_nome']
        c_time_casa = goal_details['c_time_casa']
        c_time_visitante = goal_details['c_time_visitante']

     
        score_to_update_column = None
        if jogador_time_nome == c_time_casa:
            score_to_update_column = "n_placar_casa"
        elif jogador_time_nome == c_time_visitante:
            score_to_update_column = "n_placar_visitante"
        else:
          
            print(f"WARNING: Gol (ID: {id_gol}) scored by player from team {jogador_time_nome} which is neither home ({c_time_casa}) nor away ({c_time_visitante}) for Match ID {id_jogo}.")
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"A equipe do jogador do gol {id_gol} não corresponde aos times da partida {id_jogo}. Não foi possível ajustar o placar.")


        delete_goal_query = """
            DELETE FROM Gol
            WHERE id_gol = %s;
        """
        cursor.execute(delete_goal_query, (id_gol,))

        if cursor.rowcount == 0: 
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Gol com ID {id_gol} não encontrado (após tentativa de deleção).")

        if score_to_update_column:
            update_score_query = f"""
                UPDATE Jogo
                SET {score_to_update_column} = {score_to_update_column} - 1
                WHERE id_jogo = %s;
            """
            cursor.execute(update_score_query, (id_jogo,))
            if cursor.rowcount == 0:
                print(f"WARNING: No rows updated for score in Jogo ID {id_jogo} after deleting Gol ID {id_gol}.")


        conn.commit() 

        return {"message": "Gol deletado com sucesso e placar da partida atualizado."}

    except MySQLError as e:
        print(f"ERRO MYSQL CAPTURADO (delete_gol): {e}")
        if conn: conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro interno ao deletar gol: {e}")
    except HTTPException as e: 
        if conn: conn.rollback() 
        raise e
    except Exception as e:
        print(f"ERRO INESPERADO NA DELEÇÃO (Gol): {e}")
        if conn: conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Ocorreu um erro inesperado ao deletar gol: {str(e)}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()    