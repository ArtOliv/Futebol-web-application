// src/components/FormDelete/DropdownDeleteTimes/index.jsx
import React, { useState } from 'react';
import ArrowIcon from '../../../assets/Arrow_icon.png'; // Ajuste o caminho do ícone se necessário

// Este componente agora recebe as props do componente pai (FormDelete)
function DropdownDeleteTimes({
    nomeTime,     // Recebido como prop para o valor do campo
    onNomeChange  // Recebido como prop para atualizar o estado no pai
}) {
    const [aberto, setAberto] = useState(false); // Estado local para controlar a abertura do dropdown

    return (
        <>
            <div className="dropdown">
                <button type="button" className='dropdown-button' onClick={() => setAberto(!aberto)}>
                    <img src={ArrowIcon} alt='seta' className={`button-arrow ${aberto ? 'rotate' : ''}`}/>
                    <span className="dropdown-text">Deletar time</span>
                </button>
                {aberto && (
                    <div className="input-container">
                        {/* GARANTIR QUE CADA PAR label/input ESTÁ DENTRO DE UM div className="form-group" */}
                        <div className="form-group">
                            <label htmlFor='deleteNomeTime'>Nome:</label>
                            <input
                                type="text"
                                id="deleteNomeTime"
                                value={nomeTime}
                                onChange={onNomeChange}
                                autoComplete="off" // Desativa o autocompletar do navegador
                            />
                        </div>
                        {/* Se houvesse mais campos, cada um teria seu próprio .form-group */}
                    </div>
                )}
            </div>
        </>
    );
}

export default DropdownDeleteTimes;
