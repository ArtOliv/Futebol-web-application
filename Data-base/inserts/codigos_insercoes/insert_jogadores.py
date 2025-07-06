import pandas as pd

# Dados de entrada
csv_path = "../arquivos_csvs/jogadores_brasileirao_2.csv"  
output_path = "insert_jogadores.sql"

# Carrega os dados do CSV
df = pd.read_csv(csv_path)

# Função para escapar aspas simples
def esc(s):
    return str(s).replace("'", "''") if pd.notnull(s) else ''

# Criar os valores SQL
valores = []
for _, row in df.iterrows():
    linha = (
        f"('{esc(row['c_Pnome_jogador'])}', '{esc(row['c_Unome_jogador'])}', "
        f"{row['n_camisa'] if pd.notnull(row['n_camisa']) else 'NULL'}, "
        f"{'NULL' if pd.isnull(row['d_data_nascimento']) else f'\'{row['d_data_nascimento']}\''}, "
        f"'{esc(row['c_posicao'])}', '{esc(row['c_nome_time'])}')"
    )
    valores.append(linha)

# Comando SQL completo
insert_sql = """INSERT INTO Jogador
(c_Pnome_jogador, c_Unome_jogador, n_camisa, d_data_nascimento, c_posicao, c_nome_time)
VALUES
""" + ",\n".join(valores) + ";"

# Salvar no arquivo
with open("insert_jogadores.sql", "w", encoding="utf-8") as f:
    f.write(insert_sql)

print("Arquivo 'insert_jogadores.sql' gerado com sucesso!")