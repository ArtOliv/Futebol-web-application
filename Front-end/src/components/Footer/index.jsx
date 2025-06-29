import './styles.css'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import ShowPassword from '../../assets/Show_password.png'
import HidePassword from '../../assets/Hide_password.png'

const ADMIN_CREDENTIALS = {
    email: "adm@gmail.com",
    senha: "123"
}

function Footer({email, setEmail, senha, setSenha}){
    const navigate = useNavigate()
    const [mostrarSenha, setMostrarSenha] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()
        if(email === ADMIN_CREDENTIALS.email && senha === ADMIN_CREDENTIALS.senha){
            navigate('/administrador/criar', { replace: true })
        } else {
            alert("Credenciais de admin inválidas")
        }
    }

    useEffect(() => {
        setEmail("")
        setSenha("")
        setMostrarSenha(false)
    }, [])

    return (
        <footer className='admin-footer'>
            <form onSubmit={handleSubmit} className="admin-form">
                <label>
                    Admin:
                    <input className="login-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Digite seu email"/>
                </label>
                <label>
                    Senha:
                    <div className="password-wrapper">
                        <input type={mostrarSenha ? "text" : "password"} value={senha} onChange={e => setSenha(e.target.value)} placeholder="••••••••••••"/>
                        <button type="button"  className="show-password-button" onClick={() => setMostrarSenha(prev => !prev)}>
                            <img className="eye-icon" src={mostrarSenha ? HidePassword : ShowPassword} alt={mostrarSenha ? "Ocultar" : "Mostrar"}/>
                        </button>
                    </div>
                </label>
                <button type="submit" className="submit-button">Entrar</button>
            </form>
        </footer>
    )
}

export default Footer