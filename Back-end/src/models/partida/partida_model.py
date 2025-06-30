from src.models.cartao.cartao_model import Cartao
from src.models.estadio.estadio_model import Estadio
from src.models.gol.gol_model import Gol
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Partida(BaseModel):
    id_partida: Optional[int] = None
    n_rodada: Optional[int] = None
    n_placar_casa: Optional[int] = None
    n_placar_visitante: Optional[int] = None
    estadio: Optional[Estadio] = None
    time_visitante: Optional[str] = None
    time_casa: Optional[str] = None
    cartoes: Optional[list[Cartao]] = None
    gols: Optional[list[Gol]] = None
    dt_data_horario: Optional[datetime] = None
    c_status: Optional[str] = None