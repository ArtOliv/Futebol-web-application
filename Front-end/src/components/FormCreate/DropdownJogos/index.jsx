import { useState } from 'react'
import ArrowIcon from '../../../assets/Arrow_icon.png'

function DropDownJogos(){
    const [aberto, setAberto] = useState(false)
    const [abreEstadio, setAbreEstadio] = useState(false)

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
                            <label>Data:</label>
                            <input type="date"/>
                            <label>Horário:</label>
                            <input type="time"/>
                            <button className='sub-dropdown-button' onClick={(e) => {e.preventDefault(); setAbreEstadio(!abreEstadio)}}>
                                <img src={ArrowIcon} alt='seta' className={`button-arrow ${abreEstadio ? 'rotate' : ''}`}/>
                                <span className="sub-dropdown-text">Estádio</span>
                            </button>
                            {abreEstadio && (
                                <div className="sub-dropdown-content">
                                    <label>Nome:</label>
                                    <input type="text"/>
                                    <label>Cidade:</label>
                                    <input type="text"/>
                                    <label>Capacidade:</label>
                                    <input type="text"/>
                                </div>
                            )}
                        </form>
                    </div>
                )}
            </div>
        </>
    )
}

export default DropDownJogos