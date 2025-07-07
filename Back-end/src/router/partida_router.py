from fastapi import APIRouter, HTTPException, Query, Path
from src.models.jogador.jogador_model import Jogador 
from src.models.cartao.cartao_model import Cartao 
from typing import List, Optional, List, Dict

from src.models.partida.partida_model import Partida, PartidaCreate, PartidaUpdate
from src.repository.partida import partida_repository as partida_rep
from src.models.gol.gol_model import Gol 
from src.models.estadio.estadio_model import Estadio 

Jogador.model_rebuild() 
Cartao.model_rebuild() 
Gol.model_rebuild()
Estadio.model_rebuild() 
Partida.model_rebuild()

router = APIRouter(prefix="/partidas", tags=["Partidas"])

@router.get("/")
async def get_all_partidas(nome_campeonato: str = Query(...), ano_campeonato: int = Query(...)):
    result = partida_rep.get_all_ordered_partida(nome_campeonato, ano_campeonato)
    return result

@router.get("/time", response_model=List[Partida]) 
async def get_partidas_por_time(nome_time: str = Query(...)):
    return partida_rep.get_partidas_por_time(nome_time)

@router.post("/")
async def create_partida(partida: PartidaCreate, nome_campeonato: str, ano_campeonato: int):
    response = partida_rep.insert_partida(partida, nome_campeonato, ano_campeonato) 
    return response

@router.delete("/")
async def delete_partida(id_partida: int = Query(...)):
    response = partida_rep.delete_partida(id_partida)
    return response


#PARA UPDATE JOGO
@router.get("/{id_partida}", response_model=Partida) 
async def get_partida_by_id_route(id_partida: int = Path(...)):
    partida = partida_rep.get_partida_by_id(id_partida) 
    if not partida:
        raise HTTPException(status_code=404, detail="Partida não encontrada")
    return partida

@router.put("/{id_partida}", response_model=Dict[str, str]) 
async def update_partida_route(
    partida_data: PartidaUpdate,
    id_partida: int = Path(...)
    
):
    try:
        partida_dict = partida_data.model_dump(exclude_unset=True)
        message = partida_rep.update_partida(id_partida, partida_dict)
        return {"message": message}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Erro interno ao atualizar partida: {e}")
