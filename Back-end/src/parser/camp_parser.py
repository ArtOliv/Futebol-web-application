from collections import defaultdict
from src.models.campeonato.campeonato_model import Campeonato 

def parse_campeonato(row):
    if not row:
        return None
    return Campeonato(**row) 

def parse_campeonato_for_dropdown(row):
    if not row:
        return None
    return {
        "nome_campeonato": row["c_nome_campeonato"],
        "d_ano_campeonato": row["d_ano_campeonato"] 
    }
