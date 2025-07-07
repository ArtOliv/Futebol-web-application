import { BASE_URL } from "./config";
import axios from 'axios';

export async function getPartidas(nome, ano) {
    const res = await fetch(`${BASE_URL}/partidas/?nome_campeonato=${nome}&ano_campeonato=${ano}`);
    if (!res.ok) throw new Error("Erro ao buscar partidas");
    return res.json();
}

export async function getPartidasPorTime(nome_time) {
    const res = await fetch(`${BASE_URL}/partidas/time?nome_time=${nome_time}`);
    if (!res.ok) throw new Error("Erro ao buscar partidas do time");
    return res.json();
}

export async function postPartida(partida, nome, ano) {
    const res = await fetch(`${BASE_URL}/partidas/?nome_campeonato=${nome}&ano_campeonato=${ano}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(partida)
    });
    if (!res.ok) throw new Error("Erro ao cadastrar partida");
    return res.text();
}

export async function deletePartida(id_partida) {
    const res = await fetch(`${BASE_URL}/partidas/?id_partida=${id_partida}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Erro ao deletar partida");
    return res.text();
}

//PARA UPDATE JOGO
export async function getPartidaPorId(id_partida) {
    try {
        const res = await axios.get(`${BASE_URL}/partidas/${id_partida}`);
        return res.data;
    } catch (error) {
        console.error(`Erro ao buscar partida por ID ${id_partida}:`, error.response?.data || error.message);
        throw new Error(error.response?.data?.detail || "Erro ao buscar partida.");
    }
}

//PARA UPDATE PARTIDA
export async function updatePartida(id_partida, partidaData) {
    try {
        const res = await axios.put(`${BASE_URL}/partidas/${id_partida}`, partidaData);
        return res.data.message;
    } catch (error) {
        console.error(`Erro ao atualizar partida ID ${id_partida}:`, error.response?.data || error.message);
        throw new new Error(error.response?.data?.detail || "Erro ao atualizar partida.");
    }
}

