from enum import Enum

class CartaoEnum(Enum):
    AMARELO = 0
    VERMELHO = 1

    def __str__(self):
        return "amarelo" if self == CartaoEnum.AMARELO else "vermelho"