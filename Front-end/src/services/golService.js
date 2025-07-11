import { BASE_URL } from "./config";
import axios from 'axios';


export async function getGolsPorPartida(id_partida) {
    const res = await fetch(`${BASE_URL}/gols/?id_partida=${id_partida}`);
    if (!res.ok) throw new Error("Erro ao buscar gols");
    return res.json();
}

// export async function postGol(gol, id_partida, id_jogador) {
//     const res = await fetch(`${BASE_URL}/gol/?id_partida=${id_partida}&id_jogador=${id_jogador}`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(gol)
//     });
//     if (!res.ok) throw new Error("Erro ao cadastrar gol");
//     return res.text();
// }

export async function deleteGol(id_gol) {
    const res = await fetch(`${BASE_URL}/gols/?id_gol=${id_gol}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Erro ao deletar gol");
    return res.text();
}

export async function postGol(golData) {
    try {
        const res = await axios.post(`${BASE_URL}/gols/`, golData);
        return res.data.message;
    } catch (error) {
        console.error("Erro ao adicionar gol:", error.response?.data || error.message);
        throw new Error(error.response?.data?.detail || "Erro ao adicionar gol.");
    }
}