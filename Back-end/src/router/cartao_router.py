from fastapi import APIRouter, Query, status
from typing import List, Optional
from fastapi import HTTPException

from src.repository.cartao import cartao_repository as cartao_rep
from src.models.cartao.cartao_model import Cartao, CartaoResponse, CartaoCreate
from pydantic import BaseModel
from src.models.jogador.jogador_model import Jogador 
from src.constant.cartao_enum import CartaoEnum 


router = APIRouter(prefix="/cartao", tags=["Cartões"])

@router.get("/", response_model=List[CartaoResponse]) 
def get_cartoes(id_partida: int = Query(...)):
    return cartao_rep.get_cartoes_por_partida(id_partida)


@router.delete("/")
async def delete_cartao(id_cartao: int = Query(...)):
    response = cartao_rep.delete_cartao(id_cartao)
    return response

@router.post("/", response_model=dict[str, str], status_code=status.HTTP_201_CREATED)
async def create_cartao_route(cartao_data: CartaoCreate): # Recebe CartaoCreate no corpo
    try:
        # CHAMA A FUNÇÃO REAL DO REPOSITÓRIO para inserir o cartão
        response_message = cartao_rep.insert_cartao_action(cartao_data.model_dump())
        return {"message": response_message}
    except HTTPException as e:
        raise e
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro interno ao adicionar cartão: {e}")
