import { useState } from 'react'
import ArrowIcon from '../../../assets/Arrow_icon.png'

function DropdownDeleteCartao({
    idCartao,
    onIdCartaoChange,

}){
    const [aberto, setAberto] = useState(false)

    return(
        <>
            <div className="dropdown">
                <button type='button' className='dropdown-button' onClick={() => setAberto(!aberto)}>
                    <img src={ArrowIcon} alt='seta' className={`button-arrow ${aberto ? 'rotate' : ''}`}/>
                    <span className="dropdown-text">Deletar cartão</span>
                </button>
                {aberto && (
                    <div className="input-container">
                        <div className="form-group"> 
                            <label htmlFor='deleteidCartao'>idCartao:</label>
                            <input
                                type="number" // CORRIGIDO: Use 'number' para IDs numéricos
                                id="deleteidCartao"
                                value={idCartao} // Usa a prop recebida
                                onChange={onIdCartaoChange} // Usa a prop recebida
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

export default DropdownDeleteCartao