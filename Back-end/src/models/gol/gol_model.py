from src.models.jogador.jogador_model import Jogador
from pydantic import BaseModel
from typing import Optional

class Gol(BaseModel):
    id_gol: Optional[int] = None
    n_minuto_gol: Optional[int] = None
    jogador: Optional[Jogador] = None



