import pandas as pd
from sqlalchemy import create_engine
import sys
import os

def importar_jogos():

    db_user = 'root'
    db_password = os.getenv('DB_PASSWORD') 
    db_host = os.getenv('DB_HOST')
    db_name = 'meu_banco' 
    db_port = os.getenv('DB_PORT')

    script_dir = os.path.dirname(os.path.abspath(__file__))
    csv_file_path = os.path.join(script_dir, 'jogos_brasileirão1.csv')
    table_name = 'jogo'

    print("--- Iniciando o processo de importação de jogos ---")

    try:
        # --- 2. CONECTAR AO BANCO E OBTER DADOS PARA VALIDAÇÃO ---
        print("Conectando ao banco para verificar dados existentes (Times, Estádios, Campeonatos)...")
        connection_string = f'mysql+mysqlconnector://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}'
        engine = create_engine(connection_string)

        # Carrega dados das tabelas relacionadas para validação
        df_times_db = pd.read_sql_table('time', engine)
        df_estadios_db = pd.read_sql_table('estadio', engine)
        df_campeonatos_db = pd.read_sql_table('campeonato', engine)

        # **ETAPA DE LIMPEZA CRÍTICA**
        # Remove espaços em branco que podem causar problemas de correspondência
        df_times_db['c_nome_time'] = df_times_db['c_nome_time'].str.strip()
        df_estadios_db['c_nome_estadio'] = df_estadios_db['c_nome_estadio'].str.strip()
        df_campeonatos_db['c_nome_campeonato'] = df_campeonatos_db['c_nome_campeonato'].str.strip()

        # Cria conjuntos (sets) para uma verificação de existência muito rápida
        times_existentes = set(df_times_db['c_nome_time'])
        estadios_existentes = set(df_estadios_db['c_nome_estadio'])
        # Para campeonatos, a chave é composta (nome, ano)
        campeonatos_existentes = set(zip(df_campeonatos_db['c_nome_campeonato'], df_campeonatos_db['d_ano_campeonato']))
        
        print(f"Encontrados: {len(times_existentes)} times, {len(estadios_existentes)} estádios, {len(campeonatos_existentes)} campeonatos.")

        # --- 3. LER E PROCESSAR O ARQUIVO CSV ---
        print(f"Lendo e processando o arquivo '{csv_file_path}'...")
        df_jogos = pd.read_csv(csv_file_path)
        total_jogos_csv = len(df_jogos)

        # **ETAPA DE LIMPEZA E TRANSFORMAÇÃO NO CSV**
        df_jogos['c_time_casa'] = df_jogos['c_time_casa'].str.strip()
        df_jogos['c_time_visitante'] = df_jogos['c_time_visitante'].str.strip()
        df_jogos['c_nome_estadio'] = df_jogos['c_nome_estadio'].str.strip()
        df_jogos['c_nome_campeonato'] = df_jogos['c_nome_campeonato'].str.strip()

        # Combina data e hora em uma única coluna de datetime
        df_jogos['dt_data_horario'] = pd.to_datetime(df_jogos['data'] + ' ' + df_jogos['hora'], errors='coerce')
        
        # Remove linhas onde a conversão de data/hora falhou
        df_jogos.dropna(subset=['dt_data_horario'], inplace=True)

        # --- 4. FILTRAR JOGOS VÁLIDOS ---
        # Filtra o DataFrame, mantendo apenas os jogos cujas chaves estrangeiras são válidas
        df_para_inserir = df_jogos[
            df_jogos['c_time_casa'].isin(times_existentes) &
            df_jogos['c_time_visitante'].isin(times_existentes) &
            df_jogos['c_nome_estadio'].isin(estadios_existentes) &
            df_jogos.apply(lambda row: (row['c_nome_campeonato'], row['d_ano_campeonato']) in campeonatos_existentes, axis=1)
        ].copy()

        jogos_invalidos = total_jogos_csv - len(df_para_inserir)
        if jogos_invalidos > 0:
            print(f"\nAVISO: {jogos_invalidos} jogo(s) foram ignorados por inconsistências com o banco de dados.")
            # Para depurar, você pode adicionar lógicas para identificar os dados problemáticos

        if df_para_inserir.empty:
            print("\nNenhum jogo válido para inserir. Verifique as inconsistências mencionadas acima.")
        else:
            print(f"\nProcessamento concluído. {len(df_para_inserir)} jogos válidos serão inseridos no banco.")
            
            # --- 5. INSERIR OS DADOS VÁLIDOS ---
            # Seleciona e renomeia colunas para corresponder exatamente à tabela do banco
            df_final = df_para_inserir[[
                'dt_data_horario', 'n_rodada',
                'c_nome_campeonato', 'd_ano_campeonato', 'c_nome_estadio',
                'c_time_casa', 'c_time_visitante'
            ]]

            # Insere os dados usando to_sql, que é otimizado para inserções em lote
            df_final.to_sql(name=table_name, con=engine, if_exists='append', index=False, chunksize=1000)
            print(f"\nSUCESSO! {len(df_final)} novos jogos inseridos na tabela '{table_name}'.")

    except FileNotFoundError:
        print(f"\nERRO CRÍTICO: O arquivo CSV '{csv_file_path}' não foi encontrado. Verifique o caminho.")
    except Exception as e:
        print(f"\nERRO CRÍTICO: Ocorreu um problema durante a execução: {e}")
        print("Verifique suas credenciais de banco de dados, nomes de tabelas/colunas e se as tabelas relacionadas (Time, Estadio, Campeonato) estão populadas.")

# --- INÍCIO DA EXECUÇÃO DO SCRIPT ---
if __name__ == "__main__":
    importar_jogos()
