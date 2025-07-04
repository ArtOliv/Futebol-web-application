import { BASE_URL } from "./config";

export async function getJogadoresPorNome(name) {
    const res = await fetch(`${BASE_URL}/jogador/?name=${encodeURIComponent(name)}`);
    if (!res.ok) throw new Error("Erro ao buscar jogadores");
    return res.json();
}

export async function getJogadoresPorId(id) {
    const res = await fetch(`${BASE_URL}/jogador/${id}`);
    if (!res.ok) throw new Error("Erro ao buscar jogador por ID");
    return res.json();
}

export async function insertJogador(jogadorCreate, nome_time) {
    const res = await fetch(`${BASE_URL}/jogador/?nome_time=${nome_time}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jogadorCreate)
    });
    if (!res.ok) throw new Error("Erro ao cadastrar jogador");
    return res.text();
}

export async function deleteJogador(id_jogador) {
    const res = await fetch(`${BASE_URL}/jogador/?id_jogador=${id_jogador}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Erro ao deletar jogador");
    return res.text();
}

export async function getJogadoresForDropdown(name = null, nomeTime = null) {
    let url = `${BASE_URL}/jogador/`;
    const params = new URLSearchParams();

    if (name) {
        params.append('name', name);
    }
    if (nomeTime) {
        params.append('nome_time', nomeTime);
    }

    if (params.toString()) {
        url += `?${params.toString()}`;
    }

    const res = await fetch(url);
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Erro ao buscar jogadores para dropdown: ${res.status} - ${errorText}`);
    }
    return res.json();
}
