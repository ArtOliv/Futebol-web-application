import pandas as pd
import numpy as np
import re
from datetime import datetime
import os

# --- Configurações dos arquivos CSV ---
# Obtém o diretório do script atual
script_dir = os.path.dirname(__file__) if '__file__' in locals() else os.getcwd()

# Constrói os caminhos completos para os arquivos CSV
FULL_CSV = os.path.join(script_dir, 'campeonato-brasileiro-full.csv')
ESTATISTICAS_CSV = os.path.join(script_dir, 'campeonato-brasileiro-estatisticas-full.csv')
GOLS_CSV = os.path.join(script_dir, 'campeonato-brasileiro-gols.csv')
CARTOES_CSV = os.path.join(script_dir, 'campeonato-brasileiro-cartoes.csv')
OUTPUT_SQL_FILE = os.path.join(script_dir, 'populate_brasileirao.sql')


# --- Carregar os dados dos CSVs ---
try:
    df_full = pd.read_csv(FULL_CSV, encoding='utf-8')
    df_estatisticas = pd.read_csv(ESTATISTICAS_CSV, encoding='utf-8')
    df_gols = pd.read_csv(GOLS_CSV, encoding='utf-8')
    df_cartoes = pd.read_csv(CARTOES_CSV, encoding='utf-8')
    print("CSV files loaded successfully.")
except FileNotFoundError as e:
    print(f"Error: One or more CSV files not found. Make sure they are in the same directory as the script.")
    print(e)
    exit()

# --- Funções auxiliares ---
def get_first_last_name(full_name):
    """Divide um nome completo em primeiro e último nome."""
    parts = str(full_name).strip().split(' ')
    if len(parts) == 1:
        return parts[0], ''
    elif len(parts) > 1:
        return parts[0], ' '.join(parts[1:])
    return '', ''

def sanitize_string(s):
    """Limpa strings para inserção SQL."""
    if pd.isna(s):
        return 'NULL'
    s = str(s).replace("'", "''").strip()
    if not s: # Handle empty strings after stripping
        return 'NULL'
    return f"'{s}'"

def sanitize_int(i):
    """Limpa inteiros para inserção SQL."""
    if pd.isna(i):
        return 'NULL'
    # Ensure it's a valid integer before converting
    try:
        return int(i)
    except (ValueError, TypeError):
        return 'NULL'


def sanitize_float(f):
    """Limpa floats para inserção SQL, convertendo ponto para vírgula para DECIMAL."""
    if pd.isna(f):
        return 'NULL'
    return float(f)

# --- Gerar SQL Output ---
with open(OUTPUT_SQL_FILE, 'w', encoding='utf-8') as f:
    f.write("-- SQL script to populate the Brasileirão database\n")
    f.write("-- Generated on: " + datetime.now().strftime('%Y-%m-%d %H:%M:%S') + "\n\n")

    f.write("SET FOREIGN_KEY_CHECKS = 0;\n") # Temporarily disable FK checks
    f.write("TRUNCATE TABLE Administrador;\n")
    f.write("TRUNCATE TABLE Campeonato;\n")
    f.write("TRUNCATE TABLE Time;\n")
    f.write("TRUNCATE TABLE Time_participa_campeonato;\n")
    f.write("TRUNCATE TABLE Jogador;\n")
    f.write("TRUNCATE TABLE Estadio;\n")
    f.write("TRUNCATE TABLE Jogo;\n") # Jogo table will be truncated
    f.write("TRUNCATE TABLE Gol;\n")
    f.write("TRUNCATE TABLE Cartao;\n")
    f.write("TRUNCATE TABLE Classificacao;\n")
    f.write("SET FOREIGN_KEY_CHECKS = 1;\n\n")

    # Recreate the Jogo table with n_rodada - ensures schema is correct before inserts
    # This block is here for completeness. In a real scenario, you'd run your DDL first.
    # We include it in the generated SQL for convenience if the user just runs this file.
    f.write("DROP TABLE IF EXISTS Cartao;\n")
    f.write("DROP TABLE IF EXISTS Gol;\n")
    f.write("DROP TABLE IF EXISTS Jogo;\n")
    f.write("DROP TABLE IF EXISTS Classificacao;\n")
    f.write("DROP TABLE IF EXISTS Estadio;\n")
    f.write("DROP TABLE IF EXISTS Jogador;\n")
    f.write("DROP TABLE IF EXISTS Time_participa_campeonato;\n")
    f.write("DROP TABLE IF EXISTS Time;\n")
    f.write("DROP TABLE IF EXISTS Campeonato;\n")
    f.write("DROP TABLE IF EXISTS Administrador;\n\n")

    f.write("create table if not exists Administrador(\n")
    f.write("    c_email_adm VARCHAR(100) primary key,\n")
    f.write("    c_Pnome_adm VARCHAR(100) not null,\n")
    f.write("    c_Unome_adm VARCHAR(100) not null,\n")
    f.write("    c_senha_adm VARCHAR(100) not null);\n\n")
        
    f.write("create table if not exists Campeonato(\n")
    f.write("    c_nome_campeonato VARCHAR(100) not null,\n")
    f.write("    d_ano_campeonato YEAR not null,\n")
    f.write("    primary key (c_nome_campeonato, d_ano_campeonato));\n\n")
        
    f.write("create table if not exists Time(\n")
    f.write("    c_nome_time VARCHAR(100) primary key,\n")
    f.write("    c_cidade_time VARCHAR(100),\n")
    f.write("    c_tecnico_time VARCHAR(100));\n\n")
        
    f.write("create table if not exists Time_participa_campeonato(\n")
    f.write("    c_nome_time VARCHAR(100) not null,\n")
    f.write("    c_nome_campeonato VARCHAR(100) not null,\n")
    f.write("    d_ano_campeonato YEAR not null,\n")
    f.write("    primary key (c_nome_time, c_nome_campeonato, d_ano_campeonato),\n")
    f.write("    constraint fk_time_camp foreign key (c_nome_time) references Time(c_nome_time)\n")
    f.write("        ON UPDATE CASCADE,\n")
    f.write("    constraint fk_camp_time foreign key (c_nome_campeonato,d_ano_campeonato) references Campeonato(c_nome_campeonato,d_ano_campeonato)\n")
    f.write("        ON UPDATE CASCADE);\n\n")

    f.write("create table if not exists Jogador(\n")
    f.write("    id_jogador INT auto_increment primary key,\n")
    f.write("    c_Pnome_jogador VARCHAR(100),\n")
    f.write("    c_Unome_jogador VARCHAR(100),\n")
    f.write("    n_camisa INT CHECK (n_camisa >= 0 AND n_camisa < 100),\n")
    f.write("    d_data_nascimento DATE not null,\n")
    f.write("    c_posicao VARCHAR(100),\n")
    f.write("    n_altura DECIMAL(4,2) not null CHECK (n_altura > 0 AND n_altura < 3),\n")
    f.write("    n_peso DECIMAL(5,2) not null CHECK (n_peso > 0 AND n_peso < 200),\n")
    f.write("    c_nome_time VARCHAR(100),\n")
    f.write("    constraint fk_time_jogador foreign key (c_nome_time) references Time(c_nome_time)\n")
    f.write("        ON DELETE SET NULL ON UPDATE CASCADE);\n\n")
        
    f.write("create table if not exists Estadio(\n")
    f.write("    c_nome_estadio VARCHAR(100) primary key,\n")
    f.write("    c_cidade_estadio VARCHAR(100),\n")
    f.write("    n_capacidade INT);\n\n")
        
    f.write("create table if not exists Jogo(\n")
    f.write("    id_jogo INT auto_increment primary key,\n")
    f.write("    dt_data_horario DATETIME not null,\n")
    f.write("    n_rodada INT,\n")
    f.write("    n_placar_casa INT default 0 CHECK (n_placar_casa >= 0),\n")
    f.write("    n_placar_visitante INT default 0 CHECK (n_placar_visitante >= 0),\n")
    f.write("    c_nome_campeonato VARCHAR(100) not null,\n")
    f.write("    d_ano_campeonato YEAR not null,\n")
    f.write("    c_nome_estadio VARCHAR(100),\n")
    f.write("    c_time_casa VARCHAR(100),\n")
    f.write("    c_time_visitante VARCHAR(100),\n")
    f.write("    constraint fk_estadio_jogo foreign key (c_nome_estadio) references Estadio(c_nome_estadio)\n")
    f.write("            ON DELETE SET NULL ON UPDATE CASCADE,\n")
    f.write("    constraint fk_time_casa_jogo foreign key (c_time_casa) references Time(c_nome_time)\n")
    f.write("            ON DELETE SET NULL ON UPDATE CASCADE,\n")
    f.write("    constraint fk_time_visitante_jogo foreign key (c_time_visitante) references Time(c_nome_time)\n")
    f.write("            ON DELETE SET NULL ON UPDATE CASCADE,\n")
    f.write("    constraint fk_campeonato_jogo foreign key (c_nome_campeonato,d_ano_campeonato) references Campeonato(c_nome_campeonato,d_ano_campeonato)\n")
    f.write("            ON UPDATE CASCADE);\n\n")
        
    f.write("create table if not exists Gol(\n")
    f.write("    id_gol INT auto_increment,\n")
    f.write("    n_minuto_gol INT not null CHECK (n_minuto_gol>=0 AND n_minuto_gol<=90),\n")
    f.write("    id_jogo INT not null,\n")
    f.write("    id_jogador INT,\n")
    f.write("    c_Pnome_jogador VARCHAR(100),\n")
    f.write("    c_Unome_jogador VARCHAR(100),\n")
    f.write("    n_camisa INT,\n")
    f.write("    primary key (id_gol, id_jogo),\n")
    f.write("    constraint fk_jogo_gol foreign key (id_jogo) references Jogo(id_jogo)\n")
    f.write("        ON UPDATE CASCADE,\n")
    f.write("    CONSTRAINT fk_jogador_gol FOREIGN KEY (id_jogador) REFERENCES Jogador(id_jogador)\n")
    f.write("        ON DELETE SET NULL ON UPDATE CASCADE\n")
    f.write(");\n\n")

    f.write("create table if not exists Cartao(\n")
    f.write("    id_cartao INT auto_increment,\n")
    f.write("    e_tipo ENUM('amarelo', 'vermelho') not null,\n")
    f.write("    n_minuto_cartao INT not null CHECK (n_minuto_cartao>=0 AND n_minuto_cartao<=90),\n")
    f.write("    id_jogo INT not null,\n")
    f.write("    id_jogador INT,\n")
    f.write("    c_Pnome_jogador VARCHAR(100),\n")
    f.write("    c_Unome_jogador VARCHAR(100),\n")
    f.write("    n_camisa INT,\n")
    f.write("    primary key (id_cartao, id_jogo),\n")
    f.write("    constraint fk_jogo_cartao foreign key (id_jogo) references Jogo(id_jogo)\n")
    f.write("            ON DELETE CASCADE ON UPDATE CASCADE,\n")
    f.write("    CONSTRAINT fk_jogador_cartao FOREIGN KEY (id_jogador) REFERENCES Jogador(id_jogador)\n")
    f.write("            ON DELETE SET NULL ON UPDATE CASCADE);\n\n")
        
    f.write("create table if not exists Classificacao(\n")
    f.write("    c_nome_campeonato VARCHAR(100) not null,\n")
    f.write("    d_ano_campeonato YEAR not null,\n")
    f.write("    c_nome_time VARCHAR(100) not null,\n")
    f.write("    n_pontos INT default 0 generated always as (3*n_vitorias + n_empates) stored,\n")
    f.write("    n_jogos INT generated always as (n_vitorias + n_empates + n_derrotas) stored,\n")
    f.write("    n_vitorias INT default 0,\n")
    f.write("    n_empates INT default 0,\n")
    f.write("    n_derrotas INT default 0,\n")
    f.write("    n_gols_pro INT default 0,\n")
    f.write("    n_gols_contra INT default 0,\n")
    f.write("    n_saldo_gols INT generated always as (n_gols_pro - n_gols_contra) stored,\n")
    f.write("    primary key (c_nome_campeonato,d_ano_campeonato, c_nome_time),\n")
    f.write("    constraint fk_time_classificacao foreign key (c_nome_time) references Time(c_nome_time)\n")
    f.write("            ON UPDATE CASCADE,\n")
    f.write("    constraint fk_campeonato_classificacao foreign key (c_nome_campeonato,d_ano_campeonato) references Campeonato(c_nome_campeonato,d_ano_campeonato)\n")
    f.write("            ON UPDATE CASCADE);\n\n")

    f.write("CREATE OR REPLACE TRIGGER Tg_Cartao_DoisAmarelos\n")
    f.write("AFTER INSERT ON Cartao\n")
    f.write("FOR EACH ROW\n")
    f.write("BEGIN\n")
    f.write("    DECLARE total_amarelos INT;\n")
    f.write("    DECLARE ja_tem_vermelho INT;\n\n")
    f.write("    IF NEW.e_tipo = 'amarelo' AND NEW.id_jogador IS NOT NULL THEN\n")
    f.write("        SELECT COUNT(*) INTO total_amarelos\n")
    f.write("        FROM Cartao\n")
    f.write("        WHERE id_jogo = NEW.id_jogo\n")
    f.write("          AND id_jogador = NEW.id_jogador\n")
    f.write("          AND e_tipo = 'amarelo';\n\n")
    f.write("        SELECT COUNT(*) INTO ja_tem_vermelho\n")
    f.write("        FROM Cartao\n")
    f.write("        WHERE id_jogo = NEW.id_jogo\n")
    f.write("          AND id_jogador = NEW.id_jogador\n")
    f.write("          AND e_tipo = 'vermelho';\n\n")
    f.write("        IF total_amarelos = 2 AND ja_tem_vermelho = 0 THEN\n")
    f.write("            INSERT INTO Cartao (e_tipo, n_minuto_cartao, id_jogo, id_jogador)\n")
    f.write("            VALUES ('vermelho', NEW.n_minuto_cartao, NEW.id_jogo, NEW.id_jogador);\n")
    f.write("        END IF;\n")
    f.write("    END IF;\n")
    f.write("END;\n")
    f.write("//\n\n") # Delimiter for the trigger


    # --- 1. Administrador (Dummy) ---
    f.write("-- Data for Administrador table\n")
    f.write(f"INSERT IGNORE INTO Administrador (c_email_adm, c_Pnome_adm, c_Unome_adm, c_senha_adm) VALUES ('admin@example.com', 'Admin', 'Root', 'password123');\n\n")

    # --- 2. Campeonato ---
    f.write("-- Data for Campeonato table\n")
    df_full['ano_campeonato'] = pd.to_datetime(df_full['data'], format='%d/%m/%Y').dt.year
    campeonatos = df_full['ano_campeonato'].unique()
    campeonatos.sort()
    for ano in campeonatos:
        f.write(f"INSERT IGNORE INTO Campeonato (c_nome_campeonato, d_ano_campeonato) VALUES ('Campeonato Brasileiro', {ano});\n")
    f.write("\n")

    # --- 3. Time ---
    f.write("-- Data for Time table\n")
    times_data = {} # {nome_time: {'cidade': '', 'tecnico': ''}}

    # Coletar times, cidades e técnicos
    for index, row in df_full.iterrows():
        # Time mandante
        mandante = row['mandante']
        tecnico_mandante = row['tecnico_mandante']
        estado_mandante = row['mandante_Estado']
        if mandante not in times_data:
            times_data[mandante] = {'cidade': estado_mandante, 'tecnico': tecnico_mandante}
        elif times_data[mandante]['tecnico'] is None or pd.isna(times_data[mandante]['tecnico']):
            times_data[mandante]['tecnico'] = tecnico_mandante

        # Time visitante
        visitante = row['visitante']
        tecnico_visitante = row['tecnico_visitante']
        estado_visitante = row['visitante_Estado']
        if visitante not in times_data:
            times_data[visitante] = {'cidade': estado_visitante, 'tecnico': tecnico_visitante}
        elif times_data[visitante]['tecnico'] is None or pd.isna(times_data[visitante]['tecnico']):
            times_data[visitante]['tecnico'] = tecnico_visitante

    for nome_time, data in times_data.items():
        cidade = sanitize_string(data['cidade'])
        tecnico = sanitize_string(data['tecnico'])
        f.write(f"INSERT IGNORE INTO Time (c_nome_time, c_cidade_time, c_tecnico_time) VALUES ({sanitize_string(nome_time)}, {cidade}, {tecnico});\n")
    f.write("\n")

    # --- 4. Estadio ---
    f.write("-- Data for Estadio table\n")
    estadios = df_full['arena'].unique()
    for estadio in estadios:
        f.write(f"INSERT IGNORE INTO Estadio (c_nome_estadio, c_cidade_estadio, n_capacidade) VALUES ({sanitize_string(estadio)}, NULL, NULL);\n")
    f.write("\n")

    # --- 5. Time_participa_campeonato ---
    f.write("-- Data for Time_participa_campeonato table\n")
    times_campeonatos = set()
    for index, row in df_full.iterrows():
        ano = row['ano_campeonato']
        times_campeonatos.add((row['mandante'], ano))
        times_campeonatos.add((row['visitante'], ano))

    for time, ano in times_campeonatos:
        f.write(f"INSERT IGNORE INTO Time_participa_campeonato (c_nome_time, c_nome_campeonato, d_ano_campeonato) VALUES ({sanitize_string(time)}, 'Campeonato Brasileiro', {ano});\n")
    f.write("\n")

    # --- 6. Jogo ---
    f.write("-- Data for Jogo table\n")
    for index, row in df_full.iterrows():
        id_jogo = sanitize_int(row['ID'])
        data_horario_str = f"{row['data']} {row['hora']}"
        dt_data_horario = datetime.strptime(data_horario_str, '%d/%m/%Y %H:%M').strftime('%Y-%m-%d %H:%M:%S')
        rodada = sanitize_int(row['rodata'])
        placar_casa = sanitize_int(row['mandante_Placar'])
        placar_visitante = sanitize_int(row['visitante_Placar'])
        nome_campeonato = sanitize_string('Campeonato Brasileiro')
        ano_campeonato = sanitize_int(row['ano_campeonato'])
        nome_estadio = sanitize_string(row['arena'])
        time_casa = sanitize_string(row['mandante'])
        time_visitante = sanitize_string(row['visitante'])

        f.write(f"INSERT INTO Jogo (id_jogo, dt_data_horario, n_rodada, n_placar_casa, n_placar_visitante, c_nome_campeonato, d_ano_campeonato, c_nome_estadio, c_time_casa, c_time_visitante) VALUES ({id_jogo}, '{dt_data_horario}', {rodada}, {placar_casa}, {placar_visitante}, {nome_campeonato}, {ano_campeonato}, {nome_estadio}, {time_casa}, {time_visitante});\n")
    f.write("\n")

    # --- 7. Jogador ---
    f.write("-- Data for Jogador table\n")
    # Consolidar dados de jogadores de gols e cartões
    df_gols['Fonte'] = 'gol'
    df_cartoes['Fonte'] = 'cartao'

    # Renomear colunas para unificação (use .copy() para evitar SettingWithCopyWarning)
    # Correção: As chaves no dicionário rename devem ser os nomes EXATOS das colunas no CSV.
    # Pelo seu exemplo, são 'clube', 'atleta', 'minuto', 'partida_id', 'rodata', 'num_camisa', 'posicao', 'cartao'.
    df_gols_renamed = df_gols.rename(columns={
        'clube': 'Clube_Jogador',
        'atleta': 'Atleta_Nome',
        'minuto': 'Minuto_Evento',
        'partida_id': 'partida_id', # Já está correto
        'rodata': 'rodata'       # Já está correto
    }).copy()
    df_cartoes_renamed = df_cartoes.rename(columns={
        'clube': 'Clube_Jogador',
        'atleta': 'Atleta_Nome',
        'num_camisa': 'Numero_Camisa',
        'posicao': 'Posicao_Jogador',
        'minuto': 'Minuto_Evento',
        'cartao': 'Cartao',          # Já está correto
        'partida_id': 'partida_id',  # Já está correto
        'rodata': 'rodata'         # Já está correto
    }).copy()


    # Selecionar colunas relevantes antes de concatenar para evitar MemoryError se os DFs forem muito grandes
    cols_gols = ['partida_id', 'rodata', 'Clube_Jogador', 'Atleta_Nome', 'Minuto_Evento', 'Fonte']
    cols_cartoes = ['partida_id', 'rodata', 'Clube_Jogador', 'Atleta_Nome', 'Numero_Camisa', 'Posicao_Jogador', 'Minuto_Evento', 'Cartao', 'Fonte']

    # Unir os jogadores
    all_players_gols = df_gols_renamed[cols_gols].copy()
    all_players_cartoes = df_cartoes_renamed[cols_cartoes].copy()

    # Preencher colunas ausentes para que a concatenação funcione
    for col in cols_cartoes:
        if col not in all_players_gols.columns:
            all_players_gols[col] = np.nan
    for col in cols_gols:
        if col not in all_players_cartoes.columns:
            all_players_cartoes[col] = np.nan

    all_players_df = pd.concat([all_players_gols, all_players_cartoes], ignore_index=True)

    # Limpar e agrupar para obter jogadores únicos
    all_players_df['Atleta_Nome'] = all_players_df['Atleta_Nome'].astype(str).str.strip().str.upper()
    all_players_df['Clube_Jogador'] = all_players_df['Clube_Jogador'].astype(str).str.strip()

    # Agrupar por atleta e clube para pegar a camisa e posição mais comum
    # Prioriza o primeiro valor não nulo encontrado, ou o mais frequente se necessário
    player_details = all_players_df.groupby(['Atleta_Nome', 'Clube_Jogador']).agg(
        numero_camisa=('Numero_Camisa', lambda x: x.mode()[0] if not x.mode().empty else np.nan),
        posicao=('Posicao_Jogador', lambda x: x.mode()[0] if not x.mode().empty else np.nan)
    ).reset_index()

    # Criar um mapeamento de jogador para ID (simulando auto_increment)
    player_id_map = {}
    current_player_id = 1

    for index, row in player_details.iterrows():
        full_name = row['Atleta_Nome']
        clube = row['Clube_Jogador']
        camisa = sanitize_int(row['numero_camisa'])
        posicao = sanitize_string(row['posicao']) # Corrigido para usar row['posicao']

        p_nome, u_nome = get_first_last_name(full_name)

        # Usar uma combinação de nome completo e clube para tentar identificar jogadores únicos
        # Isso é uma heurística, pois o mesmo nome pode aparecer em diferentes clubes
        player_key = (full_name, clube)

        if player_key not in player_id_map:
            player_id_map[player_key] = current_player_id
            f.write(f"INSERT INTO Jogador (id_jogador, c_Pnome_jogador, c_Unome_jogador, n_camisa, d_data_nascimento, c_posicao, n_altura, n_peso, c_nome_time) VALUES ({current_player_id}, {sanitize_string(p_nome)}, {sanitize_string(u_nome)}, {camisa}, '2000-01-01', {posicao}, 1.80, 75.00, {sanitize_string(clube)});\n")
            current_player_id += 1
    f.write("\n")

    # --- 8. Gol ---
    f.write("-- Data for Gol table\n")
    current_gol_id = 1
    for index, row in df_gols.iterrows():
        id_jogo = sanitize_int(row['partida_id'])
        minuto_gol = sanitize_int(row['minuto']) # Corrigido para 'minuto'
        atleta_nome = str(row['atleta']).strip().upper() # Corrigido para 'atleta'
        clube_gol = str(row['clube']).strip() # Corrigido para 'clube'

        # Tentar encontrar o id_jogador correspondente
        player_key = (atleta_nome, clube_gol)
        id_jogador = player_id_map.get(player_key, 'NULL')

        # Buscar dados do jogador para os campos denormalizados, se o id_jogador foi encontrado
        p_nome, u_nome, camisa = 'NULL', 'NULL', 'NULL'
        if id_jogador != 'NULL':
            player_info = player_details[(player_details['Atleta_Nome'] == atleta_nome) & (player_details['Clube_Jogador'] == clube_gol)]
            if not player_info.empty:
                p_nome, u_nome = get_first_last_name(atleta_nome)
                camisa = sanitize_int(player_info.iloc[0]['numero_camisa'])

        f.write(f"INSERT INTO Gol (id_gol, n_minuto_gol, id_jogo, id_jogador, c_Pnome_jogador, c_Unome_jogador, n_camisa) VALUES ({current_gol_id}, {minuto_gol}, {id_jogo}, {id_jogador}, {sanitize_string(p_nome)}, {sanitize_string(u_nome)}, {camisa});\n")
        current_gol_id += 1
    f.write("\n")

    # --- 9. Cartao ---
    f.write("-- Data for Cartao table\n")
    current_cartao_id = 1
    for index, row in df_cartoes.iterrows():
        id_jogo = sanitize_int(row['partida_id'])
        tipo_cartao = sanitize_string(row['cartao'].lower()) # Corrigido para 'cartao'
        minuto_cartao = sanitize_int(row['minuto']) # Corrigido para 'minuto'
        atleta_nome = str(row['atleta']).strip().upper() # Corrigido para 'atleta'
        clube_cartao = str(row['clube']).strip() # Corrigido para 'clube'

        # Tentar encontrar o id_jogador correspondente
        player_key = (atleta_nome, clube_cartao)
        id_jogador = player_id_map.get(player_key, 'NULL')

        # Buscar dados do jogador para os campos denormalizados
        p_nome, u_nome, camisa = 'NULL', 'NULL', 'NULL'
        if id_jogador != 'NULL':
            player_info = player_details[(player_details['Atleta_Nome'] == atleta_nome) & (player_details['Clube_Jogador'] == clube_cartao)]
            if not player_info.empty:
                p_nome, u_nome = get_first_last_name(atleta_nome)
                camisa = sanitize_int(player_info.iloc[0]['numero_camisa'])

        f.write(f"INSERT INTO Cartao (id_cartao, e_tipo, n_minuto_cartao, id_jogo, id_jogador, c_Pnome_jogador, c_Unome_jogador, n_camisa) VALUES ({current_cartao_id}, {tipo_cartao}, {minuto_cartao}, {id_jogo}, {id_jogador}, {sanitize_string(p_nome)}, {sanitize_string(u_nome)}, {camisa});\n")
        current_cartao_id += 1
    f.write("\n")

    # --- 10. Classificacao ---
    f.write("-- Data for Classificacao table\n")
    classificacao_data = {} # {(campeonato_nome, ano, nome_time): {vitorias, empates, derrotas, gols_pro, gols_contra}}

    for index, row in df_full.iterrows():
        campeonato_nome = 'Campeonato Brasileiro'
        ano_campeonato = row['ano_campeonato']
        time_casa = row['mandante']
        time_visitante = row['visitante']
        placar_casa = row['mandante_Placar']
        placar_visitante = row['visitante_Placar']

        # Inicializar entradas na classificação se não existirem
        for team in [time_casa, time_visitante]:
            key = (campeonato_nome, ano_campeonato, team)
            if key not in classificacao_data:
                classificacao_data[key] = {
                    'n_vitorias': 0,
                    'n_empates': 0,
                    'n_derrotas': 0,
                    'n_gols_pro': 0,
                    'n_gols_contra': 0
                }

        # Atualizar estatísticas para o time da casa
        classificacao_data[(campeonato_nome, ano_campeonato, time_casa)]['n_gols_pro'] += placar_casa
        classificacao_data[(campeonato_nome, ano_campeonato, time_casa)]['n_gols_contra'] += placar_visitante

        # Atualizar estatísticas para o time visitante
        classificacao_data[(campeonato_nome, ano_campeonato, time_visitante)]['n_gols_pro'] += placar_visitante
        classificacao_data[(campeonato_nome, ano_campeonato, time_visitante)]['n_gols_contra'] += placar_casa

        # Determinar resultado
        if placar_casa > placar_visitante:
            classificacao_data[(campeonato_nome, ano_campeonato, time_casa)]['n_vitorias'] += 1
            classificacao_data[(campeonato_nome, ano_campeonato, time_visitante)]['n_derrotas'] += 1
        elif placar_casa < placar_visitante:
            classificacao_data[(campeonato_nome, ano_campeonato, time_casa)]['n_derrotas'] += 1
            classificacao_data[(campeonato_nome, ano_campeonato, time_visitante)]['n_vitorias'] += 1
        else: # Empate
            classificacao_data[(campeonato_nome, ano_campeonato, time_casa)]['n_empates'] += 1
            classificacao_data[(campeonato_nome, ano_campeonato, time_visitante)]['n_empates'] += 1

    for (campeonato_nome, ano_campeonato, nome_time), stats in classificacao_data.items():
        f.write(f"INSERT INTO Classificacao (c_nome_campeonato, d_ano_campeonato, c_nome_time, n_vitorias, n_empates, n_derrotas, n_gols_pro, n_gols_contra) VALUES ({sanitize_string(campeonato_nome)}, {ano_campeonato}, {sanitize_string(nome_time)}, {stats['n_vitorias']}, {stats['n_empates']}, {stats['n_derrotas']}, {stats['n_gols_pro']}, {stats['n_gols_contra']});\n")
    f.write("\n")

    f.write("SET FOREIGN_KEY_CHECKS = 1;\n") # Re-enable FK checks

print(f"\nSQL insert statements generated successfully in '{OUTPUT_SQL_FILE}'")
print("You can now run this SQL file on your MySQL database.")