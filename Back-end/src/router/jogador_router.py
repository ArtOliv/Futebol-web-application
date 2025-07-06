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

@router.get("/", response_model=List[JogadorResponse])
async def get_jogadores_por_nome(
    name: Optional[str] = Query(None),
    nome_time: Optional[str] = Query(None)
):
    print(f"DEBUG: Endpoint GET /jogador/ executado. Valor de 'name': {name}, Valor de 'nome_time': {nome_time}")
    result_dicts = jog_rep.get_jogadores_por_nome(name=name, nome_time=nome_time)

    processed_results = []
    for row in result_dicts:
        new_row = row.copy()
        if 'c_posicao' in new_row and new_row['c_posicao'] is not None:
            pos_from_db = new_row['c_posicao'] 

            try:
                if isinstance(pos_from_db, int):
                    new_row['c_posicao'] = Posicao(pos_from_db)
                elif isinstance(pos_from_db, str):
                    # Adicione um mapeamento específico para MEIO-CAMPO
                    if pos_from_db.upper() == 'MEIO-CAMPO':
                        new_row['c_posicao'] = Posicao.MEIO_CAMPISTA # Mapeia para o enum correto
                    else:
                        pos_str_clean = pos_from_db.replace(' ', '_').replace('-', '_').upper()

                        if pos_str_clean in Posicao.__members__:
                            new_row['c_posicao'] = Posicao[pos_str_clean]
                        else:
                            try:
                                int_val = int(pos_str_clean)
                                new_row['c_posicao'] = Posicao(int_val)
                            except (ValueError, KeyError):
                                print(f"AVISO (Router): Posição '{pos_from_db}' do BD (string) não é um nome/valor de Enum válido. Setando para None.")
                                new_row['c_posicao'] = None
                else:
                    print(f"AVISO (Router): Posição '{pos_from_db}' do BD (tipo {type(pos_from_db).__name__}) não é um nome/valor de Enum válido. Setando para None.")
                    new_row['c_posicao'] = None

            except ValueError: 
                print(f"AVISO (Router): Posição '{pos_from_db}' do BD não corresponde a um valor numérico válido do Enum. Setando para None.")
                new_row['c_posicao'] = None
            except KeyError: 
                print(f"AVISO (Router): Posição '{pos_from_db}' do BD não corresponde a um nome válido do Enum. Setando para None.")
                new_row['c_posicao'] = None
                
        processed_results.append(new_row)
    return processed_results
