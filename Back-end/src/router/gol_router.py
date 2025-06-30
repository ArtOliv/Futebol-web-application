from fastapi import APIRouter, Query

from src.models.gol.gol_model import Gol
from src.repository.gol import gol_repository as gol_rep

router = APIRouter(prefix="/gol", tags=["Gol"])

@router.get("/")
def get_gols(id_partida: int = Query(...)):
    return gol_rep.get_gols_por_partida(id_partida)

@router.post("/")
async def post_gol(gol: Gol, id_partida: int = Query(...), id_jogador: int = Query(...)):
    gol_rep.insert_gol(gol, id_partida, id_jogador)
    return "Gol inserido com sucesso."

@router.delete("/")
async def delete_gol(id_gol: int = Query(...)):
    gol_rep.delete_gol(id_gol)
    return "Gol deletado com sucesso."
