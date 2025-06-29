import { BASE_URL } from "./config";

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
