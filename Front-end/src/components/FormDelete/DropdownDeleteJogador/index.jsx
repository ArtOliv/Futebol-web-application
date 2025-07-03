import { useState } from 'react'
import ArrowIcon from '../../../assets/Arrow_icon.png'

function DropdownDeleteJogador({
    idJogador,
    onIdChange,

}){
    const [aberto, setAberto] = useState(false)

    return(
        <>
            <div className="dropdown">
                <button type="button" className='dropdown-button' onClick={() => setAberto(!aberto)}>
                    <img src={ArrowIcon} alt='seta' className={`button-arrow ${aberto ? 'rotate' : ''}`}/>
                    <span className="dropdown-text">Deletar Jogador</span>
                </button>
                {aberto && (
                    <div className="input-container">
                            <div className="form-group">
                                <label htmlFor='deleteIdJogador'>ID:</label>
                                <input
                                    type="number"
                                    id="deleteIdJogador"
                                    value={idJogador}
                                    onChange={onIdChange}
                                    autoComplete="off" // Desativa o autocompletar do navegador
                                    min="1"
                                />
                            </div>
                    </div>
                )}

            </div>
        </>
    )
}

export default DropdownDeleteJogador