import React, { useState } from 'react';
import ArrowIcon from '../../../assets/Arrow_icon.png';

function DropdownDeleteJogador({
    idJogador,
    onIdChange,
    availableJogadores,
    loadingJogadores,
    errorLoadingJogadores,
    filterByNomeTime,
    onFilterByNomeTimeChange, 
}) {
    const [aberto, setAberto] = useState(false);

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
                            <label htmlFor='filterNomeTime'>Nome do Time:</label>
                            <input
                                type="text"
                                id="filterNomeTime"
                                value={filterByNomeTime}
                                onChange={onFilterByNomeTimeChange} 
                                placeholder="Digite o nome do time"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor='deleteIdJogador'>Selecionar Jogador:</label>
                            {loadingJogadores && <p>Carregando jogadores...</p>}
                            {errorLoadingJogadores && <p className="error-message">{errorLoadingJogadores}</p>}
                            {!loadingJogadores && !errorLoadingJogadores && Array.isArray(availableJogadores) && (
                                <select
                                    id="deleteIdJogador"
                                    value={idJogador}
                                    onChange={onIdChange}
                                >
                                    <option key="select-empty" value="">- Selecione um Jogador -</option>
                                    {availableJogadores.map(jogador => (
                                        <option key={jogador.id_jogador} value={jogador.id_jogador}>
                                            {jogador.c_Pnome_jogador} {jogador.c_Unome_jogador ? jogador.c_Unome_jogador : ''} ({jogador.nome_time})
                                        </option>
                                    ))}
                                </select>
                            )}
                            {(!loadingJogadores && !errorLoadingJogadores && availableJogadores.length === 0 && filterByNomeTime) && (
                                <p className="info-message">Nenhum jogador encontrado para o time selecionado.</p>
                            )}
                            {(!loadingJogadores && !errorLoadingJogadores && availableJogadores.length === 0 && !filterByNomeTime) && (
                                <p className="info-message">Digite o nome do time para buscar jogadores.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

export default DropdownDeleteJogador;