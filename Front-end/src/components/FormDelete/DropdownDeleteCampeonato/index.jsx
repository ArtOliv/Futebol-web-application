// src/components/FormDelete/DropdownDeleteCampeonato/index.jsx
import React, { useState } from 'react';
import ArrowIcon from '../../../assets/Arrow_icon.png'; // Ajuste o caminho do ícone se necessário

// Este componente agora recebe as props do componente pai (FormDelete)
function DropDownDeleteCampeonato({
    nomeCampeonato, // Recebido como prop para o valor do campo
    anoCampeonato,  // Recebido como prop para o valor do campo
    onNomeChange,   // Recebido como prop para atualizar o estado no pai
    onAnoChange     // Recebido como prop para atualizar o estado no pai
}) {
    const [aberto, setAberto] = useState(false); // Estado local para controlar a abertura do dropdown

    return (
        <>
            <div className="dropdown">
                <button type = "button" className='dropdown-button' onClick={() => setAberto(!aberto)}>
                    <img src={ArrowIcon} alt='seta' className={`button-arrow ${aberto ? 'rotate' : ''}`}/>
                    <span className="dropdown-text">Deletar Campeonato</span>
                </button>
                {aberto && (
                    <div className="input-container">
                        {/* Removida a tag <form> interna. O formulário principal está no FormDelete. */}
                        
                        <div className="form-group"> {/* Adicionado div para layout */}
                            <label htmlFor='deleteNomeCampeonato'>Nome do Campeonato:</label>
                            <input
                                type="text"
                                id="deleteNomeCampeonato"
                                value={nomeCampeonato} // Usa a prop recebida
                                onChange={onNomeChange} // Usa a prop recebida
                                autoComplete="off"
                            />
                        </div>
                        
                        <div className="form-group"> {/* Adicionado div para layout */}
                            <label htmlFor="deleteAnoCampeonato">Ano do Campeonato:</label>
                            <input
                                type="number"
                                id="deleteAnoCampeonato"
                                value={anoCampeonato} // CORRIGIDO: Agora usa a prop 'anoCampeonato'
                                onChange={onAnoChange} // Usa a prop recebida
                                min="0" // Para não permitir anos negativos
                                autoComplete="off"
                            />
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default DropDownDeleteCampeonato;
