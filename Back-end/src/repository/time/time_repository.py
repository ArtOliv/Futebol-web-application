from fastapi import HTTPException, status
from pymysql.err import IntegrityError

import pymysql
from pymysql.err import IntegrityError, MySQLError, OperationalError
from collections import defaultdict

from decimal import Decimal
from src.models.cartao.cartao_model import Cartao
from src.models.time.time_model import Time
from src.parser.time_parser import parse_time, parse_list_times
from src.constant.posicao_enum import Posicao
from src.models.jogador.jogador_model import Jogador
from src.models.classificacao.classific_model import Classificacao

from src.database import get_db_connection

def get_time(nome_time: str):
    conn = pymysql.connect(
        host="mysql",
        port=3306,
        user="root",
        password="root",
        database="meu_banco",
        cursorclass=pymysql.cursors.DictCursor,
        charset="utf8mb4"
    )

    conn.query("SET NAMES utf8mb4;")

    try:
        with conn.cursor() as cursor:
            query = """
                SELECT 
                    t.c_nome_time, 
                    t.c_cidade_time, 
                    t.c_tecnico_time,
                    j.id_jogador,
                    CONCAT(j.c_Pnome_jogador, ' ', IFNULL(j.c_Unome_jogador, '')) AS nome_jogador,
                    j.c_posicao, -- <--- ALTERADO: Seleciona c_posicao
                    j.n_camisa,  -- <--- ALTERADO: Seleciona n_camisa para o display
                    t.c_nome_time AS nome_time_jogador -- <--- ALTERADO: Seleciona o nome do time para o jogador, se precisar
                FROM Time t
                LEFT JOIN Jogador j ON j.c_nome_time = t.c_nome_time
                WHERE t.c_nome_time = %s;
            """
            cursor.execute(query, (nome_time,))
            rows = cursor.fetchall()
    finally:
        conn.close()

    if not rows:
        return None # Retorna None se o time não for encontrado

    time_info = {
        "name": rows[0]["c_nome_time"],
        "city": rows[0]["c_cidade_time"],
        "coach": rows[0]["c_tecnico_time"],
        "players": []
    }

    # Mapeamento para labels de posição (igual ao que você tem no frontend)
    positionLabels = {
        0: 'Goleiro',
        1: 'Zagueiro',
        2: 'Lateral Esquerdo',
        3: 'Lateral Direito',
        4: 'Meio Campista',
        5: 'Atacante',
    }

    for row in rows:
        if row["id_jogador"]: 
            jogador_posicao_num = row["c_posicao"] 
            jogador_posicao_label = None
            if jogador_posicao_num is not None:
                try:
                    jogador_posicao_label = positionLabels.get(jogador_posicao_num, 'N/A')
                except Exception:
                    jogador_posicao_label = 'N/A' 

            time_info["players"].append({
                "id": row["id_jogador"],
                "nome": row["nome_jogador"], 
                "posicao_label": jogador_posicao_label, 
                "n_camisa": row["n_camisa"], 
                "nome_time": row["nome_time_jogador"]
            })

    return time_info

def insert_time(time: Time, nome_campeonato: str, ano_campeonato: int) -> str:
    conn = None
    cursor = None
    message = ""

    try:
        conn = get_db_connection()
        conn.query("SET NAMES utf8mb4;")
        cursor = conn.cursor(pymysql.cursors.DictCursor)

        # 1. INSERT/UPDATE INTO Time
        cursor.execute("SELECT COUNT(*) AS count FROM Time WHERE c_nome_time = %s", (time.c_nome_time,))
        time_exists_in_db = cursor.fetchone()['count'] > 0

        update_clauses_time = []
        if time.c_cidade_time is not None:
            update_clauses_time.append("c_cidade_time = VALUES(c_cidade_time)")
        if time.c_tecnico_time is not None:
            update_clauses_time.append("c_tecnico_time = VALUES(c_tecnico_time)")

        if update_clauses_time:
            update_part_time = ", ".join(update_clauses_time)
            query_time = (f"INSERT INTO Time (c_nome_time, c_cidade_time, c_tecnico_time) "
                          f"VALUES (%s, %s, %s) "
                          f"ON DUPLICATE KEY UPDATE {update_part_time};")
            cursor.execute(query_time, (time.c_nome_time, time.c_cidade_time, time.c_tecnico_time))
        else:
             query_time = ("INSERT INTO Time (c_nome_time, c_cidade_time, c_tecnico_time) VALUES (%s, %s, %s) ON DUPLICATE KEY UPDATE c_nome_time = VALUES(c_nome_time);")
             cursor.execute(query_time, (time.c_nome_time, time.c_cidade_time, time.c_tecnico_time))

        if time_exists_in_db:
            message = f"Time '{time.c_nome_time}' existente atualizado."
        else:
            message = f"Time '{time.c_nome_time}' cadastrado."


        # 2. INSERT/UPDATE INTO Jogador(es)
        if time.jogadores: # Garante que só executa se houver jogadores
            query_jogador = ("INSERT INTO "
                    "Jogador "
                    "(c_Pnome_jogador, c_Unome_jogador, n_camisa, d_data_nascimento, c_posicao, c_nome_time) "
                    "VALUES (%s, %s, %s, %s, %s, %s) "
                    "ON DUPLICATE KEY UPDATE "
                    "d_data_nascimento = VALUES(d_data_nascimento), "
                    "c_posicao = VALUES(c_posicao), "
                    "c_nome_time = VALUES(c_nome_time), "
                    "c_Unome_jogador = VALUES(c_Unome_jogador), "
                    "n_camisa = VALUES(n_camisa);")
            for jogador in time.jogadores:
                # --- CORREÇÃO DA POSIÇÃO AQUI ---
                jogador_posicao_para_db = None
                if jogador.c_posicao is not None: # Verifica se a instância do enum não é None
                    try:
                        jogador_posicao_para_db = str(jogador.c_posicao) # Converte a instância do enum para string
                    except Exception as e:
                        print(f"AVISO (Repository): Erro ao converter Posicao para string '{jogador.c_posicao}'. Setando para NULL. Erro: {e}")
                        jogador_posicao_para_db = None
                # --- FIM DA CORREÇÃO ---

                cursor.execute(query_jogador, (
                    jogador.c_Pnome_jogador,
                    jogador.c_Unome_jogador,
                    jogador.n_camisa,
                    jogador.d_data_nascimento,
                    jogador_posicao_para_db, # <-- USA A STRING FORMATADA AQUI
                    time.c_nome_time
                ))
            message += f" Jogador(es) para '{time.c_nome_time}' inseridos/atualizados."


        # 3. INSERT INTO Time_participa_campeonato
        query_participa = ("INSERT INTO "
                "Time_participa_campeonato (c_nome_time, c_nome_campeonato, d_ano_campeonato) "
                "VALUES (%s, %s, %s) "
                "ON DUPLICATE KEY UPDATE "
                "c_nome_time = VALUES(c_nome_time);")
        cursor.execute(query_participa, (time.c_nome_time, nome_campeonato, ano_campeonato))
        message += f" Associado ao campeonato '{nome_campeonato} ({ano_campeonato})'."


        # 4. INSERT/UPDATE INTO Classificacao
        query_classificacao = ("INSERT INTO "
                "Classificacao (c_nome_campeonato, d_ano_campeonato, c_nome_time, "
                "n_vitorias, n_empates, n_derrotas, n_gols_pro, n_gols_contra) "
                "VALUES (%s, %s, %s, %s, %s, %s, %s, %s) "
                "ON DUPLICATE KEY UPDATE "
                "n_vitorias = n_vitorias, "
                "n_empates = n_empates, "
                "n_derrotas = n_derrotas, "
                "n_gols_pro = n_gols_pro, "
                "n_gols_contra = n_gols_contra; ")

        initial_stats = {
            "n_vitorias": 0, "n_empates": 0, "n_derrotas": 0,
            "n_gols_pro": 0, "n_gols_contra": 0
        }

        cursor.execute(query_classificacao, (
            nome_campeonato,
            ano_campeonato,
            time.c_nome_time,
            initial_stats["n_vitorias"],
            initial_stats["n_empates"],
            initial_stats["n_derrotas"],
            initial_stats["n_gols_pro"],
            initial_stats["n_gols_contra"]
        ))
        message += f" Classificação para '{time.c_nome_time}' no campeonato inicializada/existente."

        conn.commit()
        return message

    except IntegrityError as e:
        print(f"ERRO DE INTEGRIDADE CAPTURADO: {e}")
        if conn: conn.rollback()
        error_message = str(e).lower()
        if 'foreign key constraint fails' in error_message and ('fk_campeonato_time_participa' in error_message or 'foreign key (`c_nome_campeonato`, `d_ano_campeonato`) references `campeonato`' in error_message):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"O campeonato '{nome_campeonato} ({ano_campeonato})' não existe. Detalhes: {e}")
        elif 'foreign key constraint fails' in error_message and ('fk_time_time_participa' in error_message or 'foreign key (`c_nome_time`) references `time`' in error_message):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"O time '{time.c_nome_time}' não existe. Detalhes: {e}")
        elif 'duplicate entry' in error_message:
             raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"Conflito de dados: O time já está cadastrado neste campeonato ou violação de chave única. Detalhes: {e}")
        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Erro de banco de dados inesperado: {str(e)}")

    except (MySQLError, OperationalError) as e:
        print(f"ERRO MYSQL CAPTURADO: {e}")
        if conn: conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro interno no servidor ao acessar o banco de dados: {str(e)}")

    except Exception as e:
        print(f"ERRO INESPERADO NA INSERÇÃO: {e}")
        if conn: conn.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Ocorreu um erro interno inesperado no servidor: {str(e)}")

    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


def delete_time(nome_time: str):
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
                        "Time "
                     "WHERE c_nome_time = %s;")
            cursor.execute(query, nome_time)
    finally:
        conn.commit()
        conn.close()

def update_time(time: Time):
    conn = pymysql.connect(
        host="mysql",
        user="root",
        port=3306,
        password="root",
        database="meu_banco",
        charset="utf8mb4"
    )
    try:
        with conn.cursor() as cursor:
            query = ("UPDATE "
                        "Time "
                     "SET "
                        "c_cidade_time = %s, "
                        "c_tecnico_time = %s "
                     "WHERE c_nome_time = %s;")
            cursor.execute(query, (time.c_cidade_time, time.c_tecnico_time, time.c_nome_time))
    finally:
        conn.commit()
        conn.close()



if __name__ == "__main__":
    team = get_time("Flamengo")

    print(team)
    # for row in team:
    #     print(row)
    # time = parse_time(team
