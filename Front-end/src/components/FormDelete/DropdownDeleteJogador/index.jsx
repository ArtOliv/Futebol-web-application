import { useState } from 'react'
import ArrowIcon from '../../../assets/Arrow_icon.png'

function DropdownDeleteJogador(){
    const [aberto, setAberto] = useState(false)

    return(
        <>
            <div className="dropdown">
                <button className='dropdown-button' onClick={() => setAberto(!aberto)}>
                    <img src={ArrowIcon} alt='seta' className={`button-arrow ${aberto ? 'rotate' : ''}`}/>
                    <span className="dropdown-text">Deletar Jogador</span>
                </button>
                {aberto && (
                    <div className="input-container">
                        <form>
                            <label>Id do jogador:</label>
                            <input type="text"/>
                        </form>
                    </div>
                )}
            </div>
        </>
    )
}

export default DropdownDeleteJogador