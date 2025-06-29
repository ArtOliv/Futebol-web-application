import { useState } from 'react'
import ArrowIcon from '../../../assets/Arrow_icon.png'

function DropdownDeleteJogos(){
    const [aberto, setAberto] = useState(false)

    return(
        <>
            <div className="dropdown">
                <button className='dropdown-button' onClick={() => setAberto(!aberto)}>
                    <img src={ArrowIcon} alt='seta' className={`button-arrow ${aberto ? 'rotate' : ''}`}/>
                    <span className="dropdown-text">Deletar jogo</span>
                </button>
                {aberto && (
                    <div className="input-container">
                        <form>
                            <label>Id da partida:</label>
                            <input type="text"/>
                        </form>
                    </div>
                )}
            </div>
        </>
    )
}

export default DropdownDeleteJogos