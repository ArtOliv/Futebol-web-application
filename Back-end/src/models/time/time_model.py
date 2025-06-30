from src.models.classificacao.classific_model import Classificacao
from src.models.jogador.jogador_model import Jogador
from pydantic import BaseModel
from typing import Optional

class Time(BaseModel):
    classificacao: Optional[Classificacao] = None
    c_nome_time: Optional[str] = None
    c_cidade_time: Optional[str] = None
    c_tecnico_time: Optional[str] = None
    jogadores: Optional[list[Jogador]] = None