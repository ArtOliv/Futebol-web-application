import { BASE_URL } from "./config";

export async function getEstatisticasJogadores(nome_campeonato, ano_campeonato) {
    const res = await fetch(`${BASE_URL}/stats/jogador?nome_campeonato=${encodeURIComponent(nome_campeonato)}&ano_campeonato=${ano_campeonato}`);
    if (!res.ok) throw new Error("Erro ao buscar estatísticas dos jogadores");
    return res.json();
}

export async function getEstatisticasJogadorGeral(id_jogador) {
    const res = await fetch(`${BASE_URL}/stats/jogador/${id_jogador}`);
    if (!res.ok) throw new Error("Erro ao buscar estatísticas do jogador");
    return res.json();
}


export async function getEstatisticasPartidas(nome_campeonato, ano_campeonato) {
    const res = await fetch(`${BASE_URL}/stats/partidas?nome_campeonato=${encodeURIComponent(nome_campeonato)}&ano_campeonato=${ano_campeonato}`);
    if (!res.ok) throw new Error("Erro ao buscar estatísticas dos Partidas");
    return res.json();
}
