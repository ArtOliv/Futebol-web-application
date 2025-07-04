import { useState } from 'react'
import ArrowIcon from '../../../assets/Arrow_icon.png'

function DropDownJogos({
    nomeMandante,
    onNomeMandanteChange,
    nomeVisitante,
    onNomeVisitanteChange,
    rodada, // Novo nome
    onRodadaChange, // Novo nome
    dataJogo, // Novo nome
    onDataJogoChange, // Novo nome
    horario,
    onHorarioChange,
    nomeEstadio,
    onNomeEstadioChange,
    nomeCidadeEstadio, // Novo nome
    onNomeCidadeEstadioChange, // Novo nome
}) {
    const [aberto, setAberto] = useState(false)
    const [abreEstadio, setAbreEstadio] = useState(false)

    return(
        <>
            <div className="dropdown">
                <button type='button' className='dropdown-button' onClick={() => setAberto(!aberto)}>
                    <img src={ArrowIcon} alt='seta' className={`button-arrow ${aberto ? 'rotate' : ''}`}/>
                    <span className="dropdown-text">Adicionar jogos</span>
                </button>
                {aberto && (
                    <div className="input-container">

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
                                value={rodada} // Corrigido: 'Rodada' para 'rodada'
                                onChange={onRodadaChange}
                                autoComplete="off"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor='data'>Data:</label>
                            <input
                                type="date"
                                id="data"
                                value={dataJogo} // Corrigido: 'data' para 'dataJogo'
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
                            <div className="input-container"> {/* Este div é o container da seção Estádio */}
                                {/* Campo Nome do Estádio */}
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
                                {/* Campo Cidade do Estádio */}
                                <div className="form-group">
                                    <label htmlFor='nomeCidade'>Cidade:</label> {/* ID 'nomeCidade' está OK */}
                                    <input
                                        type="text"
                                        id="nomeCidade"
                                        value={nomeCidadeEstadio } // Corrigido para a nova prop
                                        onChange={onNomeCidadeEstadioChange} // Corrigido para a nova prop
                                        autoComplete="off"
                                    />
                                </div>
                                {/* REMOVIDOS inputs duplicados/incompletos AQUI */}
                            </div>
                        )}

                    </div>
                )}
            </div>
        </>
    )
}

export default DropDownJogos