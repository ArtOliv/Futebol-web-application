from fastapi import APIRouter
import bcrypt
from src.models.adm.adm_model import Adm
import pymysql


router = APIRouter(prefix="/login", tags=["Login"])

@router.post("/")
async def login(adm: Adm):
    result = authenticate(adm.c_email_adm, adm.c_senha_adm)
    return result


def authenticate(email: str, senha: str):
    conn = pymysql.connect(
        host="mysql",
        user="root",
        port=3306,
        password="root",
        database="meu_banco",
        charset="utf8mb4"
    )
    try:
        with conn.cursor() as cursor:
            cursor.execute("SELECT c_senha_adm FROM Administrador WHERE c_email_adm = %s", email)
            resultado = cursor.fetchone()
            if resultado:
                hash_db = resultado[0]
                if bcrypt.checkpw(senha.encode("utf-8"), hash_db.encode("utf-8")):
                    return "Login feito com sucesso"
                else:
                    return "Senha incorreta"
            else:
                return "Usuario nao encontrado"
    finally:
        conn.close()

@router.post("/signup")
async def signup(adm: Adm):
    conn = pymysql.connect(
        host="mysql",
        user="root",
        port=3306,
        password="root",
        database="meu_banco",
        charset="utf8mb4"
    )
    hash_senha = bcrypt.hashpw(adm.c_senha_adm.encode("utf-8"), bcrypt.gensalt())
    try:
        with conn.cursor() as cursor:
            query = "INSERT INTO Administrador VALUES (%s, %s, %s, %s)"
            cursor.execute(query, (adm.c_email_adm, adm.c_Pnome_adm, adm.c_Unome_adm, hash_senha.decode()))
            conn.commit()
    finally:
        conn.close()