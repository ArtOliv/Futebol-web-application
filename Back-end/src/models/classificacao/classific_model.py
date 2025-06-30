from pydantic import BaseModel
from typing import Optional
class Classificacao(BaseModel):
    n_pontos: Optional[int] = None
    n_vitorias: Optional[int] = None
    n_derrotas: Optional[int] = None
    n_gols_pro: Optional[int] = None
    n_gols_contra: Optional[int] = None
    n_empates: Optional[int] = None
    n_jogos: Optional[int] = None
    n_saldo_gols: Optional[int] = None

