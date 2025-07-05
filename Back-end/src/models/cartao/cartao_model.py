from __future__ import annotations
from src.constant.cartao_enum import CartaoEnum
from typing import TYPE_CHECKING, Optional
from pydantic import BaseModel

if TYPE_CHECKING:
    from src.models.jogador.jogador_model import Jogador 

class CartaoCreate(BaseModel): 
    e_tipo: CartaoEnum 
    n_minuto_cartao: Optional[int] = None

class Cartao(BaseModel): 
    id_cartao: Optional[int] = None 
    e_tipo: Optional[CartaoEnum] = None
    n_minuto_cartao: Optional[int] = None
    jogador: Optional[Jogador] = None 

class CartaoResponse(BaseModel):
    id_cartao: int
    e_tipo: CartaoEnum
    n_minuto_cartao: Optional[int] = None
    c_nome_jogador: Optional[str] = None
    c_nome_time: Optional[str] = None
    id_jogo: int

    class Config:
        from_attributes = True