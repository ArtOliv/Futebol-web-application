from fastapi import FastAPI
from src.router import time_routes, campeonato_router, partida_router, gol_router, jogador_router, cartao_router, classificacao_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
