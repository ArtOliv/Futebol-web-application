from fastapi import FastAPI
from src.router import time_routes, campeonato_router, partida_router, gol_router, jogador_router, cartao_router, classificacao_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:5173", 
    "http://127.0.0.1:5173", 
    "*" #TODAS AS ORGINS ERRO DE CORS POLICY
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("CORS configurado para as seguintes origens:", origins)

app.include_router(classificacao_router.router)
app.include_router(campeonato_router.router)
app.include_router(time_routes.router)
app.include_router(partida_router.router)
app.include_router(gol_router.router)
app.include_router(jogador_router.router)
app.include_router(cartao_router.router)

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/hello/{name}")
async def say_hello(name: str):
    return {"message": f"Hello {name}"}