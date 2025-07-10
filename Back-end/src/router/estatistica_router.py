from fastapi import APIRouter, Query
import pymysql

router = APIRouter(prefix="/stats", tags=["stats"])

@router.get("/jogador")
async def get_jogador_stats(nome_campeonato: str = Query(...), ano_campeonato: int = Query(...)):
    conn = pymysql.connect(
        host="mysql",
        user="root",
        port=3306,
        password="root",
        database="meu_banco",
        cursorclass=pymysql.cursors.DictCursor,
        charset="utf8mb4"
    )
    response_data = {
        "jogadores_mais_gols": [],
        "jogadores_mais_cartoes_amarelos": [],
        "jogadores_mais_cartoes_vermelhos": []
    }
    try:
        with conn.cursor() as cursor:
            query_gols = ("""
                SELECT 
                    j.c_Pnome_jogador,
                    j.c_Unome_jogador,
                    j.c_nome_time,
                    COUNT(*) AS total_gols
                FROM 
                    Jogador AS j
                    JOIN Gol AS g ON g.id_jogador = j.id_jogador
                    JOIN Jogo AS jo ON jo.id_jogo = g.id_jogo
                WHERE 
                    jo.c_nome_campeonato = %s AND
                    jo.d_ano_campeonato = %s
                GROUP BY 
                    j.id_jogador
                ORDER BY 
                    total_gols DESC
                LIMIT 10
            """)
            cursor.execute(query_gols, (nome_campeonato, ano_campeonato))
            response_data["jogadores_mais_gols"] = cursor.fetchall()

            query_amarelos = ("""
                SELECT 
                    j.c_Pnome_jogador,
                    j.c_Unome_jogador,
                    j.c_nome_time,
                    COUNT(*) AS total_cartoes_amarelos
                FROM 
                    Jogador AS j
                    JOIN Cartao AS c ON c.id_jogador = j.id_jogador
                    JOIN Jogo AS jo ON jo.id_jogo = c.id_jogo
                WHERE 
                    jo.c_nome_campeonato = %s AND
                    jo.d_ano_campeonato = %s AND
                    c.e_tipo = 'amarelo'
                GROUP BY 
                    j.id_jogador
                ORDER BY 
                    total_cartoes_amarelos DESC
                LIMIT 10
            """)
            cursor.execute(query_amarelos, (nome_campeonato, ano_campeonato))
            response_data["jogadores_mais_cartoes_amarelos"] = cursor.fetchall()

            query_vermelhos = ("""
                SELECT 
                    j.c_Pnome_jogador,
                    j.c_Unome_jogador,
                    j.c_nome_time,
                    COUNT(*) AS total_cartoes_vermelhos
                FROM 
                    Jogador AS j
                    JOIN Cartao AS c ON c.id_jogador = j.id_jogador
                    JOIN Jogo AS jo ON jo.id_jogo = c.id_jogo
                WHERE 
                    jo.c_nome_campeonato = %s AND
                    jo.d_ano_campeonato = %s AND
                    c.e_tipo = 'vermelho'
                GROUP BY 
                    j.id_jogador
                ORDER BY 
                    total_cartoes_vermelhos DESC
                LIMIT 10
            """)
            cursor.execute(query_vermelhos, (nome_campeonato, ano_campeonato))
            response_data["jogadores_mais_cartoes_vermelhos"] = cursor.fetchall()

    finally:
        conn.close()

    return response_data

@router.get("/jogador/{id_jogador}")
async def get_all_jogador_stats(id_jogador: int):
    conn = pymysql.connect(
        host="mysql",
        user="root",
        port=3306,
        password="root",
        database="meu_banco",
        cursorclass=pymysql.cursors.DictCursor,
        charset="utf8mb4"
    )

    data = {
        "gols": 0,
        "cartoes_amarelos": 0,
        "cartoes_vermelhos": 0
    }

    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) AS gols FROM Gol WHERE id_jogador = %s", (id_jogador,))
            data["gols"] = cursor.fetchone()["gols"]

            cursor.execute("SELECT COUNT(*) AS amarelos FROM Cartao WHERE id_jogador = %s AND e_tipo = 'amarelo'", (id_jogador,))
            data["cartoes_amarelos"] = cursor.fetchone()["amarelos"]

            cursor.execute("SELECT COUNT(*) AS vermelhos FROM Cartao WHERE id_jogador = %s AND e_tipo = 'vermelho'", (id_jogador,))
            data["cartoes_vermelhos"] = cursor.fetchone()["vermelhos"]

    finally:
        conn.close()

    return data

@router.get("/partidas")
async def get_estatisticas_times(nome_campeonato: str = Query(...), ano_campeonato: int = Query(...)):
    conn = pymysql.connect(
        host="mysql",
        user="root",
        port=3306,
        password="root",
        database="meu_banco",
        cursorclass=pymysql.cursors.DictCursor,
        charset="utf8mb4"
    )

    resultado = {
        "times_mais_vencem_casa": [],
        "times_mais_vencem_fora": [],
        "times_violentos": [],
        "times_fair_play": []
    }

    try:
        with conn.cursor() as cursor:

            query_casa = """
                SELECT
                    c_time_casa AS c_nome_time,
                    COUNT(*) AS vitorias_casa
                FROM
                    Jogo
                WHERE
                    c_nome_campeonato = %s
                    AND d_ano_campeonato = %s
                    AND n_placar_casa > n_placar_visitante
                GROUP BY c_time_casa
                ORDER BY vitorias_casa DESC
                LIMIT 10
            """
            cursor.execute(query_casa, (nome_campeonato, ano_campeonato))
            resultado["times_mais_vencem_casa"] = cursor.fetchall()

            query_fora = """
                SELECT
                    c_time_visitante AS c_nome_time,
                    COUNT(*) AS vitorias_fora
                FROM
                    Jogo
                WHERE
                    c_nome_campeonato = %s
                    AND d_ano_campeonato = %s
                    AND n_placar_visitante > n_placar_casa
                GROUP BY c_time_visitante
                ORDER BY vitorias_fora DESC
                LIMIT 10
            """
            cursor.execute(query_fora, (nome_campeonato, ano_campeonato))
            resultado["times_mais_vencem_fora"] = cursor.fetchall()

            query_cartoes = """
                SELECT
                    j.c_nome_time,
                    COUNT(*) AS total_cartoes
                FROM
                    Cartao AS c
                    JOIN Jogador AS j ON c.id_jogador = j.id_jogador
                    JOIN Jogo AS jo ON c.id_jogo = jo.id_jogo
                WHERE
                    jo.c_nome_campeonato = %s
                    AND jo.d_ano_campeonato = %s
                GROUP BY
                    j.c_nome_time
                ORDER BY
                    total_cartoes DESC
                LIMIT 10
            """
            cursor.execute(query_cartoes, (nome_campeonato, ano_campeonato))
            resultado["times_violentos"] = cursor.fetchall()

            query_fairplay = """
                SELECT
                    j.c_nome_time,
                    COUNT(*) AS total_cartoes
                FROM
                    Cartao AS c
                    JOIN Jogador AS j ON c.id_jogador = j.id_jogador
                    JOIN Jogo AS jo ON c.id_jogo = jo.id_jogo
                WHERE
                    jo.c_nome_campeonato = %s
                    AND jo.d_ano_campeonato = %s
                GROUP BY
                    j.c_nome_time
                ORDER BY
                    total_cartoes ASC
                LIMIT 10
            """
            cursor.execute(query_fairplay, (nome_campeonato, ano_campeonato))
            resultado["times_fair_play"] = cursor.fetchall()
    finally:
        conn.close()
    return resultado