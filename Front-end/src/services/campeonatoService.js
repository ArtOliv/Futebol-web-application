import { BASE_URL } from "./config";

export async function getCampeonatos() {
    const res = await fetch(`${BASE_URL}/camp/`);
    if (!res.ok) throw new Error("Erro ao buscar campeonatos");
    return res.json();
}

export async function postCampeonato(nome, ano) {
    const res = await fetch(`${BASE_URL}/camp?nome_campeonato=${nome}&ano_campeonato=${ano}`, { method: "POST" });
    if (!res.ok) throw new Error("Erro ao cadastrar campeonato");
    return res.text();
}

export async function deleteCampeonato(nome, ano) {
    const res = await fetch(`${BASE_URL}/camp?nome_campeonato=${nome}&ano_campeonato=${ano}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Erro ao deletar campeonato");
    return res.text();
}