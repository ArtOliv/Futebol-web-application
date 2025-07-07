# src/router/gol_router.py

from fastapi import APIRouter, Query, status, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from src.models.gol.gol_model import Gol, GolResponse, GolCreate
from src.repository.gol import gol_repository as gol_rep
from src.models.jogador.jogador_model import Jogador 



router = APIRouter(prefix="/gols", tags=["Gols"])



@router.get("/", response_model=List[GolResponse]) 
def get_gols(id_partida: int = Query(...)):
    return gol_rep.get_gols_por_partida(id_partida)


@router.delete("/")
async def delete_gol(id_gol: int = Query(...)):
    response = gol_rep.delete_gol(id_gol)
    return response 


#UPDATE JOGO
# ENDPOINT POST ÚNICO E CORRETO para ADICIONAR GOL
# Este endpoint recebe um objeto GolCreate no CORPO da requisição
@router.post("/", response_model=dict[str, str], status_code=status.HTTP_201_CREATED)
async def create_gol_route(gol_data: GolCreate): # Recebe GolCreate no corpo, como esperado pelo frontend
    try:
        # CHAMA A FUNÇÃO REAL DO REPOSITÓRIO para inserir o gol
        response_message = gol_rep.insert_gol_action(gol_data.model_dump()) # Adapte o nome da função no repositório
        return {"message": response_message}
    except HTTPException as e:
        raise e
    except Exception as e:
        import traceback # Garanta que traceback está importado se usar
        traceback.print_exc()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro interno ao adicionar gol: {e}")


