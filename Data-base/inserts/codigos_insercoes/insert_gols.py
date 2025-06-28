import pandas as pd

# Dados de entrada
csv_path = "../inserts/gols_brasileirao.csv"  
output_path = "insert_gols.sql"

# Carrega os dados do CSV
df = pd.read_csv(csv_path)
valores = []
for _, row in df.iterrows():
    linha = f"({row['n_minuto_gol']}, {row['id_jogador']}, {row['id_jogo']})"
    valores.append(linha)

# Montar o comando completo
insert_sql = """INSERT INTO Gol
(n_minuto_gol, id_jogador, id_jogo)
VALUES
""" + ",\n".join(valores) + ";"

# Salvar em um arquivo
with open("insert_gols.sql", "w", encoding="utf-8") as f:
    f.write(insert_sql)

print("Arquivo 'insert_gols.sql' gerado com sucesso!")