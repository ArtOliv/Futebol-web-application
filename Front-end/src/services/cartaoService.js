import { BASE_URL } from "./config";
import axios from 'axios';


export async function getCartoesPorPartida(id_partida) {
    const res = await fetch(`${BASE_URL}/cartao/?id_partida=${id_partida}`);
    if (!res.ok) throw new Error("Erro ao buscar cartões");
    return res.json();
}

export async function insertCartao(cartao, id_partida, id_jogador) {
    const res = await fetch(`${BASE_URL}/cartao/?id_partida=${id_partida}&id_jogador=${id_jogador}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cartao)
    });
    if (!res.ok) throw new Error("Erro ao inserir cartão");
    return res.text();
}

export async function deleteCartao(id_cartao) {
    const res = await fetch(`${BASE_URL}/cartao/?id_cartao=${id_cartao}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Erro ao deletar cartão");
    return res.text();
}

//UPDATE JOGO
export async function postCartao(cartaoData) {
    try {
        const res = await axios.post(`${BASE_URL}/cartao/`, cartaoData);
        return res.data.message;
    } catch (error) {
        console.error("Erro ao adicionar cartão:", error.response?.data || error.message);
        throw new Error(error.response?.data?.detail || "Erro ao adicionar cartão.");
    }
}