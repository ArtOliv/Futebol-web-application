from fastapi import APIRouter, HTTPException, Query
from src.models.jogador.jogador_model import Jogador # Assuming Jogador model still exists/is needed
from src.models.cartao.cartao_model import Cartao # <--- Ensure Cartao is imported
# from src.models.partidaDropdown.PartidaDropdown_model import PartidaCreate # This still seems like a leftover import
from typing import List, Optional

# Ensure these are correctly imported
from src.models.partida.partida_model import Partida, PartidaCreate
from src.repository.partida import partida_repository as partida_rep
from src.models.gol.gol_model import Gol # <--- Ensure Gol is imported if Partida uses it
from src.models.estadio.estadio_model import Estadio # <--- Ensure Estadio is imported if Partida uses it

# It's good practice to rebuild all models that might have circular or forward references
# Especially if you import them early and then use them in other models.
Jogador.model_rebuild() # You already had this for Jogador
Cartao.model_rebuild() # You already had this for Cartao
Gol.model_rebuild() # <--- ADD THIS IF Gol is used as a type hint in Partida
Estadio.model_rebuild() # <--- ADD THIS IF Estadio is used as a type hint in Partida
Partida.model_rebuild() # <--- !!! CRITICAL FIX FOR THIS ERROR !!!

router = APIRouter(prefix="/partidas", tags=["Partidas"])

@router.get("/")
async def get_all_partidas(nome_campeonato: str = Query(...), ano_campeonato: int = Query(...)):
    result = partida_rep.get_all_ordered_partida(nome_campeonato, ano_campeonato)
    return result

@router.get("/time", response_model=List[Partida]) # <--- Now Partida should be fully defined
async def get_partidas_por_time(nome_time: str = Query(...)):
    return partida_rep.get_partidas_por_time(nome_time)

@router.post("/")
async def create_partida(partida: PartidaCreate, nome_campeonato: str, ano_campeonato: int):
    response = partida_rep.insert_partida(partida, nome_campeonato, ano_campeamento) # Corrected ano_campeonato var here
    return response

@router.delete("/")
async def delete_partida(id_partida: int = Query(...)):
    response = partida_rep.delete_partida(id_partida)
    return response