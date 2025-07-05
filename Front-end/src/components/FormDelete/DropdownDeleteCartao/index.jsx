import React, { useState } from 'react';
import ArrowIcon from '../../../assets/Arrow_icon.png';

function DropdownDeleteCartao({
    idCartao,
    onIdCartaoChange,
    filterByIdPartidaCartoes,     
    onFilterByIdPartidaCartoesChange, 
    availableCartoes,              
    loadingCartoes,                
    errorLoadingCartoes            
}){
    const [aberto, setAberto] = useState(false);

    const formatCartaoDisplay = (cartao) => {
        return (
            `ID: ${cartao.id_cartao} - ${cartao.n_minuto_cartao}' - ${cartao.e_tipo || 'N/A'} - ` +
            `${cartao.c_nome_jogador || 'Jogador Desconhecido'} (${cartao.c_nome_time || 'Time Desconhecido'})`
        );
    };

    return(
        <>
            <div className="dropdown">
                <button type='button' className='dropdown-button' onClick={() => setAberto(!aberto)}>
                    <img src={ArrowIcon} alt='seta' className={`button-arrow ${aberto ? 'rotate' : ''}`}/>
                    <span className="dropdown-text">Deletar Cartão</span>
                </button>
                {aberto && (
                    <div className="input-container">
                        {/* NOVO CAMPO: ID da Partida para filtro */}
                        <div className="form-group">
                            <label htmlFor='filterIdPartidaCartoes'>ID da Partida:</label>
                            <input
                                type="number"
                                id="filterIdPartidaCartoes"
                                value={filterByIdPartidaCartoes}
                                onChange={onFilterByIdPartidaCartoesChange}
                                placeholder="Digite o ID da partida"
                                min="1"
                            />
                        </div>

                        {/* SELECIONAR CARTÃO - Agora filtrado pelo ID da Partida */}
                        <div className="form-group">
                            <label htmlFor='deleteIdCartaoSelect'>Selecionar Cartão:</label>
                            {loadingCartoes && <p>Carregando cartões...</p>}
                            {errorLoadingCartoes && <p className="error-message">{errorLoadingCartoes}</p>}
                            {!loadingCartoes && !errorLoadingCartoes && Array.isArray(availableCartoes) && (
                                <select
                                    id="deleteIdCartaoSelect"
                                    value={idCartao}
                                    onChange={onIdCartaoChange}
                                >
                                    <option key="select-empty-cartao" value="">- Selecione um Cartão -</option>
                                    {availableCartoes.map(cartao => (
                                        <option key={cartao.id_cartao} value={cartao.id_cartao}>
                                            {formatCartaoDisplay(cartao)}
                                        </option>
                                    ))}
                                </select>
                            )}
                            {(!loadingCartoes && !errorLoadingCartoes && availableCartoes.length === 0 && filterByIdPartidaCartoes) && (
                                <p className="info-message">Nenhum cartão encontrado para a partida selecionada.</p>
                            )}
                            {(!loadingCartoes && !errorLoadingCartoes && availableCartoes.length === 0 && !filterByIdPartidaCartoes) && (
                                <p className="info-message">Digite o ID da partida para buscar cartões.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

export default DropdownDeleteCartao;