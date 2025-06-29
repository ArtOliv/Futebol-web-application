import { useState } from 'react'
import ArrowIcon from '../../../assets/Arrow_icon.png'

function DropDownUpdateJogos(){
    const [aberto, setAberto] = useState(false)
    const [abreJogadores, setAbreJogadores] = useState(false)
    const [posicao, setPosicao] = useState('');
    const [tipoCartao, setTipoCartao] = useState('');

    const options = [
        {value: '', label: "-"},
        {value: "0", label: "Goleiro"},
        {value: "1", label: "Zaqueiro"},
        {value: "2", label: "Lateral Esquerdo"},
        {value: "3", label: "Lateral Direito"},
        {value: "4", label: "Meio Campo"},
        {value: "5", label: "Atacante"}
    ]

    const tipo = [
        {value: '', label: "-"},
        {value: "0", label: "Amarelo"},
        {value: "1", label: "Vermelho"}
    ]

    return(
        <>
            <div className="dropdown">
                <button className='dropdown-button' onClick={() => setAberto(!aberto)}>
                    <img src={ArrowIcon} alt='seta' className={`button-arrow ${aberto ? 'rotate' : ''}`}/>
                    <span className="dropdown-text">Atualizar jogos</span>
                </button>
                {aberto && (
                    <div className="input-container">
                        <form>
                            <label>Id da partida:</label>
                            <input type="text"/>
                            <label>Id do jogador:</label>
                            <input type="text"/>
                            <label>Minuto:</label>
                            <input type="text"/>
                            <label>Cartão:</label>
                            <select value={tipoCartao} onChange={(e) => setTipoCartao(e.target.value)}>
                                {tipo.map((tipoCartao) => (
                                    <option key={tipoCartao.value} value={tipoCartao.value}>
                                        {tipoCartao.label}
                                    </option>
                                ))}
                            </select>
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
                                        {options.map((posicao) => (
                                            <option key={posicao.value} value={posicao.value}>
                                                {posicao.label}
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

export default DropDownUpdateJogos