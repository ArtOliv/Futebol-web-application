import axios from 'axios';
import { LOGIN_URL } from "./config";

export async function loginAdm(email, senha) {
    try {
        const response = await axios.post(LOGIN_URL, {
            c_email_adm: email,
            c_senha_adm: senha
        });
        return response.data;
    } catch (error) {
        console.error("Erro na requisição de login:", error);
        return "Erro na requisição de login";
    }
}