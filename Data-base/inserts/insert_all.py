import getpass
import os

from insert_jogos import importar_jogos
from insert_jogadores import importar_jogadores
from insert_gols import importar_gols
from insert_cartoes import importar_cartoes

def main():
    senha = getpass.getpass("Digite a senha do banco de dados: ")
    os.environ['DB_PASSWORD'] = senha

    print("\n=== Importando jogos ===")
    importar_jogos()

    print("\n=== Importando jogadores ===")
    importar_jogadores()

    print("\n=== Importando gols ===")
    importar_gols()

    print("\n=== Importando cartões ===")
    importar_cartoes()

if __name__ == "__main__":
    main()