from src.models.jogador.jogador_model import Jogador 
from pydantic import BaseModel, Field # Adicionado Field
from typing import Optional

# Se você tem um Enum CartaoEnum, ajuste conforme necessário
# from src.constant.cartao_enum import CartaoEnum

class CartaoCreate(BaseModel):
    id_jogo: int
    id_jogador: int
    n_minuto_cartao: int
    # ALTERADO: Nome do campo para c_tipo_cartao para bater com o frontend
    c_tipo_cartao: str = Field(..., description="Tipo do cartão (AMARELO ou VERMELHO)") 

class Cartao(BaseModel): 
    id_cartao: Optional[int] = None
    # No modelo Cartao (que reflete o DB), o nome da coluna é e_tipo
    e_tipo: Optional[str] = None # Ou CartaoEnum se você tem um Enum
    n_minuto_cartao: Optional[int] = None
    id_jogo: Optional[int] = None
    id_jogador: Optional[int] = None

class CartaoResponse(BaseModel):
    id_cartao: int 
    e_tipo: str 
    n_minuto_cartao: int 
    id_jogo: int 
    c_nome_jogador: Optional[str] = None 
    c_nome_time: Optional[str] = None 

    class Config:
        from_attributes = True