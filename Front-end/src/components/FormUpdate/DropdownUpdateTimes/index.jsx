import { useState } from 'react'
import ArrowIcon from '../../../assets/Arrow_icon.png'

function DropDownUpdateTimes(){
    const [aberto, setAberto] = useState(false)
    const [abreJogadores, setAbreJogadores] = useState(false)
    const [posicao, setPosicao] = useState('');

    const options = [
        {value: '', label: "-"},
        {value: "0", label: "Goleiro"},
        {value: "1", label: "Zaqueiro"},
        {value: "2", label: "Lateral Esquerdo"},
        {value: "3", label: "Lateral Direito"},
        {value: "4", label: "Meio Campo"},
        {value: "5", label: "Atacante"}
    ]

    return(
        <>
            <div className="dropdown">
                <button className='dropdown-button' onClick={() => setAberto(!aberto)}>
                    <img src={ArrowIcon} alt='seta' className={`button-arrow ${aberto ? 'rotate' : ''}`}/>
                    <span className="dropdown-text">Atualizar times</span>
                </button>
                {aberto && (
                    <div className="input-container">
                        <form>
                            <label>Técnico:</label>
                            <input type="text"/>
                            <button className='sub-dropdown-button' onClick={(e) => {e.preventDefault(); setAbreJogadores(!abreJogadores)}}>
                                <img src={ArrowIcon} alt='seta' className={`button-arrow ${abreJogadores ? 'rotate' : ''}`}/>
                                <span className="sub-dropdown-text">Jogadores</span>
                            </button>
                            {abreJogadores && (
                                <div className="sub-dropdown-content">
                                    <label>Nome:</label>
                                    <input type="text"/>
                                    <label>Sobrenome:</label>
                                    <input type="text"/>
                                    <label>Camisa:</label>
                                    <input type="text"/>
                                    <label>Posição:</label>
                                    <select value={posicao} onChange={(e) => setPosicao(e.target.value)}>
                                        {options.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
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

export default DropDownUpdateTimes