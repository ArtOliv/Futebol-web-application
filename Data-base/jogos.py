import pandas as pd
import os

# Se você tem o arquivo CSV salvo localmente, use esta linha em vez da 'data' string:
# df = pd.read_csv('caminho/para/seu/arquivo.csv', sep=',', quotechar='"', skipinitialspace=True)
# Exemplo: df = pd.read_csv('meus_jogos.csv', sep=',', quotechar='"', skipinitialspace=True)

script_dir = os.path.dirname(__file__) if '__file__' in locals() else os.getcwd()

# Constrói os caminhos completos para os arquivos CSV
FULL_CSV = os.path.join(script_dir, 'campeonato-brasileiro-full.csv')
ESTATISTICAS_CSV = os.path.join(script_dir, 'campeonato-brasileiro-estatisticas-full.csv')
GOLS_CSV = os.path.join(script_dir, 'campeonato-brasileiro-gols.csv')
CARTOES_CSV = os.path.join(script_dir, 'campeonato-brasileiro-cartoes.csv')
OUTPUT_SQL_FILE = os.path.join(script_dir, 'populate_brasileirao.sql')

df = pd.read_csv("campeonato-brasileiro-full.csv", sep=',', quotechar='"', skipinitialspace=True)

# Limpar nomes das colunas (remover espaços extras)
df.columns = df.columns.str.strip()

# Converter a coluna 'data' para datetime
df['data_dt'] = pd.to_datetime(df['data'], format='%d/%m/%Y')

# Filtrar para jogos do ano de 2023
df_2023 = df[df['data_dt'].dt.year == 2023].copy() # Usar .copy() é uma boa prática

# Lista para armazenar as strings de INSERT SQL
sql_inserts = []

# Verificar se há jogos em 2023 para processar
if not df_2023.empty:
    for index, row in df_2023.iterrows():
        # Combinar data e hora para o formato DATETIME do MySQL
        # Ex: 'YYYY-MM-DD HH:MM:SS'
        datetime_obj = pd.to_datetime(f"{row['data']} {row['hora']}", format='%d/%m/%Y %H:%M')
        datetime_str = datetime_obj.strftime('%Y-%m-%d %H:%M:%S')
        
        # Remover espaços em branco dos nomes dos estádios e times
        arena_name = row['arena'].strip()
        mandante_name = row['mandante'].strip()
        visitante_name = row['visitante'].strip()

        # Construir a parte VALUES da instrução INSERT
        values = (
            f"'{datetime_str}', {row['rodata']}, {row['mandante_Placar']}, {row['visitante_Placar']}, "
            f"'Brasileirão 2023', 2023, '{arena_name}', "
            f"'{mandante_name}', '{visitante_name}'"
        )
        sql_inserts.append(f"({values})")

    # Montar a instrução INSERT final
    if sql_inserts:
        final_sql = "insert into jogo\n(dt_data_horario, n_rodada, n_placar_casa, n_placar_visitante, c_nome_campeonato, d_ano_campeonato, c_nome_estadio, c_time_casa, c_time_visitante)\nVALUES\n"
        final_sql += ",\n".join(sql_inserts) + ";"
    else:
        final_sql = "-- Nenhum jogo de 2023 encontrado nos dados filtrados."
else:
    final_sql = "-- Nenhum jogo de 2023 encontrado nos dados fornecidos para gerar inserções."

# Nome do arquivo de saída
output_filename = "jogos_2023_inserts.txt"

# Salvar as instruções SQL no arquivo .txt
with open(output_filename, "w") as f:
    f.write(final_sql)

print(f"As instruções SQL foram geradas e salvas em '{output_filename}'.")
print("Lembre-se que o arquivo de dados que você forneceu contém apenas jogos de 2003,")
print("então o arquivo de saída estará vazio para jogos de 2023 com base nesses dados.")