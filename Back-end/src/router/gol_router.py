# src/router/gol_router.py

from fastapi import APIRouter, Query
from typing import List, Optional

from src.models.gol.gol_model import Gol, GolResponse
from src.repository.gol import gol_repository as gol_rep
from src.models.jogador.jogador_model import Jogador 

Jogador.model_rebuild() 
Gol.model_rebuild() 
GolResponse.model_rebuild() 

router = APIRouter(prefix="/gol", tags=["Gol"])

@router.get("/", response_model=List[GolResponse]) 
def get_gols(id_partida: int = Query(...)):
    return gol_rep.get_gols_por_partida(id_partida)

@router.post("/")
async def post_gol(gol: Gol, id_partida: int = Query(...), id_jogador: int = Query(...)):
    response = gol_rep.insert_gol(gol, id_partida, id_jogador)
    return response

@router.delete("/")
async def delete_gol(id_gol: int = Query(...)):
    response = gol_rep.delete_gol(id_gol)
    return response 