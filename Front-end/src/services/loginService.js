import { LOGIN_URL } from "./config";

export async function loginAdm(email, senha) {
    try {
        const response = await fetch(LOGIN_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                c_email_adm: email,
                c_senha_adm: senha
            })
        });

        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Erro ao autenticar:", error);
        return "Erro na requisição";
    }
}

