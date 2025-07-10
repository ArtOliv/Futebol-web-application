import './styles.css';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ShowPassword from '../../assets/Show_password.png';
import HidePassword from '../../assets/Hide_password.png';
import { loginAdm } from '../../services/loginService';

function Footer({ email, setEmail, senha, setSenha }) {
    const navigate = useNavigate();
    const [mostrarSenha, setMostrarSenha] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const resposta = await loginAdm(email, senha);

        if (resposta === "Login feito com sucesso") {
            navigate('/administrador/criar', { replace: true });
        } else {
            alert(resposta);
        }

        setLoading(false);
    };

    useEffect(() => {
        setEmail('');
        setSenha('');
        setMostrarSenha(false);
    }, []);

    return (
        <footer className="admin-footer">
            <form onSubmit={handleSubmit} className="admin-form">
                <label>
                    Admin:
                    <input
                        className="login-input"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Digite seu email"
                        required
                    />
                </label>
                <label>
                    Senha:
                    <div className="password-wrapper">
                        <input
                            type={mostrarSenha ? "text" : "password"}
                            value={senha}
                            onChange={e => setSenha(e.target.value)}
                            placeholder="••••••••••••"
                            required
                        />
                        <button
                            type="button"
                            className="show-password-button"
                            onClick={() => setMostrarSenha(prev => !prev)}
                        >
                            <img
                                className="eye-icon"
                                src={mostrarSenha ? HidePassword : ShowPassword}
                                alt={mostrarSenha ? "Ocultar" : "Mostrar"}
                            />
                        </button>
                    </div>
                </label>
                <button type="submit" className="submit-button" disabled={loading}>
                    {"Entrar"}
                </button>
            </form>
        </footer>
    );
}

export default Footer;
