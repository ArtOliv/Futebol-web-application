import pandas as pd

# Carregar o arquivo CSV de cartões
df = pd.read_csv("../inserts/cartoes_brasileirao.csv")  # Altere o nome conforme o arquivo real

# Escapar valores com aspas simples (se necessário)
def esc(s):
    return str(s).replace("'", "''") if pd.notnull(s) else 'NULL'

# Criar os valores SQL
valores = []
for _, row in df.iterrows():
    linha = f"('{esc(row['e_tipo'])}', {row['n_minuto_cartao']}, {row['id_jogador']}, {row['id_jogo']})"
    valores.append(linha)

# Montar o comando completo
insert_sql = """INSERT INTO Cartao
(e_tipo, n_minuto_cartao, id_jogador, id_jogo)
VALUES
""" + ",\n".join(valores) + ";"

# Salvar no arquivo
with open("insert_cartoes.sql", "w", encoding="utf-8") as f:
    f.write(insert_sql)

print("Arquivo 'insert_cartoes.sql' gerado com sucesso!")
