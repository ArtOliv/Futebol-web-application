import pandas as pd

# Dados de entrada
csv_path = "../inserts/jogos_brasileirão.csv"  
output_path = "insert_jogos.sql"

# Carrega os dados do CSV
df = pd.read_csv(csv_path)

# Junta data e hora no formato datetime do SQL
df["dt_data_horario"] = pd.to_datetime(df["data"] + " " + df["hora"])

# Cria lista de valores formatados
valores = []
for _, row in df.iterrows():
    linha = f"('{row['dt_data_horario']}', {row['n_rodada']}, {row['n_placar_casa']}, {row['n_placar_visitante']}, '{row['c_nome_campeonato'].replace("'", "''")}', {row['d_ano_campeonato']}, '{row['c_nome_estadio'].replace("'", "''")}', '{row['c_time_casa'].replace("'", "''")}', '{row['c_time_visitante'].replace("'", "''")}')"
    valores.append(linha)

# Junta todos os valores em um único INSERT
insert_sql = """INSERT INTO Jogo
(dt_data_horario, n_rodada, n_placar_casa, n_placar_visitante, c_nome_campeonato, d_ano_campeonato, c_nome_estadio, c_time_casa, c_time_visitante)
VALUES
""" + ",\n".join(valores) + ";"

# Escreve no arquivo
with open(output_path, "w", encoding="utf-8") as f:
    f.write(insert_sql)

output_path