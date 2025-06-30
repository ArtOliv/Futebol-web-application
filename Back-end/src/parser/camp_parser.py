from collections import defaultdict
from src.models.campeonato.campeonato_model import Campeonato

def parse_campeonato(row):
    if not row:
        return None
    return Campeonato(**row)