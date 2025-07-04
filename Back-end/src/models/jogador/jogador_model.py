from pydantic import BaseModel
from typing import Optional 
from datetime import date 
from src.constant.posicao_enum import Posicao


class JogadorCreate(BaseModel):
    c_Pnome_jogador: str 
    c_Unome_jogador: Optional[str] = None 
    n_camisa: Optional[int] = None 
    c_posicao: Optional[Posicao] = None 
    d_data_nascimento: Optional[date] = None 


class Jogador(JogadorCreate): 
    cartoes: Optional[list] = None 
    class Config:
        from_attributes = True
        json_encoders = {Posicao: lambda v: str(v)}