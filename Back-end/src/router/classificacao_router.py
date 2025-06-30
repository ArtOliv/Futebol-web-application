from fastapi import APIRouter, Query, HTTPException
from fastapi.responses import JSONResponse
from src.repository.classificacao import classificacao_repository as class_rep
from src.models.classificacao.classific_model import Classificacao

router = APIRouter(prefix="/classificacao", tags=["Classificação"])

@router.get("/")
async def get_all_ordered_classificacao():
    try:
        classificacoes = class_rep.get_all_ordered_classificacao()
        return classificacoes
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/time")
async def get_classificacao(nome_time: str = Query(...)):
    try:
        classificacao = class_rep.get_classificacao(nome_time)
        if not classificacao:
            raise HTTPException(status_code=404, detail="Time não encontrado na classificação.")
        return classificacao
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))