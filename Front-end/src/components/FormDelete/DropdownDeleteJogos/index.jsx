import React, { useState } from 'react';
import ArrowIcon from '../../../assets/Arrow_icon.png'; 

function DropdownDeleteJogos({
    idPartida,  
    onIdPartidaChange,   
    filterByNomeTimeJogos, 
    onFilterByNomeTimeJogosChange,
    availablePartidas, 
    loadingPartidas,  
    errorLoadingPartidas 

}) {
    const [aberto, setAberto] = useState(false); // Estado local para controlar a abertura do dropdown
    // console.log("Estado 'aberto':", aberto); // Para depuração

    const formatPartidaDisplay = (partida) => {
        const dateObj = new Date(partida.dt_data_horario);
        const dateStr = dateObj.toLocaleDateString('pt-BR'); 
        const timeStr = dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        return (
            `ID: ${partida.id_jogo} - ${partida.c_time_casa} vs ${partida.c_time_visitante} ` +
            `(${dateStr} ${timeStr}) - Rodada ${partida.n_rodada || 'N/A'}`
        );
    };

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

                        {/* NOVO CAMPO: Nome do Time para filtro */}
                        <div className="form-group">
                            <label htmlFor='filterNomeTimePartida'>Nome do Time:</label>
                            <input
                                type="text"
                                id="filterNomeTimePartida"
                                value={filterByNomeTimeJogos}
                                onChange={onFilterByNomeTimeJogosChange}
                                placeholder="Digite o nome do time"
                            />
                        </div>


                        <div className="form-group">
                            <label htmlFor='deleteIdPartidaSelect'>Selecionar Partida:</label>
                            {loadingPartidas && <p>Carregando partidas...</p>}
                            {errorLoadingPartidas && <p className="error-message">{errorLoadingPartidas}</p>}
                            {!loadingPartidas && !errorLoadingPartidas && Array.isArray(availablePartidas) && (
                                <select
                                    id="deleteIdPartidaSelect"
                                    value={idPartida}
                                    onChange={onIdPartidaChange}
                                >
                                    <option key="select-empty-partida" value="">- Selecione uma Partida -</option>
                                    {availablePartidas.map(partida => (
                                        <option key={partida.id_jogo} value={partida.id_jogo}>
                                            {formatPartidaDisplay(partida)}
                                        </option>
                                    ))}
                                </select>
                            )}
                            {(!loadingPartidas && !errorLoadingPartidas && availablePartidas.length === 0 && filterByNomeTimeJogos) && (
                                <p className="info-message">Nenhuma partida encontrada para o time selecionado.</p>
                            )}
                             {(!loadingPartidas && !errorLoadingPartidas && availablePartidas.length === 0 && !filterByNomeTimeJogos) && (
                                <p className="info-message">Digite o nome do time para buscar partidas.</p>
                            )}
                        </div>
                        
                    </div>
                )}
            </div>
        </>
    );
}

export default DropdownDeleteJogos;
