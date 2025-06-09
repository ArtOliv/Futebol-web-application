import './styles.css'
import { NavLink } from 'react-router-dom'

function Header(){
    return(
        <header>
            <div className='head-buttons'>
                <ul className='button-bar'>
                    <li><NavLink to="/" className="menu-btn">Classificação</NavLink></li>
                    <li><NavLink to="/jogos" className="menu-btn">Jogos</NavLink></li>
                    <li><NavLink to="/times" className="menu-btn">Times</NavLink></li>
                    <li><NavLink to="/jogadores" className="menu-btn">Jogadores</NavLink></li>
                </ul>
            </div>
        </header>
    )
}

export default Header