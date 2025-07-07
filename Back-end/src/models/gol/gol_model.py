
from src.models.jogador.jogador_model import Jogador 
from pydantic import BaseModel
from typing import Optional

class GolCreate(BaseModel): 
    id_jogo: int
    id_jogador: int
    n_minuto_gol: int

class Gol(BaseModel): 
    id_gol: Optional[int] = None
    n_minuto_gol: Optional[int] = None
    jogador: Optional[Jogador] = None 

class GolResponse(BaseModel):
    id_gol: int 
    n_minuto_gol: Optional[int] = None
    c_nome_jogador: Optional[str] = None 
    c_nome_time: Optional[str] = None 
    id_jogo: int 

    class Config:
        from_attributes = True 
