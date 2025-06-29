import { BASE_URL } from "./config";

export async function postGol(gol, id_partida, id_jogador) {
    const res = await fetch(`${BASE_URL}/gol/?id_partida=${id_partida}&id_jogador=${id_jogador}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gol)
    });
    if (!res.ok) throw new Error("Erro ao cadastrar gol");
    return res.text();
}

export async function deleteGol(id_gol) {
    const res = await fetch(`${BASE_URL}/gol/?id_gol=${id_gol}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Erro ao deletar gol");
    return res.text();
}
