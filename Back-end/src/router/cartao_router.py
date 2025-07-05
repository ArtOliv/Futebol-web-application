from fastapi import APIRouter, Query
from typing import List, Optional 

from src.repository.cartao import cartao_repository as cartao_rep
from src.models.cartao.cartao_model import Cartao, CartaoResponse 

from src.models.jogador.jogador_model import Jogador 
from src.constant.cartao_enum import CartaoEnum 
Cartao.model_rebuild() 
CartaoResponse.model_rebuild()

router = APIRouter(prefix="/cartao", tags=["Cartao"])

@router.get("/", response_model=List[CartaoResponse]) 
def get_cartoes(id_partida: int = Query(...)):
    return cartao_rep.get_cartoes_por_partida(id_partida)

@router.post("/")
def insert_cartao(cartao: Cartao, id_partida: int = Query(...), id_jogador: int = Query(...)):
    response = cartao_rep.insert_cartao(cartao, id_partida, id_jogador)
    return response

@router.delete("/")
async def delete_cartao(id_cartao: int = Query(...)):
    response = cartao_rep.delete_cartao(id_cartao)
    return response