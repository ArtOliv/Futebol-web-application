from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import date 
from src.constant.posicao_enum import Posicao


class JogadorCreate(BaseModel):
    c_Pnome_jogador: str 
    c_Unome_jogador: Optional[str] = None 
    n_camisa: Optional[int] = None 
    c_posicao: Optional[Posicao] = None 
    d_data_nascimento: Optional[date] = None 


class Jogador(JogadorCreate): 
    cartoes: Optional[list] = None 
    class Config:
        from_attributes = True
        json_encoders = {Posicao: lambda v: str(v)}

# This model is for reading/returning player data from the database (includes ID and team name)
class JogadorResponse(JogadorCreate): # Inherit from JogadorCreate to reuse its fields
    id_jogador: int # <--- ADD THIS: The unique ID from the database
    nome_time: str  # <--- ADD THIS: The name of the player's team

    # Optional: If you also want to include 'cartoes' when reading a player, add it here.
    # Note: If 'cartoes' are complex objects, you might need a Pydantic model for Cartao as well.
    cartoes: Optional[List[Any]] = None # Use List[Any] or define a Cartao model if applicable

    class Config:
        from_attributes = True # This tells Pydantic to try to assign attributes directly from the object returned by ORM/DB
        json_encoders = {Posicao: lambda v: str(v)} # Keep this for enum serialization
