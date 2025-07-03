import { useState } from 'react'
import ArrowIcon from '../../../assets/Arrow_icon.png'

function DropdownDeleteGols({
    idGol,
    onIdGolChange,
}){
    const [aberto, setAberto] = useState(false)

    return(
        <>
            <div className="dropdown">
                <button type='button' className='dropdown-button' onClick={() => setAberto(!aberto)}>
                    <img src={ArrowIcon} alt='seta' className={`button-arrow ${aberto ? 'rotate' : ''}`}/>
                    <span className="dropdown-text">Deletar gols</span>
                </button>
                {aberto && (
                    <div className="input-container">
                        <div className="form-group"> 
                            <label htmlFor='deleteIdGol'>IdGol:</label>
                            <input
                                type="number" // CORRIGIDO: Use 'number' para IDs numéricos
                                id="deleteIdGol"
                                value={idGol} // Usa a prop recebida
                                onChange={onIdGolChange} // Usa a prop recebida
                                autoComplete="off" // Desativa o autocompletar do navegador
                                min="1" // Opcional: Se IDs não podem ser 0 ou negativos
                            />
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

export default DropdownDeleteGols