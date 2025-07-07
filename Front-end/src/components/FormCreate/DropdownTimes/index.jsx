import React, { useState } from 'react';
import ArrowIcon from '../../../assets/Arrow_icon.png'; 

function DropDownTimes({
    nomeTime,
    cidadeTime,
    tecnicoTime,
    onNomeTimeChange,
    onCidadeTimeChange,
    onTecnicoTimeChange,

    nomeCampeonatoForTeam, 
    anoCampeonatoForTeam, 
    onNomeCampeonatoForTeamChange, 
    onAnoCampeonatoForTeamChange,  
    availableCampeonatos,         
    loadingCampeonatos,           
    errorLoadingCampeonatos,     

    pNomeJogador,
    uNomeJogador,
    camisa,
    posicao,
    dataNascimento,

    onPnomeChange,
    onUnomeChange,
    onCamisaChange,
    onPosicaoChange, 
    onDataNascimentoChange,

}) {
    const [aberto, setAberto] = useState(false);
    const [abreJogadores, setAbreJogadores] = useState(false);

    // ALTERADO: Valores das opções para as STRINGS DOS NOMES EXATOS DO ENUM
    const options = [
        { value: '', label: "- Selecione a Posição -" }, 
        { value: "GOLEIRO", label: "Goleiro" }, 
        { value: "ZAGUEIRO", label: "Zagueiro" },
        { value: "LATERAL_ESQUERDO", label: "Lateral Esquerdo" },
        { value: "LATERAL_DIREITO", label: "Lateral Direito" },
        { value: "MEIO_CAMPISTA", label: "Meio Campo" }, 
        { value: "ATACANTE", label: "Atacante" }
    ];


    const handleCampeonatoSelectChange = (e) => {
        const selectedValue = e.target.value;
        if (selectedValue === "") {
            onNomeCampeonatoForTeamChange({ target: { value: '' } });
            onAnoCampeonatoForTeamChange({ target: { value: '' } }); 
        } else {
            const [nome, ano] = selectedValue.split('|');
            onNomeCampeonatoForTeamChange({ target: { value: nome } });
            onAnoCampeonatoForTeamChange({ target: { value: ano } }); 
        }
    };


    return (
        <>
            <div className="dropdown">
                <button type="button" className='dropdown-button' onClick={() => setAberto(!aberto)}>
                    <img src={ArrowIcon} alt='seta' className={`button-arrow ${aberto ? 'rotate' : ''}`}/>
                    <span className="dropdown-text">Adicionar Time e Jogadores</span>
                </button>
                {aberto && (
                    <div className="input-container">
                        {/* Campos para o Time */}
                        <div className="form-group">
                            <label htmlFor='nomeTime'>Nome do Time:</label>
                            <input
                                type="text"
                                id="nomeTime"
                                value={nomeTime}
                                onChange={onNomeTimeChange}
                                autoComplete="off"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor='cidade'>Cidade:</label>
                            <input
                                type="text"
                                id="cidade"
                                value={cidadeTime}
                                onChange={onCidadeTimeChange}
                                autoComplete="off"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor='tecnico'>Técnico:</label>
                            <input
                                type="text"
                                id="tecnico"
                                value={tecnicoTime}
                                onChange={onTecnicoTimeChange}
                                autoComplete="off"
                            />
                        </div>

                        {/* Campo de seleção para o Campeonato associado ao Time/Jogador */}
                        <div className="form-group">
                            <label htmlFor='campeonatoAssociado'>Campeonato Associado:</label>
                            {loadingCampeonatos && <p>Carregando campeonatos...</p>}
                            {errorLoadingCampeonatos && <p className="error-message">{errorLoadingCampeonatos}</p>}
                            {/* Adiciona verificação para garantir que availableCampeonatos é um array */}
                            {!loadingCampeonatos && !errorLoadingCampeonatos && Array.isArray(availableCampeonatos) && (
                                <select
                                    id="campeonatoAssociado"
                                    value={nomeCampeonatoForTeam && anoCampeonatoForTeam ? `${nomeCampeonatoForTeam}|${anoCampeonatoForTeam}` : ''}
                                    onChange={handleCampeonatoSelectChange}
                                    required
                                >
                                    <option value="">- Selecione um Campeonato -</option>
                                    {availableCampeonatos.map((camp, index) => (
                                        <option
                                            key={index}
                                            value={`${camp.c_nome_campeonato}|${camp.d_ano_campeonato}`}
                                        >
                                            {camp.c_nome_campeonato} 
                    
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>

                        {/* Botão para abrir/fechar a seção de Jogadores */}
                        <button type="button" className='sub-dropdown-button' onClick={() => setAbreJogadores(!abreJogadores)}>
                            <img src={ArrowIcon} alt='seta' className={`button-arrow ${abreJogadores ? 'rotate' : ''}`}/>
                            <span className="sub-dropdown-text">Jogadores</span>
                        </button>

                        {abreJogadores && (
                            <div className="sub-dropdown-content">
                                {/* Campos para Jogadores */}
                                <div className="form-group">
                                    <label htmlFor='pNomeJogador'>Primeiro Nome:</label>
                                    <input
                                        type="text"
                                        id="pNomeJogador"
                                        value={pNomeJogador}
                                        onChange={onPnomeChange}
                                        autoComplete="off"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor='uNomeJogador'>Sobrenome:</label>
                                    <input
                                        type="text"
                                        id="uNomeJogador"
                                        value={uNomeJogador}
                                        onChange={onUnomeChange}
                                        autoComplete="off"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor='camisa'>Camisa:</label>
                                    <input
                                        type="number"
                                        id="camisa"
                                        value={camisa}
                                        onChange={onCamisaChange}
                                        autoComplete="off"
                                        min="1"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor='posicao'>Posição:</label>
                                    <select
                                        id="posicao"
                                        value={posicao}
                                        onChange={onPosicaoChange}
                                    >
                                        {options.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor='dataNascimento'>Data de Nascimento:</label>
                                    <input
                                        type="date"
                                        id="dataNascimento"
                                        value={dataNascimento}
                                        onChange={onDataNascimentoChange}
                                        autoComplete="off"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

export default DropDownTimes;
