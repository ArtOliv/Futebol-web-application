import { BASE_URL } from "./config";

export async function getAllTimes(nome, ano) {
    const res = await fetch(`${BASE_URL}/times/all?nome_campeonato=${nome}&ano_campeonato=${ano}`);
    if (!res.ok) throw new Error("Erro ao buscar times");
    return res.json();
}

export async function getTime(nome_time) {
    const res = await fetch(`${BASE_URL}/times/?nome_time=${nome_time}`);
    if (!res.ok) throw new Error("Erro ao buscar time");
    return res.json();
}

export async function postTime(time, nome, ano) {
    const res = await fetch(`${BASE_URL}/times/?nome_campeonato=${nome}&ano_campeonato=${ano}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(time)
    });
    if (!res.ok) throw new Error("Erro ao cadastrar time");
    return res.text();
}

export async function deleteTime(nome_time) {
    const res = await fetch(`${BASE_URL}/times/?nome_time=${nome_time}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Erro ao deletar time");
    return res.text();
}
