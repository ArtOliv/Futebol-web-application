from fastapi import APIRouter, HTTPException, Query, Depends, status 
from src.models.jogador.jogador_model import JogadorCreate
from src.repository.jogador.jogador_repository import insert_jogador
from src.repository.jogador import jogador_repository as jog_rep
from typing import Dict, Any 
import traceback 




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
async def create_jogador_route(
    jogador_data: JogadorCreate,
    nome_time: str = Query(..., description="Nome do time ao qual o jogador pertence")
):
    try:
        jogador_dict = jogador_data.model_dump() 
        response_message = insert_jogador(jogador_dict, nome_time)
        return {"message": response_message["message"]}
    except HTTPException as e:
        raise e
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro interno do servidor: {e}")

@router.delete("/")
async def delete_jogador(id_jogador: int = Query(...)):
    jog_rep.delete_jogador(id_jogador)
    return "Jogador deletado com sucesso."
