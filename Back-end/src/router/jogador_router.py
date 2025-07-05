from fastapi import APIRouter, HTTPException, Query, Depends, status 
from src.models.jogador.jogador_model import JogadorCreate, JogadorResponse
from src.repository.jogador.jogador_repository import insert_jogador
from src.repository.jogador import jogador_repository as jog_rep
from typing import Dict, Any, List, Optional
from src.constant.posicao_enum import Posicao
import traceback 




router = APIRouter(prefix="/jogador", tags=["Jogador"])

# @router.get("/")
# async def get_jogadores_por_nome(name: str = Query(...)):
#     result = jog_rep.get_jogadores_por_nome(name)
#     return result

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

@router.get("/", response_model=List[JogadorResponse]) # <--- CHANGE THIS LINE to JogadorResponse
async def get_jogadores_por_nome(
    name: Optional[str] = Query(None),
    nome_time: Optional[str] = Query(None)
):
    print(f"DEBUG: Endpoint GET /jogador/ executado. Valor de 'name': {name}, Valor de 'nome_time': {nome_time}")
    # This function from your repository MUST return dictionaries that have 'id_jogador' and 'nome_time'
    result_dicts = jog_rep.get_jogadores_por_nome(name=name, nome_time=nome_time)

    processed_results = []
    for row in result_dicts:
        new_row = row.copy()
        if 'c_posicao' in new_row and new_row['c_posicao'] is not None:
            pos_str_raw = new_row['c_posicao']
            if isinstance(pos_str_raw, str):
                pos_str_clean = pos_str_raw.replace('-', '_').upper()
                if not pos_str_clean:
                    new_row['c_posicao'] = None
                else:
                    try:
                        new_row['c_posicao'] = Posicao[pos_str_clean]
                    except KeyError:
                        print(f"AVISO (Router): Posição '{pos_str_raw}' do BD não é um nome de Enum válido. Setando para None.")
                        new_row['c_posicao'] = None
            else:
                new_row['c_posicao'] = None
        processed_results.append(new_row)

    # FastAPI will automatically convert the `processed_results` (list of dicts)
    # into a List of `JogadorResponse` instances because of `response_model`.
    # It will pick up 'id_jogador', 'nome_time', and all fields from JogadorCreate.
    return processed_results # <--- Return the raw dicts, FastAPI does the Pydantic conversion

