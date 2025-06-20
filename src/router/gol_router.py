from fastapi import APIRouter, Query

from src.models.gol.gol_model import Gol
from src.repository.gol import gol_repository as gol_rep

router = APIRouter(prefix="/gol", tags=["Gol"])

@router.post("/")
async def post_gol(gol: Gol, id_partida: int = Query(...), id_jogador: int = Query(...)):
    gol_rep.insert_gol(gol, id_partida, id_jogador)
    print(gol)
    return gol

