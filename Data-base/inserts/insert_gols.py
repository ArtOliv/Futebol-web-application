
import pandas as pd
from sqlalchemy import create_engine
import sys
import os

def importar_gols():
        # --- 1. CONFIGURE SEUS DADOS DE CONEXÃO AO MYSQL ---
    # (Altere se necessário)
    db_user = 'root'
    db_password = os.getenv('DB_PASSWORD')
    db_host = os.getenv('DB_HOST')
    db_name = 'campeonato_futebol'
    db_port = os.getenv('DB_PORT')

    # --- CONFIGURE OS ARQUIVOS E A TABELA DE DESTINO ---
    script_dir = os.path.dirname(os.path.abspath(__file__))
    csv_file_path = os.path.join(script_dir, 'gols_brasileirao.csv')
    table_name = 'gol'

    print("Iniciando o processo de importação de gols com validação...")

    try:
        # --- 2. CONECTAR AO BANCO E LER DADOS PARA VALIDAÇÃO ---
        print("Conectando ao banco para verificar jogos e jogadores existentes...")
        connection_string = f'mysql+mysqlconnector://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}'
        engine = create_engine(connection_string)

        # Lê as chaves primárias (IDs) das tabelas 'jogo' and 'jogador'
        df_jogos_db = pd.read_sql_table('jogo', engine, columns=['id_jogo'])
        df_jogadores_db = pd.read_sql_table('jogador', engine, columns=['id_jogador'])
        
        # Cria um conjunto (set) de IDs para uma verificação rápida e eficiente
        jogos_existentes = set(df_jogos_db['id_jogo'])
        jogadores_existentes = set(df_jogadores_db['id_jogador'])
        
        print(f"Encontrados {len(jogos_existentes)} jogos e {len(jogadores_existentes)} jogadores no banco de dados.")

        # --- 3. LER O CSV E FILTRAR OS GOLS VÁLIDOS ---
        print(f"Lendo e processando o arquivo CSV '{csv_file_path}'...")
        df_gols = pd.read_csv(csv_file_path)

        # Remove colunas inesperadas, se houver, garantindo que o DataFrame corresponda à tabela
        colunas_esperadas = ['id_jogo', 'n_minuto_gol', 'id_jogador']
        df_gols = df_gols[colunas_esperadas]

        # Guarda o número original de gols para o relatório final
        total_gols_csv = len(df_gols)
        
        # **ETAPA DE VALIDAÇÃO CRÍTICA**
        # Filtra o DataFrame, mantendo apenas os gols cujo 'id_jogo' E 'id_jogador'
        # existem nos conjuntos de IDs lidos do banco.
        df_para_inserir = df_gols[
            df_gols['id_jogo'].isin(jogos_existentes) & 
            df_gols['id_jogador'].isin(jogadores_existentes)
        ].copy()
        
        gols_invalidos = total_gols_csv - len(df_para_inserir)

        if gols_invalidos > 0:
            print(f"\nAVISO: {gols_invalidos} gol(s) foram ignorados.")
            print("Motivo: O 'id_jogo' ou 'id_jogador' associado não foi encontrado nas tabelas correspondentes.")
            # Para uma depuração avançada, você poderia listar os IDs problemáticos aqui.

        if df_para_inserir.empty:
            print("\nNenhum gol com dados válidos para inserir.")
        else:
            print(f"\nProcessamento concluído. {len(df_para_inserir)} gols válidos serão inseridos.")
            
            # --- 4. INSERIR APENAS OS GOLS VÁLIDOS ---
            # A coluna 'id_gol' não é enviada, pois ela é Auto Increment (AI) no MySQL
            df_para_inserir.to_sql(name=table_name, con=engine, if_exists='append', index=False, chunksize=1000)
            print("\nSUCESSO! Novos gols inseridos na tabela 'gol'.")

    except FileNotFoundError:
        print(f"\nERRO: O arquivo '{csv_file_path}' não foi encontrado. Verifique o caminho e o nome do arquivo.")
    except Exception as e:
        print(f"\nERRO: Ocorreu um problema durante a execução: {e}")
        print("\nDicas:")
        print("- Verifique se as credenciais do banco de dados estão corretas.")
        print("- Confirme se as tabelas 'jogo' e 'jogador' existem no banco 'campeonato_futebol'.")
        print("- Veja se as colunas no CSV ('id_jogo', 'n_minuto_gol', 'id_jogador') correspondem exatamente.")
    pass

if __name__ == "__main__":
    importar_gols()
