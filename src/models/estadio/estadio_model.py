from pydantic import BaseModel
from typing import Optional

class Estadio(BaseModel):
    c_nome_estadio: Optional[str] = None
    c_cidade_estadio: Optional[str] = None
    n_capacidade: Optional[int] = None