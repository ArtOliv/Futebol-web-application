from __future__ import annotations

from src.constant.posicao_enum import Posicao
from datetime import date
from pydantic import BaseModel
from typing import Optional

from src.models.cartao.cartao_model import Cartao


class Jogador(BaseModel):
    id_jogador: Optional[int]
    c_Pnome_jogador: Optional[str] = None
    c_Unome_jogador: Optional[str] = None
    n_camisa: Optional[int] = None
    c_posicao: Optional[Posicao] = None
    d_data_nascimento: Optional[date] = None
    cartoes: Optional[list[Cartao]]= None

