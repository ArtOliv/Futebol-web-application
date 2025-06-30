from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse

from src.models.time.time_model import Time
from src.repository.time import time_repository as time_rep

router = APIRouter(prefix="/times", tags=["Times"])

@router.get("/")
async def get_time(nome_time: str = Query(...)):
    time = time_rep.get_time(nome_time)
    if not time:
        raise HTTPException(status_code=404, detail="Time não encontrado")
    return time

@router.post("/")
async def post_time(time: Time, nome_campeonato: str = Query(...), ano_campeonato: int = Query(...)):
    time_rep.insert_time(time, nome_campeonato, ano_campeonato)
    return "Time cadastrado com sucesso!"

@router.delete("/")
async def delete_time(nome_time: str = Query(...)):
    time_rep.delete_time(nome_time)
    return "ok"