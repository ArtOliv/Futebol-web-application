// src/components/FormDelete/DropdownDeleteJogos/index.jsx
import React, { useState } from 'react';
import ArrowIcon from '../../../assets/Arrow_icon.png'; // Ajuste o caminho do ícone se necessário

// Este componente agora recebe as props do componente pai (FormDelete)
function DropdownDeleteJogos({
    idPartida,   // Recebido como prop para o valor do campo
    onIdPartidaChange   // Recebido como prop para atualizar o estado no pai
}) {
    const [aberto, setAberto] = useState(false); // Estado local para controlar a abertura do dropdown
    // console.log("Estado 'aberto':", aberto); // Para depuração

    return (
        <>
            <div className="dropdown">
                {/* ADICIONADO: type="button" */}
                <button type="button" className='dropdown-button' onClick={() => setAberto(!aberto)}>
                    <img src={ArrowIcon} alt='seta' className={`button-arrow ${aberto ? 'rotate' : ''}`}/>
                    <span className="dropdown-text">Deletar jogo</span>
                </button>
                {aberto && (
                    <div className="input-container">
                        {/* Removida a tag <form> interna. O formulário principal está no FormDelete. */}
                        <div className="form-group"> {/* Adicionado div para layout */}
                            <label htmlFor='deleteIdPartida'>Id da partida:</label>
                            <input
                                type="number" // CORRIGIDO: Use 'number' para IDs numéricos
                                id="deleteIdPartida"
                                value={idPartida} // Usa a prop recebida
                                onChange={onIdPartidaChange} // Usa a prop recebida
                                autoComplete="off" // Desativa o autocompletar do navegador
                                min="1" // Opcional: Se IDs não podem ser 0 ou negativos
                            />
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default DropdownDeleteJogos;
