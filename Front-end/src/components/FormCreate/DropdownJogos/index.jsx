import { useState } from 'react'
import ArrowIcon from '../../../assets/Arrow_icon.png'
function DropDownJogos(){
    const [aberto, setAberto] = useState(false)

    return(
        <>
            <div className="dropdown">
                <button className='dropdown-button' onClick={() => setAberto(!aberto)}>
                    <img src={ArrowIcon} alt='seta' className={`button-arrow ${aberto ? 'rotate' : ''}`}/>
                    <span className="dropdown-text">Adicionar jogos</span>
                </button>
                {aberto && (
                    <div className="input-container">
                        <form>
                            <label>Mandante:</label>
                            <input type="text"/>
                            <label>Visitante:</label>
                            <input type="text"/>
                            <label>Rodada:</label>
                            <input type="text"/>
                            <label>Estádio:</label>
                            <input type="text"/>
                            <label>Data:</label>
                            <input type="text"/>
                            <label>Horário:</label>
                            <input type="text"/>
                        </form>
                    </div>
                )}
            </div>
        </>
    )
}

export default DropDownJogos