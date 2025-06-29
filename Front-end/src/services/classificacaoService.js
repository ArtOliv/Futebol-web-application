import { BASE_URL } from "./config";

export async function getClassificacaoGeral() {
    const res = await fetch(`${BASE_URL}/classificacao/`);
    if (!res.ok) throw new Error("Erro ao buscar classificação geral");
    return res.json();
}

export async function getClassificacaoPorTime(nome_time) {
    const res = await fetch(`${BASE_URL}/classificacao/time?nome_time=${nome_time}`);
    if (!res.ok) throw new Error("Erro ao buscar classificação do time");
    return res.json();
}