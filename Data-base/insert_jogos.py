import pandas as pd
import mysql.connector
from datetime import datetime

# --- Configurações do Banco de Dados ---
# Substitua com suas credenciais do MySQL
DB_CONFIG = {
    'host': 'localhost',
    'user': 'root',
    'password': #senha,
    'database': 'campeonato_futebol'
}

# --- Caminho para o arquivo CSV ---
CSV_FILE_PATH = 'campeonato-brasileiro-2023-jogos.csv'

def insert_data_from_csv():
    """
    Lê o arquivo CSV e insere os dados no banco de dados MySQL.
    """
    try:
        # Conectar ao banco de dados MySQL
        conn = mysql.connector.connect(**DB_CONFIG)
        cursor = conn.cursor()
        print("Conectado ao banco de dados MySQL com sucesso!")

        # Ler o arquivo CSV
        df = pd.read_csv(CSV_FILE_PATH)
        print(f"Arquivo CSV '{CSV_FILE_PATH}' lido com sucesso. Total de {len(df)} linhas.")

        # --- Inserir dados na tabela Campeonato ---
        # Como o Brasileirão 2023 já está inserido, podemos pular ou garantir a inserção
        print("Verificando e inserindo dados na tabela 'Campeonato' (se necessário)...")
        campeonato_nome = 'Brasileirão 2023'
        campeonato_ano = 2023
        try:
            cursor.execute("INSERT IGNORE INTO Campeonato (c_nome_campeonato, d_ano_campeonato) VALUES (%s, %s)",
                           (campeonato_nome, campeonato_ano))
            conn.commit()
            print(f"Campeonato '{campeonato_nome} {campeonato_ano}' verificado/inserido.")
        except mysql.connector.Error as err:
            print(f"Erro ao inserir campeonato: {err}")
            conn.rollback()


        # --- Inserir dados na tabela Time ---
        print("Verificando e inserindo dados na tabela 'Time'...")
        times_casa = df['c_time_casa'].unique()
        times_visitante = df['c_time_visitante'].unique()
        all_teams = pd.concat([pd.Series(times_casa), pd.Series(times_visitante)]).unique()

        for team_name in all_teams:
            try:
                # Usar INSERT IGNORE para evitar duplicatas e erro se já existir
                cursor.execute("INSERT IGNORE INTO Time (c_nome_time) VALUES (%s)", (team_name,))
                conn.commit()
            except mysql.connector.Error as err:
                print(f"Erro ao inserir time '{team_name}': {err}")
                conn.rollback()
        print("Inserção de times concluída.")

        # --- Inserir dados na tabela Time_participa_campeonato ---
        print("Verificando e inserindo dados na tabela 'Time_participa_campeonato'...")
        for team_name in all_teams:
            try:
                cursor.execute("""
                    INSERT IGNORE INTO Time_participa_campeonato (c_nome_time, c_nome_campeonato, d_ano_campeonato)
                    VALUES (%s, %s, %s)
                """, (team_name, campeonato_nome, campeonato_ano))
                conn.commit()
            except mysql.connector.Error as err:
                print(f"Erro ao inserir participação do time '{team_name}' no campeonato: {err}")
                conn.rollback()
        print("Inserção de participações de times no campeonato concluída.")


        # --- Inserir dados na tabela Estadio ---
        print("Verificando e inserindo dados na tabela 'Estadio'...")
        estadios = df['c_nome_estadio'].unique()
        for estadio_name in estadios:
            try:
                # Usar INSERT IGNORE para evitar duplicatas e erro se já existir
                # Assumimos valores padrão para cidade_estadio e capacidade
                cursor.execute("INSERT IGNORE INTO Estadio (c_nome_estadio, c_cidade_estadio, n_capacidade) VALUES (%s, %s, %s)",
                               (estadio_name, 'Desconhecida', 0)) # Valores padrão
                conn.commit()
            except mysql.connector.Error as err:
                print(f"Erro ao inserir estádio '{estadio_name}': {err}")
                conn.rollback()
        print("Inserção de estádios concluída.")

        # --- Inserir dados na tabela Jogo ---
        print("Iniciando a inserção de dados na tabela 'Jogo'...")
        for index, row in df.iterrows():
            data_hora_str = f"{row['data']} {row['hora']}"
            try:
                # Converter string para objeto datetime
                dt_object = datetime.strptime(data_hora_str, '%Y-%m-%d %H:%M')
            except ValueError:
                print(f"Erro de formato de data/hora na linha {index}: '{data_hora_str}'. Pulando esta linha.")
                continue

            # Certifique-se de que as colunas numéricas são int
            placar_casa = int(row['n_placar_casa'])
            placar_visitante = int(row['n_placar_visitante'])
            rodada = int(row['n_rodada'])


            # Inserir na tabela Jogo
            try:
                cursor.execute("""
                    INSERT INTO Jogo (dt_data_horario, n_rodada, n_placar_casa, n_placar_visitante,
                                      c_nome_campeonato, d_ano_campeonato, c_nome_estadio,
                                      c_time_casa, c_time_visitante)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (dt_object, rodada, placar_casa, placar_visitante,
                      campeonato_nome, campeonato_ano, row['c_nome_estadio'],
                      row['c_time_casa'], row['c_time_visitante']))
                conn.commit()
            except mysql.connector.Error as err:
                # Tratar erros de inserção, por exemplo, se um jogo já existe (embora id_jogo seja auto_increment)
                # Ou se alguma chave estrangeira não foi resolvida (o que não deveria acontecer se as inserções anteriores funcionaram)
                if "Duplicate entry" in str(err) and "for key 'PRIMARY'" in str(err):
                    print(f"Jogo duplicado na linha {index}: {err}. Ignorando.")
                else:
                    print(f"Erro ao inserir jogo na linha {index}: {err}")
                    conn.conn_rollback() # usar conn.rollback() para reverter a transação atual
        print("Inserção de jogos concluída.")

    except FileNotFoundError:
        print(f"Erro: O arquivo CSV '{CSV_FILE_PATH}' não foi encontrado.")
    except mysql.connector.Error as err:
        print(f"Erro de conexão ou consulta ao banco de dados: {err}")
    except Exception as e:
        print(f"Ocorreu um erro inesperado: {e}")
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()
            print("Conexão MySQL fechada.")

if __name__ == "__main__":
    insert_data_from_csv()
