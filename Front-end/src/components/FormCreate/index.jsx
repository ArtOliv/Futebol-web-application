// src/components/FormCreate/index.jsx COMPLETO E ATUALIZADO

import React, { useState, useEffect } from 'react';
import './styles.css';

// Importa as funções de serviço
import { postCampeonato, getCampeonatos } from '../../services/campeonatoService';
import { getTime as checkTeamExists, postTime } from '../../services/timeService';
import { insertJogador } from '../../services/jogadorService'; // Mantenha se ainda usa para adicionar jogador avulso
import { postPartida } from '../../services/jogoService';

// Importa os componentes DropDown
import DropDownCampeonato from './DropdownCampeonato';
import DropDownTimes from './DropdownTimes';
import DropDownJogos from './DropdownJogos';


// Função auxiliar para corrigir encoding (manter)
function corrigirEncoding(str){
    try {
        const bytes = new Uint8Array(str.split('').map(c => c.charCodeAt(0)));
        const decoder = new TextDecoder('utf-8');
        return decoder.decode(bytes);
    } catch {
        return str;
    }
}

function FormCreate(){
    // --- ESTADOS PARA CADASTRAR CAMPEONATO (para o DropDownCampeonato independente) ---
    const [nomeCampeonato, setNomeCampeonato] = useState('');
    const [anoCampeonato, setAnoCampeonato] = useState('');

    // --- ESTADOS PARA CADASTRAR TIME ---
    const [nomeTime, setNomeTime] = useState('');
    const [cidadeTime, setCidadeTime] = useState('');
    const [tecnicoTime, setTecnicoTime] = useState('');

    // --- ESTADOS PARA CAMPEONATO ASSOCIADO AO TIME/JOGADOR/PARTIDA (usado em DropDownTimes e DropDownJogos) ---
    const [nomeCampeonatoForTeam, setNomeCampeonatoForTeam] = useState('');
    const [anoCampeonatoForTeam, setAnoCampeonatoForTeam] = useState('');

    // --- ESTADOS PARA CADASTRAR JOGADOR (associado a um Time) ---
    const [pNomeJogador, setPnomeJogador] = useState('');
    const [uNomeJogador, setUnomeJogador] = useState('');
    const [camisa, setCamisa] = useState('');
    const [posicao, setPosicao] = useState(''); // Agora será um número (0-5)
    const [dataNascimento, setDataNascimento] = useState('');

    // Lista de campeonatos disponíveis para os dropdowns
    const [availableCampeonatos, setAvailableCampeonatos] = useState([]);
    const [loadingCampeonatos, setLoadingCampeonatos] = useState(true);
    const [errorLoadingCampeonatos, setErrorLoadingCampeonatos] = useState(null);

    // --- ESTADOS PARA CADASTRAR JOGOS/PARTIDAS ---
    const [nomeMandante, setNomeMandante] = useState('');
    const [nomeVisitante, setNomeVisitante] = useState('');
    const [rodada, setRodada] = useState('');
    const [dataJogo, setDataJogo] = useState('');
    const [horario, setHorario] = useState('');
    const [nomeEstadio, setNomeEstadio] = useState('');
    const [nomeCidadeEstadio, setNomeCidadeEstadio] = useState(''); // Este estado não é usado no seu backend atual para PartidaCreate, considere remover ou adicionar ao modelo.

    // --- ESTADOS PARA FEEDBACK GERAL DO FORMULÁRIO ---
    const [message, setMessage] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // Mapeamento de posição de string para valor numérico (manter)
    const positionNameToValue = {
        "GOLEIRO": 0, "ZAGUEIRO": 1, "LATERAL_ESQUERDO": 2,
        "LATERAL_DIREITO": 3, "MEIO_CAMPISTA": 4, "ATACANTE": 5,
    };

    // Efeito para carregar campeonatos ao iniciar (manter)
    useEffect(() => {
        const fetchCampeonatos = async () => {
            try {
                const camps = await getCampeonatos();
                const formattedCamps = Array.isArray(camps) ? camps.map(camp => ({
                    ...camp,
                    c_nome_campeonato: corrigirEncoding(camp.c_nome_campeonato)
                })) : [];
                setAvailableCampeonatos(formattedCamps);
            } catch (err) {
                console.error("Erro ao carregar campeonatos para o dropdown:", err);
                setErrorLoadingCampeonatos("Erro ao carregar lista de campeonatos.");
                setAvailableCampeonatos([]);
            } finally {
                setLoadingCampeonatos(false);
            }
        };
        fetchCampeonatos();
    }, []);

    // Função auxiliar para resetar campos de Time/Jogador
    const resetTimeAndPlayerFields = () => {
        setNomeTime('');
        setCidadeTime('');
        setTecnicoTime('');
        setPnomeJogador('');
        setUnomeJogador('');
        setCamisa('');
        setPosicao('');
        setDataNascimento('');
    };

    // Função auxiliar para resetar campos de Partida
    const resetMatchFields = () => {
        setNomeMandante('');
        setNomeVisitante('');
        setRodada('');
        setDataJogo('');
        setHorario('');
        setNomeEstadio('');
        setNomeCidadeEstadio(''); // Se estiver usando este estado
    };

    // --- Função principal que lida com a submissão de TODOS os formulários ---
    const handleOverallSubmit = async (event) => {
        event.preventDefault();

        setMessage('');
        setError(null);
        setLoading(true);

        try {
            let operationMessages = [];
            let overallSuccess = true;

            // --- Lógica para CADASTRAR CAMPEONATO (se os campos estiverem preenchidos) ---
            if (nomeCampeonato && anoCampeonato) {
                console.log("Tentando cadastrar campeonato:", nomeCampeonato, anoCampeonato);
                try {
                    const responseMessage = await postCampeonato(nomeCampeonato, parseInt(anoCampeonato));
                    operationMessages.push(`Campeonato: ${responseMessage}`);
                    setNomeCampeonato('');
                    setAnoCampeonato('');
                    // Recarregar campeonatos para o dropdown de Times/Jogos
                    const updatedCamps = await getCampeonatos();
                    setAvailableCampeonatos(Array.isArray(updatedCamps) ? updatedCamps.map(camp => ({
                        ...camp, c_nome_campeonato: corrigirEncoding(camp.c_nome_Campeonato)
                    })) : []);
                } catch (campErr) {
                    operationMessages.push(`Erro ao cadastrar Campeonato: ${campErr.message}`);
                    setError(prev => (prev ? prev + '\n' : '') + `Erro Campeonato: ${campErr.message}`);
                    overallSuccess = false;
                }
            } else {
                operationMessages.push("Campos de Campeonato (cadastro individual) não preenchidos, ignorando.");
            }

            // --- Lógica para CADASTRAR/ASSOCIAR TIME E/OU JOGADOR ---
            const hasTeamDataInput = !!nomeTime; // Apenas o nome do time é suficiente para indicar intenção
            const hasPlayerDataInput = pNomeJogador || camisa || posicao || dataNascimento; // Se qualquer campo de jogador tiver valor

            if (hasTeamDataInput || hasPlayerDataInput) {
                if (!nomeCampeonatoForTeam || !anoCampeonatoForTeam) {
                    operationMessages.push("Para cadastrar/associar Time e/ou Jogador, o Campeonato Associado é obrigatório.");
                    overallSuccess = false;
                } else if (overallSuccess) {
                    // Crie o objeto do time. Se o time já existe, cidade/técnico podem ser nulos e não serão atualizados.
                    const teamObject = {
                        c_nome_time: nomeTime,
                        c_cidade_time: cidadeTime || null, // Permite null se não preenchido
                        c_tecnico_time: tecnicoTime || null, // Permite null se não preenchido
                        jogadores: [], // Começa com array vazio de jogadores
                    };

                    // Se há dados de jogador, adicione-os ao objeto do time
                    if (hasPlayerDataInput) {
                        // Validação mínima para jogador antes de adicionar
                        if (!pNomeJogador || !camisa || !posicao || !dataNascimento) {
                            operationMessages.push("Campos de Jogador incompletos. Por favor, preencha todos os campos do jogador para adicioná-lo.");
                            overallSuccess = false;
                        } else {
                             teamObject.jogadores.push({
                                // id_jogador: null, // Deixe o backend gerenciar IDs para novos jogadores
                                c_Pnome_jogador: pNomeJogador,
                                c_Unome_jogador: uNomeJogador || null,
                                n_camisa: parseInt(camisa),
                                c_posicao: positionNameToValue[posicao],
                                d_data_nascimento: dataNascimento,
                            });
                        }
                    }

                    // Somente chame postTime se o nome do time for fornecido
                    if (teamObject.c_nome_time && overallSuccess) {
                         try {
                            const teamResponseMessage = await postTime(
                                teamObject,
                                nomeCampeonatoForTeam,
                                parseInt(anoCampeonatoForTeam)
                            );
                            operationMessages.push(`Time/Associação: ${teamResponseMessage}`);
                            resetTimeAndPlayerFields(); // Limpa os campos após sucesso
                        } catch (teamErr) {
                            operationMessages.push(`Erro ao cadastrar/associar Time/Jogador: ${teamErr.message}`);
                            console.error("Erro ao cadastrar/associar Time/Jogador:", teamErr);
                            setError(prev => (prev ? prev + '\n' : '') + `Erro Time/Jogador: ${teamErr.message}`);
                            overallSuccess = false;
                        }
                    } else if (hasTeamDataInput && !teamObject.c_nome_time) {
                         operationMessages.push("Nome do Time é obrigatório para cadastro/associação.");
                         overallSuccess = false;
                    }
                }
            } else {
                operationMessages.push("Nenhum campo de Time/Jogador preenchido, ignorando.");
            }

            // --- Lógica para CADASTRAR PARTIDA ---
            const hasMatchDataInput = nomeMandante || nomeVisitante || rodada || dataJogo || horario || nomeEstadio; // Removido nomeCidadeEstadio
            
            if (hasMatchDataInput) {
                if (!nomeCampeonatoForTeam || !anoCampeonatoForTeam) {
                    operationMessages.push("Para cadastrar uma Partida, o Campeonato Associado é obrigatório.");
                    overallSuccess = false;
                } else if (overallSuccess) {
                    // Validação mínima para partida
                    if (!nomeMandante || !nomeVisitante || !rodada || !dataJogo || !horario || !nomeEstadio) {
                        operationMessages.push("Campos de Partida incompletos. Por favor, preencha todos os campos da partida.");
                        overallSuccess = false;
                    } else {
                        const partidaObject = {
                            dt_data_str: dataJogo,
                            hr_horario_str: horario,
                            n_rodada: parseInt(rodada),
                            c_nome_estadio: nomeEstadio,
                            c_time_casa: nomeMandante,
                            c_time_visitante: nomeVisitante,
                        };
                        console.log("Objeto Partida a ser enviado:", partidaObject);

                        try {
                            const partidaResponseMessage = await postPartida(
                                partidaObject,
                                nomeCampeonatoForTeam,
                                parseInt(anoCampeonatoForTeam)
                            );
                            operationMessages.push(`Partida: ${partidaResponseMessage}`);
                            resetMatchFields(); // Limpa os campos após sucesso
                        } catch (partidaErr) {
                            operationMessages.push(`Erro ao cadastrar Partida: ${partidaErr.message}`);
                            console.error("Erro ao cadastrar Partida:", partidaErr);
                            setError(prev => (prev ? prev + '\n' : '') + `Erro Cadastro Partida: ${partidaErr.message}`);
                            overallSuccess = false;
                        }
                    }
                }
            } else {
                operationMessages.push("Nenhum campo de Partida preenchido, ignorando.");
            }

            // --- Finalização e Mensagens ---
            if (operationMessages.length > 0) {
                setMessage(operationMessages.join('\n'));
            } else {
                setMessage("Nenhuma operação de cadastro foi solicitada.");
            }

        } catch (err) {
            console.error("Erro inesperado na submissão geral:", err);
            setError(err.message || "Ocorreu um erro inesperado durante a submissão.");
            overallSuccess = false;
        } finally {
            setLoading(false);
        }
    };

    return(
        <>
            <form onSubmit={handleOverallSubmit}>
                {/* Componente para cadastrar Campeonato */}
                <DropDownCampeonato
                    nomeCampeonato={nomeCampeonato}
                    anoCampeonato={anoCampeonato}
                    onNomeChange={(e) => setNomeCampeonato(e.target.value)}
                    onAnoChange={(e) => setAnoCampeonato(e.target.value)}
                />

                {/* Componente para cadastrar Time e Jogador */}
                <DropDownTimes
                    // Props para o Time
                    nomeTime={nomeTime}
                    cidadeTime={cidadeTime}
                    tecnicoTime={tecnicoTime}
                    onNomeTimeChange={(e) => setNomeTime(e.target.value)}
                    onCidadeTimeChange={(e) => setCidadeTime(e.target.value)}
                    onTecnicoTimeChange={(e) => setTecnicoTime(e.target.value)}
                    // Props para o Campeonato associado ao Time/Jogador
                    nomeCampeonatoForTeam={nomeCampeonatoForTeam}
                    anoCampeonatoForTeam={anoCampeonatoForTeam}
                    onNomeCampeonatoForTeamChange={(e) => setNomeCampeonatoForTeam(e.target.value)}
                    onAnoCampeonatoForTeamChange={(e) => setAnoCampeonatoForTeam(e.target.value)}
                    // Passe as props de campeonatos disponíveis
                    availableCampeonatos={availableCampeonatos}
                    loadingCampeonatos={loadingCampeonatos}
                    errorLoadingCampeonatos={errorLoadingCampeonatos}
                    // Props para o Jogador
                    pNomeJogador={pNomeJogador}
                    uNomeJogador={uNomeJogador}
                    camisa={camisa}
                    posicao={posicao}
                    dataNascimento={dataNascimento}
                    onPnomeChange={(e) => setPnomeJogador(e.target.value)}
                    onUnomeChange={(e) => setUnomeJogador(e.target.value)}
                    onCamisaChange={(e) => setCamisa(e.target.value)}
                    onPosicaoChange={(e) => setPosicao(e.target.value)}
                    onDataNascimentoChange={(e) => setDataNascimento(e.target.value)}
                />

                {/* Outros dropdowns de cadastro */}
                <DropDownJogos
                    nomeMandante={nomeMandante}
                    onNomeMandanteChange={(e) => setNomeMandante(e.target.value)}
                    nomeVisitante={nomeVisitante}
                    onNomeVisitanteChange={(e) => setNomeVisitante(e.target.value)}
                    rodada={rodada}
                    onRodadaChange={(e) => setRodada(e.target.value)}
                    dataJogo={dataJogo}
                    onDataJogoChange={(e) => setDataJogo(e.target.value)}
                    horario={horario}
                    onHorarioChange={(e) => setHorario(e.target.value)}
                    nomeEstadio={nomeEstadio}
                    onNomeEstadioChange={(e) => setNomeEstadio(e.target.value)}
                    nomeCidadeEstadio={nomeCidadeEstadio} // Passando, mas não usado no backend para partida
                    onNomeCidadeEstadioChange={(e) => setNomeCidadeEstadio(e.target.value)} // Passando, mas não usado no backend para partida

                    // ADICIONADAS: Props do Campeonato Associado para DropDownJogos
                    nomeCampeonatoForTeam={nomeCampeonatoForTeam}
                    anoCampeonatoForTeam={anoCampeonatoForTeam}
                    onNomeCampeonatoForTeamChange={(e) => setNomeCampeonatoForTeam(e.target.value)}
                    onAnoCampeonatoForTeamChange={(e) => setAnoCampeonatoForTeam(e.target.value)}
                    availableCampeonatos={availableCampeonatos}
                    loadingCampeonatos={loadingCampeonatos}
                    errorLoadingCampeonatos={errorLoadingCampeonatos}
                />

                <div className="create-button">
                    <button type="submit" disabled={loading}>
                        {loading ? 'Criando...' : 'Criar'}
                    </button>
                </div>
            </form>

            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
        </>
    );
}

export default FormCreate;