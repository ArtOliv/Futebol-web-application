from enum import IntEnum

class Posicao(IntEnum): 
    GOLEIRO = 0
    ZAGUEIRO = 1
    LATERAL_ESQUERDO = 2 
    LATERAL_DIREITO = 3
    MEIO_CAMPISTA = 4    
    ATACANTE = 5

    def __str__(self): 
        return self.name.replace('_', ' ').title()