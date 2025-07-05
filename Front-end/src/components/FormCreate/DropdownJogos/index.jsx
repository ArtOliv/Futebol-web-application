import { useState } from 'react'
import ArrowIcon from '../../../assets/Arrow_icon.png'

function DropDownJogos({
    nomeMandante,
    onNomeMandanteChange,
    nomeVisitante,
    onNomeVisitanteChange,
    rodada,
    onRodadaChange,
    dataJogo,
    onDataJogoChange,
    horario,
    onHorarioChange,
    nomeEstadio,
    onNomeEstadioChange,
    nomeCidadeEstadio,
    onNomeCidadeEstadioChange,

    nomeCampeonatoForTeam,
    anoCampeonatoForTeam, 
    onNomeCampeonatoForTeamChange,
    onAnoCampeonatoForTeamChange,
    availableCampeonatos,
    loadingCampeonatos,
    errorLoadingCampeonatos,

}) {
    const [aberto, setAberto] = useState(false)
    const [abreEstadio, setAbreEstadio] = useState(false)

     // Handler para o select de campeonatos (copiado de DropDownTimes)
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


    return(
        <>
            <div className="dropdown">
                <button type='button' className='dropdown-button' onClick={() => setAberto(!aberto)}>
                    <img src={ArrowIcon} alt='seta' className={`button-arrow ${aberto ? 'rotate' : ''}`}/>
                    <span className="dropdown-text">Adicionar jogos</span>
                </button>
                {aberto && (
                    <div className="input-container">

                        {/* NOVO: Campo de seleção para o Campeonato Associado (DUPLICADO DE DropDownTimes) */}
                        <div className="form-group">
                            <label htmlFor='campeonatoAssociadoJogos'>Campeonato Associado:</label>
                            {loadingCampeonatos && <p>Carregando campeonatos...</p>}
                            {errorLoadingCampeonatos && <p className="error-message">{errorLoadingCampeonatos}</p>}
                            {!loadingCampeonatos && !errorLoadingCampeonatos && Array.isArray(availableCampeonatos) && (
                                <select
                                    id="campeonatoAssociadoJogos" // ID único para este select
                                    value={nomeCampeonatoForTeam && anoCampeonatoForTeam ? `${nomeCampeonatoForTeam}|${anoCampeonatoForTeam}` : ''} // Lembre-se do typo!
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


                        {/* Campos para CRIAR nova partida */}
                        <div className="form-group">
                            <label htmlFor='nomeMandante'>Mandante:</label>
                            <input
                                type="text"
                                id="nomeMandante"
                                value={nomeMandante}
                                onChange={onNomeMandanteChange}
                                autoComplete="off"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor='nomeVisitante'>Visitante:</label>
                            <input
                                type="text"
                                id="nomeVisitante"
                                value={nomeVisitante}
                                onChange={onNomeVisitanteChange}
                                autoComplete="off"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor='Rodada'>Rodada:</label>
                            <input
                                type="text"
                                id="Rodada"
                                value={rodada}
                                onChange={onRodadaChange}
                                autoComplete="off"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor='data'>Data:</label>
                            <input
                                type="date"
                                id="data"
                                value={dataJogo}
                                onChange={onDataJogoChange}
                                autoComplete="off"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor='horario'>Horário:</label>
                            <input
                                type="time"
                                id="horario"
                                value={horario }
                                onChange={onHorarioChange}
                                autoComplete="off"
                            />
                        </div>

                        {/* Botão para abrir/fechar a seção do Estádio */}
                        <button type='button' className='sub-dropdown-button' onClick={(e) => {e.preventDefault(); setAbreEstadio(!abreEstadio)}}>
                            <img src={ArrowIcon} alt='seta' className={`button-arrow ${abreEstadio ? 'rotate' : ''}`}/>
                            <span className="sub-dropdown-text">Estádio</span>
                        </button>

                        {abreEstadio && (
                            <div className="input-container">
                                <div className="form-group">
                                    <label htmlFor='nomeEstadio'>Estádio:</label>
                                    <input
                                        type="text"
                                        id="nomeEstadio"
                                        value={nomeEstadio }
                                        onChange={onNomeEstadioChange}
                                        autoComplete="off"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor='nomeCidade'>Cidade:</label>
                                    <input
                                        type="text"
                                        id="nomeCidade"
                                        value={nomeCidadeEstadio }
                                        onChange={onNomeCidadeEstadioChange}
                                        autoComplete="off"
                                    />
                                </div>
                            </div>
                        )}

                    </div>
                )}
            </div>
        </>
    )
}

export default DropDownJogos