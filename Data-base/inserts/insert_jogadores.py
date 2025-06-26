import pandas as pd
from sqlalchemy import create_engine
import sys
import os

def importar_jogadores():
        # --- 1. CONFIGURE SEUS DADOS DE CONEXÃO AO MYSQL ---
    db_user = 'root'
    db_password = os.getenv('DB_PASSWORD')
    db_host = 'localhost'
    db_name = 'campeonato_futebol'
    db_port = 3306

    csv_file_path = 'jogadores_brasileirao.csv'
    table_name = 'jogador'

    print("Iniciando o processo de importação inteligente e com limpeza de dados...")

    try:
        # --- 2. CONECTAR AO BANCO E LER DADOS EXISTENTES ---
        print("Conectando ao banco para verificar times existentes...")
        connection_string = f'mysql+mysqlconnector://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}'
        engine = create_engine(connection_string)

        # Lê a tabela de times do banco para um DataFrame
        df_times_db = pd.read_sql_table('time', engine)
        
        # **ETAPA DE LIMPEZA CRÍTICA**
        # Remove espaços em branco do início e do fim dos nomes dos times do banco
        df_times_db['c_nome_time'] = df_times_db['c_nome_time'].str.strip()
        
        # Cria um conjunto (set) de nomes de times limpos para uma verificação rápida
        times_existentes = set(df_times_db['c_nome_time'])
        print(f"Encontrados {len(times_existentes)} times existentes e limpos no banco.")

        # --- 3. LER O CSV E FILTRAR OS JOGADORES VÁLIDOS ---
        print(f"Lendo e processando o arquivo '{csv_file_path}'...")
        df_jogadores = pd.read_csv(csv_file_path)

        # **ETAPA DE LIMPEZA CRÍTICA**
        # Remove espaços em branco do início e do fim dos nomes dos times no CSV
        df_jogadores['c_nome_time'] = df_jogadores['c_nome_time'].str.strip()
        
        # Tratamento das outras colunas que podem ser nulas
        df_jogadores['d_data_nascimento'] = pd.to_datetime(df_jogadores['d_data_nascimento'], errors='coerce')
        
        # Guarda o número original de jogadores para relatório final
        total_jogadores_csv = len(df_jogadores)
        
        # Filtra o DataFrame, mantendo apenas os jogadores cujo time EXISTE no conjunto de times do banco
        df_para_inserir = df_jogadores[df_jogadores['c_nome_time'].isin(times_existentes)].copy()
        
        jogadores_invalidos = total_jogadores_csv - len(df_para_inserir)

        if jogadores_invalidos > 0:
            print(f"\nAVISO: {jogadores_invalidos} jogador(es) foram ignorados pois seus times não foram encontrados na tabela 'time'.")
            # Para depurar, você pode ver quais times estão causando o problema:
            times_no_csv = set(df_jogadores['c_nome_time'])
            times_problematicos = times_no_csv - times_existentes
            print(f"Times problemáticos (não encontrados no banco): {times_problematicos}")


        if df_para_inserir.empty:
            print("\nNenhum jogador com time válido para inserir.")
        else:
            print(f"\nProcessamento concluído. {len(df_para_inserir)} jogadores válidos serão inseridos.")
            
            # --- 4. INSERIR APENAS OS JOGADORES VÁLIDOS ---
            df_para_inserir.to_sql(name=table_name, con=engine, if_exists='append', index=False, chunksize=1000)
            print("\nSUCESSO! Novos jogadores inseridos.")

    except Exception as e:
        print(f"\nERRO: Ocorreu um problema: {e}")
    pass

if __name__ == "__main__":
    importar_jogadores()
