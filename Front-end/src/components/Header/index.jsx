import './styles.css'
import appLogo from '../../assets/appLogo.png'

function Header(){
    return(
        <header>
            <div className='head-buttons'>
                <ul className='button-bar'>
                    <li>Início</li>
                    <li>Jogos</li>
                    <li>Campeonatos</li>
                </ul>
            </div>
        </header>
    )
}

export default Header