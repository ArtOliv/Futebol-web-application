import './styles.css'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import ShowPassword from '../../assets/Show_password.png'
import HidePassword from '../../assets/Hide_password.png'

const ADMIN_CREDENTIALS = {
    cpf: "12345678910",
    senha: "123"
}

function Footer({cpf, setCpf, senha, setSenha}){
    const navigate = useNavigate()
    const [mostrarSenha, setMostrarSenha] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()
        if(cpf === ADMIN_CREDENTIALS.cpf && senha === ADMIN_CREDENTIALS.senha){
            navigate('/administrador/criar', { replace: true })
        } else {
            alert("Credenciais de admin inválidas")
        }
    }

    useEffect(() => {
        setCpf("")
        setSenha("")
        setMostrarSenha(false)
    }, [])

    return (
        <footer className='admin-footer'>
            <form onSubmit={handleSubmit} className="admin-form">
                <label>
                    Admin:
                    <input className="login-input" type="text" value={cpf} onChange={e => setCpf(e.target.value)} placeholder="CPF"/>
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