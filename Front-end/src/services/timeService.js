// src/services/timeService.js
import { BASE_URL } from "./config";

export async function getTime(nome_time) {
    const res = await fetch(`${BASE_URL}/times/?nome_time=${encodeURIComponent(nome_time)}`);
    if (res.status === 404) {
        return null;
    }
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Erro ao buscar time: ${res.status} - ${errorText}`);
    }
    return res.json();
}

export async function postTime(timeData, nome_campeonato, ano_campeonato) {
    const url = `${BASE_URL}/times/?nome_campeonato=${encodeURIComponent(nome_campeonato)}&ano_campeonato=${ano_campeonato}`;
    
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(timeData)
    });

    if (!res.ok) {
        let errorDetail = "Erro desconhecido ao cadastrar time.";
        try {
            const errorJson = await res.json(); 
            if (errorJson && errorJson.detail) {
                if (Array.isArray(errorJson.detail)) {
                    errorDetail = errorJson.detail.map(err => `${err.loc.join('.')} -> ${err.msg}`).join('; ');
                } else {
                    errorDetail = errorJson.detail;
                }
            }
        } catch (e) {
            errorDetail = await res.text();
        }
        throw new Error(`Erro ao cadastrar time: ${res.status} - ${errorDetail}`);
    }
    return res.text();
}

export async function deleteTime(nome_time) {
    const res = await fetch(`${BASE_URL}/times/?nome_time=${encodeURIComponent(nome_time)}`, { method: "DELETE" });
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Erro ao deletar time: ${res.status} - ${errorText}`);
    }
    return res.text();
}
