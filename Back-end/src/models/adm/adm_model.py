from pydantic import BaseModel
from typing import Optional

class Adm(BaseModel):
    c_email_adm: Optional[str] = None
    c_Pnome_adm: Optional[str] = None
    c_Unome_adm: Optional[str] = None
    c_senha_adm: Optional[str] = None