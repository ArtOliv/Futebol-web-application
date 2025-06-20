from fastapi import FastAPI
from src.router import time_routes, campeonato_router, partida_router, gol_router

app = FastAPI()

app.include_router(campeonato_router.router)
app.include_router(time_routes.router)
app.include_router(partida_router.router)
app.include_router(gol_router.router)
@app.get("/")
async def root():
    return {"message": "Hello World"}


@app.get("/hello/{name}")
async def say_hello(name: str):
    return {"message": f"Hello {name}"}
