
import { BASE_URL } from "./config";

export async function getCampeonatos(nome = '', ano = null) { 
    let url = `${BASE_URL}/camp`;
    const params = new URLSearchParams();

    if (nome) {
        params.append('nome_campeonato', nome);
    }
    if (ano !== null && !isNaN(ano)) { 
        params.append('ano_campeonato', ano);
    }

    if (params.toString()) {
        url += `?${params.toString()}`;
    }

    const res = await fetch(url);
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Erro ao buscar campeonatos: ${res.status} - ${errorText}`);
    }
    return res.json();
}

export async function postCampeonato(nome, ano) {
    const res = await fetch(`${BASE_URL}/camp?nome_campeonato=${encodeURIComponent(nome)}&ano_campeonato=${ano}`, { method: "POST" });
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Erro ao cadastrar campeonato: ${res.status} - ${errorText}`);
    }
    return res.text();
}

export async function deleteCampeonato(nome, ano) {
    const res = await fetch(`${BASE_URL}/camp?nome_campeonato=${encodeURIComponent(nome)}&ano_campeonato=${ano}`, { method: "DELETE" });
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Erro ao deletar campeonato: ${res.status} - ${errorText}`);
    }
    return res.text();
}
