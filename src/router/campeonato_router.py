from fastapi import APIRouter, Query
from src.repository.campeonato import campeonato_repository as camp_rep
from fastapi.responses import JSONResponse
router = APIRouter(prefix="/camp", tags=["Campeonatos"])


@router.post("")
async def post_campeonato(nome_campeonato: str = Query(...), ano_campeonato: int = Query(...)):
    camp_rep.insert_campeonato(nome_campeonato, ano_campeonato)
    return "Campeonato cadastrado com sucesso!"

@router.get("")
async def get_all_campeonato():
    camps = camp_rep.get_all_campeonato()
    return camps

@router.delete("")
async def delete_campeonato(nome_campeonato: str = Query(...), ano_campeonato: int = Query(...)):
    camp_rep.delete_campeonato(nome_campeonato, ano_campeonato)
    return "Campeonato deletado com sucesso!"


