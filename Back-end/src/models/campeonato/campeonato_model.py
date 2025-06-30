from src.models.partida.partida_model import Partida
from src.models.time.time_model import Time
from pydantic import BaseModel
from typing import Optional

class Campeonato(BaseModel):
    c_nome_campeonato: Optional[str] = None
    d_ano_campeonato: Optional[int] = None
    # times: Optional[list[Time]] = None
    # partidas: Optional[list[Partida]] = None

