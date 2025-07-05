from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class PartidaCreate(BaseModel):
    dt_data_str: str
    hr_horario_str: str
    n_rodada: Optional[int] = None
    c_nome_estadio: Optional[str] = None
    c_time_casa: Optional[str] = None
    c_time_visitante: Optional[str] = None
    

    class Config:
        from_attributes = True