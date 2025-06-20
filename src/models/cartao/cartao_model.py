from __future__ import annotations
from src.constant.cartao_enum import CartaoEnum
# from src.models.jogador.jogador_model import Jogador
from typing import TYPE_CHECKING
from pydantic import BaseModel
from typing import Optional

if TYPE_CHECKING:
    from src.models.jogador.jogador_model import Jogador

class Cartao(BaseModel):
    e_tipo: Optional[CartaoEnum] = None
    n_minuto_cartao: Optional[int] = None
    jogador: Optional[Jogador] = None
