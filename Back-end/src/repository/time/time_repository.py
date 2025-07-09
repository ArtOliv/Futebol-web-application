from fastapi import HTTPException
from pymysql.err import IntegrityError

import pymysql
from pymysql.err import IntegrityError
from collections import defaultdict

from decimal import Decimal
from src.models.cartao.cartao_model import Cartao
from src.models.time.time_model import Time
from src.parser.time_parser import parse_time, parse_list_times
from src.constant.posicao_enum import Posicao
from src.models.jogador.jogador_model import Jogador
from src.models.classificacao.classific_model import Classificacao


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

def insert_time(time: Time, nome_campeonato: str, ano_campeonato: int):
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
            # 1. INSERT/UPDATE INTO Time (esta parte está correta)
            query_time = ("INSERT INTO "
                     "Time (c_nome_time, c_cidade_time, c_tecnico_time)"
                     "VALUES (%s, %s, %s) "
                     "ON DUPLICATE KEY UPDATE "
                     "c_cidade_time = VALUES(c_cidade_time), "
                     "c_tecnico_time = VALUES(c_tecnico_time);")
            cursor.execute(query_time, (time.c_nome_time, time.c_cidade_time, time.c_tecnico_time))

            # 2. INSERT/UPDATE INTO Jogador(es) (esta parte está correta)
            if time.jogadores:
                query_jogador = ("INSERT INTO "
                        "Jogador "
                        "(c_Pnome_jogador"
                        ", c_Unome_jogador, "
                        "n_camisa, "
                        "d_data_nascimento, "
                        "c_posicao, "
                        "c_nome_time) "
                        "VALUES (%s, %s, %s, %s, %s, %s) "
                        "ON DUPLICATE KEY UPDATE "
                        "d_data_nascimento = VALUES(d_data_nascimento), "
                        "c_posicao = VALUES(c_posicao), "
                        "c_nome_time = VALUES(c_nome_time);")
                for jogador in time.jogadores:
                    cursor.execute(query_jogador, (
                        jogador.c_Pnome_jogador,
                        jogador.c_Unome_jogador,
                        jogador.n_camisa,
                        jogador.d_data_nascimento,
                        jogador.c_posicao.value,
                        time.c_nome_time
                    ))
            # 3. INSERT INTO Time_participa_campeonato (esta parte está correta)
            query_participa = ("INSERT INTO "
                    "Time_participa_campeonato (c_nome_time, c_nome_campeonato, d_ano_campeonato) "
                    "VALUES (%s, %s, %s);")
            cursor.execute(query_participa, (time.c_nome_time, nome_campeonato, ano_campeonato))

            # 4. INSERT/UPDATE INTO Classificacao (CORREÇÃO AQUI!)
            query_classificacao = ("INSERT INTO "
                    "Classificacao (c_nome_campeonato, d_ano_campeonato, c_nome_time, "
                    "n_vitorias, n_empates, n_derrotas, n_gols_pro, n_gols_contra) " # Removidas colunas geradas
                    "VALUES (%s, %s, %s, %s, %s, %s, %s, %s) "
                    "ON DUPLICATE KEY UPDATE "
                    "n_vitorias = VALUES(n_vitorias), " # Exemplo de atualização, você pode adicionar outras colunas
                    "n_empates = VALUES(n_empates), "
                    "n_derrotas = VALUES(n_derrotas), "
                    "n_gols_pro = VALUES(n_gols_pro), "
                    "n_gols_contra = VALUES(n_gols_contra);")

            # Valores iniciais para as estatísticas
            initial_wins = 0
            initial_draws = 0
            initial_losses = 0
            initial_goals_for = 0
            initial_goals_against = 0

            cursor.execute(query_classificacao, (
                nome_campeonato,
                ano_campeonato,
                time.c_nome_time,
                initial_wins,
                initial_draws,
                initial_losses,
                initial_goals_for,
                initial_goals_against
            ))

            conn.commit()

    except IntegrityError as e:
        print(f"ERRO DE INTEGRIDADE CAPTURADO: {e}")
        error_message = str(e).lower()
        if 'foreign key constraint fails' in error_message and 'fk_campeonato_classificacao' in error_message: # Usar o nome correto da FK
            raise HTTPException(status_code=400, detail="Esse campeonato não existe ou a FK do campeonato na classificacao falhou.")
        elif 'foreign key constraint fails' in error_message and 'fk_time_classificacao' in error_message: # Usar o nome correto da FK
            raise HTTPException(status_code=400, detail="O time não existe ou a FK do time na classificacao falhou.")
        elif 'duplicate entry' in error_message and 'classificacao.primary' in error_message:
             raise HTTPException(status_code=400, detail="O time já está cadastrado neste campeonato na classificação.")
        else:
            raise HTTPException(status_code=400, detail=f"Erro de banco de dados inesperado: {str(e)}")

    except MySQLError as e:
        print(f"ERRO MYSQL CAPTURADO: {e}")
        raise HTTPException(status_code=500, detail=f"Erro interno no servidor ao acessar o banco de dados: {str(e)}")

    except Exception as e:
        print(f"ERRO INESPERADO NA INSERÇÃO: {e}")
        raise HTTPException(status_code=500, detail=f"Ocorreu um erro interno inesperado no servidor: {str(e)}")

    finally:
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
