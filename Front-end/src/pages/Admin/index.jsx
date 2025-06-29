import { useNavigate, useLocation } from 'react-router-dom'
import './styles.css'
import FormCreate from '../../components/FormCreate'
import FormUpdate from '../../components/FormUpdate'
import FormDelete from '../../components/FormDelete'

function Admin({mode}){
    const navigate = useNavigate()
    const location = useLocation()

    const handleLogout = () => {
        const confirmLogout = window.confirm("Tem certeza que deseja sair?")
        if(confirmLogout){
            navigate('/', { replace: true })
        }
    }

    return(
        <>
            <div className="main-adm-page">
                <div className="left-bar">
                    <h2 className="menu-label">Menu</h2>
                    <hr></hr>
                    <button className={`bar-button ${location.pathname === '/administrador/criar' ? 'active' : ''}`} onClick={() => navigate('/administrador/criar')}>Criar</button>
                    <button className={`bar-button ${location.pathname === '/administrador/atualizar' ? 'active' : ''}`} onClick={() => navigate('/administrador/atualizar')}>Atualizar</button>
                    <button className={`bar-button ${location.pathname === '/administrador/deletar' ? 'active' : ''}`} onClick={() => navigate('/administrador/deletar')}>Deletar</button>
                    <div className="logout-container">
                        <hr></hr>
                        <button className="logout-button" onClick={handleLogout}>Logout</button>
                    </div>
                </div>
                <div className="adm-container">
                    {mode === 'create' && <FormCreate />}
                    {mode === 'update' && <FormUpdate />}
                    {mode === 'delete' && <FormDelete />}
                </div>
            </div>    
        </>
    )
}

export default Admin