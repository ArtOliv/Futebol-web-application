import pymysql
from pymysql.err import IntegrityError, MySQLError
from fastapi import HTTPException, status
from typing import List, Dict, Any, Optional 
from datetime import datetime 

from src.models.partida.partida_model import PartidaCreate



def get_all_ordered_partida(nome_campeonato: str, ano_campeonato: int):
    conn = None
    try:
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

        with conn.cursor() as cursor:
            query = (
                "SELECT "
                    "p.c_nome_campeonato, "
                    "p.id_jogo, "
                    "p.dt_data_horario, "
                    "p.n_rodada, "
                    "p.n_placar_casa, "
                    "p.n_placar_visitante, "
                    "p.c_time_casa, "
                    "p.c_time_visitante, "
                    "e.c_nome_estadio, "
                    "p.c_status, " 
                    "p.d_ano_campeonato " 
                "FROM Jogo AS p "
                "JOIN Estadio AS e ON e.c_nome_estadio = p.c_nome_estadio "
                "WHERE p.c_nome_campeonato = %s AND p.d_ano_campeonato = %s "
                "ORDER BY p.dt_data_horario ASC;"
            )
            cursor.execute(query, (nome_campeonato, ano_campeonato))
            result = cursor.fetchall()
        return result
    except MySQLError as e:
        print(f"ERRO MYSQL CAPTURADO (get_all_ordered_partida): {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro interno ao buscar partidas ordenadas: {e}")
    except Exception as e:
        print(f"ERRO INESPERADO (get_all_ordered_partida): {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Ocorreu um erro inesperado ao buscar partidas ordenadas: {str(e)}")
    finally:
        if conn:
            conn.close()

def get_partidas_por_time(nome_time: str):
    conn = None
    try:
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

        with conn.cursor() as cursor:
            query = (
                "SELECT "
                    "j.id_jogo, "
                    "j.dt_data_horario, "
                    "j.c_nome_campeonato, "
                    "j.c_time_casa, "
                    "j.c_time_visitante, "
                    "j.n_placar_casa, "
                    "j.n_placar_visitante, "
                    "j.d_ano_campeonato " # <-- Inclua d_ano_campeonato se necessário
                "FROM Jogo AS j "
                "WHERE j.c_time_casa = %s OR j.c_time_visitante = %s "
                "ORDER BY j.dt_data_horario DESC;"
            )
            cursor.execute(query, (nome_time, nome_time))
            return cursor.fetchall()
    except MySQLError as e:
        print(f"ERRO MYSQL CAPTURADO (get_partidas_por_time): {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro interno ao buscar partidas por time: {e}")
    except Exception as e:
        print(f"ERRO INESPERADO (get_partidas_por_time): {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Ocorreu um erro inesperado ao buscar partidas por time: {str(e)}")
    finally:
        if conn:
            conn.close()

# --- FUNÇÃO DE INSERÇÃO (insert_partida) ---

def insert_partida(partida_data: PartidaCreate, nome_campeonato: str, ano_campeonato: int) -> Dict[str, Any]:
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
            # 1. Verificar se o CAMPEONATO existe (importante para FK)
            cursor.execute("SELECT c_nome_campeonato FROM Campeonato WHERE c_nome_campeonato = %s AND d_ano_campeonato = %s",
                           (nome_campeonato, ano_campeonato))
            campeonato_exists = cursor.fetchone()
            if not campeonato_exists:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Campeonato '{nome_campeonato} ({ano_campeonato})' não encontrado.")

            # 2. Verificar se os TIMES (Mandante/Visitante) existem (se forem FKs e forem fornecidos)
            if partida_data.c_time_casa:
                cursor.execute("SELECT c_nome_time FROM Time WHERE c_nome_time = %s", (partida_data.c_time_casa,))
                if not cursor.fetchone():
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Time mandante '{partida_data.c_time_casa}' não encontrado.")
            if partida_data.c_time_visitante:
                cursor.execute("SELECT c_nome_time FROM Time WHERE c_nome_time = %s", (partida_data.c_time_visitante,))
                if not cursor.fetchone():
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Time visitante '{partida_data.c_time_visitante}' não encontrado.")

            # 3. Verificar se o ESTÁDIO existe (se for FK e for fornecido)
            if partida_data.c_nome_estadio:
                cursor.execute("SELECT c_nome_estadio FROM Estadio WHERE c_nome_estadio = %s", (partida_data.c_nome_estadio,))
                if not cursor.fetchone():
                    raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Estádio '{partida_data.c_nome_estadio}' não encontrado.")

            # 4. Combinar data e hora para o campo DATETIME do BD
            try:
                # dt_data_str: "YYYY-MM-DD", hr_horario_str: "HH:MM"
                combined_datetime_str = f"{partida_data.dt_data_str} {partida_data.hr_horario_str}:00" # Adiciona segundos
                dt_data_horario_obj = datetime.strptime(combined_datetime_str, '%Y-%m-%d %H:%M:%S')
            except ValueError:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Formato de data/hora inválido. Use YYYY-MM-DD e HH:MM.")

            # 5. Inserir a Partida
            sql_insert_partida = """
            INSERT INTO Jogo (
                dt_data_horario,
                n_rodada,
                n_placar_casa,
                n_placar_visitante,
                c_nome_campeonato,
                d_ano_campeonato,
                c_nome_estadio,
                c_time_casa,
                c_time_visitante,
                c_status
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
            """
            values_to_insert = (
                dt_data_horario_obj,
                partida_data.n_rodada,
                0, # n_placar_casa (padrão)
                0, # n_placar_visitante (padrão)
                nome_campeonato,
                ano_campeonato,
                partida_data.c_nome_estadio,
                partida_data.c_time_casa,
                partida_data.c_time_visitante,
                "Agendado" # c_status (padrão)
            )

            cursor.execute(sql_insert_partida, values_to_insert)
            conn.commit()

            # Opcional: Recuperar a partida recém-inserida para retorno no FastAPI
            cursor.execute("SELECT LAST_INSERT_ID() as id_jogo;")
            last_id = cursor.fetchone()['id_jogo']
            # Para retornar o objeto completo, você precisaria de uma SELECT para buscar a partida por id_jogo
            # e mapear para o modelo Partida.
            # No momento, o router espera uma mensagem simples, então retornamos isso.
            return {"message": "Partida cadastrada com sucesso!"}

    except IntegrityError as e:
        if conn:
            conn.rollback()
        error_message_lower = str(e).lower()
        if 'foreign key constraint fails' in error_message_lower:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Erro de associação: Verifique se Campeonato, Estádio e Times existem e estão corretos. Detalhes: {e}")
        elif 'duplicate entry' in error_message_lower:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"Conflito de dados: Partida já existente ou violação de chave única. Detalhes: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Erro de integridade ao cadastrar partida: {e}")
    except KeyError as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=f"Dados da partida incompletos ou incorretos: campo '{e}' ausente no payload da requisição.")
    except (ValueError, TypeError) as e:
        if conn:
            conn.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Erro de formato de dados: {e}")
    except MySQLError as e:
        print(f"ERRO MYSQL CAPTURADO (insert_partida): {e}")
        if conn:
            conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro interno do servidor ao cadastrar partida: {e}")
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"ERRO INESPERADO NA INSERÇÃO (Partida): {e}")
        if conn:
            conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Ocorreu um erro interno inesperado no servidor: {str(e)}")
    finally:
        if conn:
            conn.close()

# --- FUNÇÃO DE DELEÇÃO (delete_partida) ---

def delete_partida(id_partida: int):
    conn = None
    try:
        conn = pymysql.connect(
            host="localhost",
            user="root",
            port=3308,
            password="root",
            database="campeonato_futebol",
            charset="utf8mb4"
        )
        conn.query("SET NAMES utf8mb4;")

        with conn.cursor() as cursor:
            query = ("DELETE FROM "
                        "Jogo "
                     "WHERE id_jogo = %s;")
            cursor.execute(query, id_partida)
            conn.commit()
            return {"message": "Partida deletada com sucesso!"} # Retorne uma mensagem de sucesso
    except MySQLError as e:
        print(f"ERRO MYSQL CAPTURADO (delete_partida): {e}")
        if conn: conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro interno ao deletar partida: {e}")
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"ERRO INESPERADO NA DELEÇÃO (Partida): {e}")
        if conn: conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Ocorreu um erro inesperado ao deletar partida: {str(e)}")
    finally:
        if conn:
            conn.close()

# --- FUNÇÃO PARA DROPDOWN (get_partidas_for_dropdown) ---

def get_partidas_for_dropdown(
    nome_campeonato: Optional[str] = None,
    ano_campeonato: Optional[int] = None
) -> List[Dict[str, Any]]:
    conn = None
    try:
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

        with conn.cursor() as cursor:
            query = """
                SELECT
                    id_jogo,
                    c_time_casa,
                    c_time_visitante,
                    n_rodada,
                    dt_data_horario,
                    c_nome_campeonato,
                    d_ano_campeonato
                FROM Jogo
                WHERE 1=1
            """
            params = []

            if nome_campeonato:
                query += " AND c_nome_campeonato = %s"
                params.append(nome_campeonato)
            if ano_campeonato:
                query += " AND d_ano_campeonato = %s"
                params.append(ano_campeonato)

            query += " ORDER BY dt_data_horario DESC"

            cursor.execute(query, params)
            results = cursor.fetchall()
            return results

    except MySQLError as e:
        print(f"ERRO MYSQL CAPTURADO (get_partidas_for_dropdown): {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro interno ao buscar partidas para dropdown: {e}")
    except Exception as e:
        print(f"ERRO INESPERADO (get_partidas_for_dropdown): {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Ocorreu um erro inesperado ao buscar partidas para dropdown: {str(e)}")
    finally:
        if conn:
            conn.close()