import React, { useState } from 'react';
import ArrowIcon from '../../../assets/Arrow_icon.png';

function DropdownDeleteGols({
    idGol,
    onIdGolChange,
    filterByIdPartidaGols,      
    onFilterByIdPartidaGolsChange, 
    availableGols,             
    loadingGols,               
    errorLoadingGols
}){
    const [aberto, setAberto] = useState(false);

    const formatGolDisplay = (gol) => {
        return (
            `ID: ${gol.id_gol} - ${gol.n_minuto_gol}' - ` +
            `${gol.c_nome_jogador || 'Jogador Desconhecido'} (${gol.c_nome_time || 'Time Desconhecido'})`
        );
    };

    return(
        <>
            <div className="dropdown">
                <button type='button' className='dropdown-button' onClick={() => setAberto(!aberto)}>
                    <img src={ArrowIcon} alt='seta' className={`button-arrow ${aberto ? 'rotate' : ''}`}/>
                    <span className="dropdown-text">Deletar Gols</span>
                </button>
                {aberto && (
                    <div className="input-container">
                        {/* NOVO CAMPO: ID da Partida para filtro */}
                        <div className="form-group">
                            <label htmlFor='filterIdPartidaGols'>ID da Partida:</label>
                            <input
                                type="number"
                                id="filterIdPartidaGols"
                                value={filterByIdPartidaGols}
                                onChange={onFilterByIdPartidaGolsChange}
                                placeholder="Digite o ID da partida"
                                min="1"
                            />
                        </div>

                        {/* SELECIONAR GOL - Agora filtrado pelo ID da Partida */}
                        <div className="form-group">
                            <label htmlFor='deleteIdGolSelect'>Selecionar Gol:</label>
                            {loadingGols && <p>Carregando gols...</p>}
                            {errorLoadingGols && <p className="error-message">{errorLoadingGols}</p>}
                            {!loadingGols && !errorLoadingGols && Array.isArray(availableGols) && (
                                <select
                                    id="deleteIdGolSelect"
                                    value={idGol}
                                    onChange={onIdGolChange}
                                >
                                    <option key="select-empty-gol" value="">- Selecione um Gol -</option>
                                    {availableGols.map(gol => (
                                        <option key={gol.id_gol} value={gol.id_gol}>
                                            {formatGolDisplay(gol)}
                                        </option>
                                    ))}
                                </select>
                            )}
                            {(!loadingGols && !errorLoadingGols && availableGols.length === 0 && filterByIdPartidaGols) && (
                                <p className="info-message">Nenhum gol encontrado para a partida selecionada.</p>
                            )}
                            {(!loadingGols && !errorLoadingGols && availableGols.length === 0 && !filterByIdPartidaGols) && (
                                <p className="info-message">Digite o ID da partida para buscar gols.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

export default DropdownDeleteGols;