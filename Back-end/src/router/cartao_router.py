from fastapi import APIRouter, Query
from src.repository.cartao import cartao_repository as cartao_rep
from src.models.cartao.cartao_model import Cartao

router = APIRouter(prefix="/cartao", tags=["Cartao"])

@router.get("/")
def get_cartoes(id_partida: int = Query(...)):
    return cartao_rep.get_cartoes_por_partida(id_partida)

@router.post("/")
def insert_cartao(cartao: Cartao, id_partida: int = Query(...), id_jogador: int = Query(...)):
    cartao_rep.insert_cartao(cartao, id_partida, id_jogador)
    return "Cartao inserido com sucesso."

@router.delete("/")
def delete_cartao(id_cartao: int = Query(...)):
    cartao_rep.delete_cartao(id_cartao)
    return "Cartão removido com sucesso."