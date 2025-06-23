import { useState } from 'react'
import ArrowIcon from '../../../assets/Arrow_icon.png'

function DropDownTimes(){
    const [aberto, setAberto] = useState(false)
    const [abreJogadores, setAbreJogadores] = useState(false)

    return(
        <>
            <div className="dropdown">
                <button className='dropdown-button' onClick={() => setAberto(!aberto)}>
                    <img src={ArrowIcon} alt='seta' className={`button-arrow ${aberto ? 'rotate' : ''}`}/>
                    <span className="dropdown-text">Adicionar times</span>
                </button>
                {aberto && (
                    <div className="input-container">
                        <form>
                            <label>Nome:</label>
                            <input type="text"/>
                            <label>cidade:</label>
                            <input type="text"/>
                            <label>Técnico:</label>
                            <input type="text"/>
                            <button className='sub-dropdown-button' onClick={(e) => {e.preventDefault(); setAbreJogadores(!abreJogadores)}}>
                                <img src={ArrowIcon} alt='seta' className={`button-arrow ${abreJogadores ? 'rotate' : ''}`}/>
                                <span className="sub-dropdown-text">Jogadores</span>
                            </button>
                            {abreJogadores && (
                                <div className="jogadores-content">
                                    <label>Nome:</label>
                                    <input type="text"/>
                                    <label>Sobrenome:</label>
                                    <input type="text"/>
                                    <label>Camisa:</label>
                                    <input type="text"/>
                                    <label>Posição:</label>
                                    <input type="text"/>
                                    <label>Data de nascimento:</label>
                                    <input type="date"/>
                                </div>
                            )}
                        </form>
                    </div>
                )}
            </div>
        </>
    )
}

export default DropDownTimes