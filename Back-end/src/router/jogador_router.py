from fastapi import APIRouter, HTTPException, Query

from src.models.jogador.jogador_model import Jogador
from src.repository.jogador import jogador_repository as jog_rep

router = APIRouter(prefix="/jogador", tags=["Jogador"])

@router.get("/")
async def get_jogadores_por_nome(name: str = Query(...)):
    result = jog_rep.get_jogadores_por_nome(name)
    return result

@router.get("/{id}")
async def get_jogador_por_id(id: int):
    result = jog_rep.get_jogador_por_id(id)
    return result 

@router.post("/")
async def insert_jogador(jogador: Jogador, nome_time: str = Query(...)):
    jog_rep.insert_jogador(jogador, nome_time)
    return "Jogador cadastrado com sucesso."

@router.delete("/")
async def delete_jogador(id_jogador: int = Query(...)):
    jog_rep.delete_jogador(id_jogador)
    return "Jogador deletado com sucesso."
