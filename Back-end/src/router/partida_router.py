from fastapi import APIRouter, HTTPException, Query
from src.models.jogador.jogador_model import Jogador
from src.models.cartao.cartao_model import Cartao
from src.models.partidaDropdown.PartidaDropdown_model import PartidaCreate
from typing import List, Optional


Jogador.model_rebuild()
Cartao.model_rebuild()

from src.models.partida.partida_model import Partida
from src.repository.partida import partida_repository as partida_rep

router = APIRouter(prefix="/partidas", tags=["Partidas"])

@router.get("/")
async def get_all_partidas(nome_campeonato: str = Query(...), ano_campeonato: int = Query(...)):
    result = partida_rep.get_all_ordered_partida(nome_campeonato, ano_campeonato)
    return result

@router.get("/time")
async def get_partidas_por_time(nome_time: str = Query(...)):   
    return partida_rep.get_partidas_por_time(nome_time)

@router.post("/")
async def create_partida(partida: PartidaCreate, nome_campeonato: str, ano_campeonato: int):
    partida_rep.insert_partida(partida, nome_campeonato, ano_campeonato)
    return "Tudo certo"

@router.delete("/")
async def delete_partida(id_partida: int = Query(...)):
    partida_rep.delete_partida(id_partida)
    return "ok"
