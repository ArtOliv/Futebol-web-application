from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime, date, time

from src.models.cartao.cartao_model import Cartao
from src.models.gol.gol_model import Gol
from src.models.estadio.estadio_model import Estadio 


class PartidaCreate(BaseModel):

    dt_data_str: str        
    hr_horario_str: str     
    n_rodada: Optional[int] = None
    c_nome_estadio: Optional[str] = None
    c_time_casa: Optional[str] = None
    c_time_visitante: Optional[str] = None

 

class Partida(BaseModel):
    id_jogo: int 
    dt_data_horario: datetime
    n_rodada: Optional[int] = None
    n_placar_casa: Optional[int] = 0
    n_placar_visitante: Optional[int] = 0
    c_nome_campeonato: str
    d_ano_campeonato: int
    c_nome_estadio: Optional[str] = None
    c_time_casa: Optional[str] = None
    c_time_visitante: Optional[str] = None
    c_status: str = "Agendado"

    cartoes: Optional[List[Cartao]] = None
    gols: Optional[List[Gol]] = None
    estadio: Optional[Estadio] = None 

    class Config:
        from_attributes = True