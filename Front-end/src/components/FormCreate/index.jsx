import React, { useState, useEffect } from 'react'; 
import './styles.css'; 

// Importa as funções de serviço
import { postCampeonato, getCampeonatos } from '../../services/campeonatoService';
import { getTime as checkTeamExists, postTime } from '../../services/timeService'; 
import { insertJogador } from '../../services/jogadorService'; 
import { postPartida } from '../../services/jogoService';

// Importa os componentes DropDown
import DropDownCampeonato from './DropdownCampeonato'; 
import DropDownTimes from './DropdownTimes'; 
import DropDownJogos from './DropdownJogos'; 


function FormCreate(){
    // --- ESTADOS PARA CADASTRAR CAMPEONATO (para o DropDownCampeonato independente) ---
    const [nomeCampeonato, setNomeCampeonato] = useState('');
    const [anoCampeonato, setAnoCampeonato] = useState('');

    // --- ESTADOS PARA CADASTRAR TIME ---
    const [nomeTime, setNomeTime] = useState('');
    const [cidadeTime, setCidadeTime] = useState('');
    const [tecnicoTime, setTecnicoTime] = useState('');

    // --- ESTADOS PARA CAMPEONATO ASSOCIADO AO TIME/JOGADOR (dentro do DropDownTimes) ---
    const [nomeCampeonatoForTeam, setNomeCampeonatoForTeam] = useState('');
    const [anoCampeonatoForTeam, setAnoCampeonatoForTeam] = useState('');

    // --- ESTADOS PARA CADASTRAR JOGADOR ---
    const [pNomeJogador, setPnomeJogador] = useState('');
    const [uNomeJogador, setUnomeJogador] = useState('');
    const [camisa, setCamisa] = useState('');
    const [posicao, setPosicao] = useState(''); // Agora será um número (0-5)
    const [dataNascimento, setDataNascimento] = useState('');


    // Lista de campeonatos disponíveis para o dropdown ---
    const [availableCampeonatos, setAvailableCampeonatos] = useState([]);
    const [loadingCampeonatos, setLoadingCampeonatos] = useState(true);
    const [errorLoadingCampeonatos, setErrorLoadingCampeonatos] = useState(null);

    // --- NOVOS ESTADOS PARA PARTIDAS DISPONÍVEIS (para dropdown) ---
    const [availablePartidas, setAvailablePartidas] = useState([]); 
    const [loadingPartidas, setLoadingPartidas] = useState(true);   
    const [errorLoadingPartidas, setErrorLoadingPartidas] = useState(null); 

    // --- NOVOS ESTADOS PARA CADASTRAR JOGOS/PARTIDAS ---
    const [nomeMandante, setNomeMandante] = useState('');
    const [nomeVisitante, setNomeVisitante] = useState('');
    const [rodada, setRodada] = useState('');
    const [dataJogo, setDataJogo] = useState('');
    const [horario, setHorario] = useState('');
    const [nomeEstadio, setNomeEstadio] = useState('');
    const [nomeCidadeEstadio, setNomeCidadeEstadio] = useState('');

    // --- ESTADOS PARA FEEDBACK GERAL DO FORMULÁRIO ---
    const [message, setMessage] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const positionNameToValue = {
        "GOLEIRO": 0,
        "ZAGUEIRO": 1,
        "LATERAL_ESQUERDO": 2,
        "LATERAL_DIREITO": 3,
        "MEIO_CAMPISTA": 4,
        "ATACANTE": 5,
    };

    useEffect(() => {
        const fetchCampeonatos = async () => {
            try {
                const camps = await getCampeonatos();
                console.log("Fetched campeonatos from service (camps):", camps);
                setAvailableCampeonatos(Array.isArray(camps) ? camps : []);
            } catch (err) {
                console.error("Erro ao carregar campeonatos para o dropdown:", err);
                setErrorLoadingCampeonatos("Erro ao carregar lista de campeonatos.");
                setAvailableCampeonatos([]); // E
            } finally {
                setLoadingCampeonatos(false);
            }
        };
        fetchCampeonatos();

    }, []);


    // Função que lida com a submissão geral do formulário de criação
    const handleOverallSubmit = async (event) => {
        event.preventDefault(); 

        setMessage('');
        setError(null);
        setLoading(true); 

        try {
            let operationMessages = []; 
            let overallSuccess = true; 

            // --- Lógica para CADASTRAR CAMPEONATO (independente) ---
            const isCampeonatoDataProvided = nomeCampeonato && anoCampeonato;
            if (isCampeonatoDataProvided) {
                console.log("Tentando cadastrar campeonato:", nomeCampeonato, anoCampeonato);
                try {
                    const responseMessage = await postCampeonato(
                        nomeCampeonato,
                        parseInt(anoCampeonato)
                    );
                    operationMessages.push(`Campeonato: ${responseMessage}`);
                    setNomeCampeonato('');
                    setAnoCampeonato('');
                    console.log("Cadastro de Campeonato SUCESSO:", responseMessage);
                } catch (campErr) {
                    operationMessages.push(`Erro ao cadastrar Campeonato: ${campErr.message}`);
                    console.error("Erro ao cadastrar Campeonato:", campErr);
                    setError(prev => (prev ? prev + '\n' : '') + `Erro Campeonato: ${campErr.message}`);
                    overallSuccess = false; 
                }
            } else {
                operationMessages.push("Campos de Campeonato (independente) não preenchidos para cadastro.");
            }

            // --- Lógica para CADASTRAR TIME E/OU JOGADOR ---
            const isTeamDataProvided = nomeTime;
            const isPlayerDataProvided = pNomeJogador && camisa && posicao && dataNascimento;
            const isTeamCampeonatoDataProvided = nomeCampeonatoForTeam && anoCampeonatoForTeam; // Dados de campeonato para o time/jogador

            if (isTeamDataProvided || isPlayerDataProvided) {
                //Campeonato associado ao Time/Jogador é obrigatório
                if (!isTeamCampeonatoDataProvided) {
                    operationMessages.push("Para cadastrar Time/Jogador, os campos de Campeonato (associado) são obrigatórios.");
                    overallSuccess = false; // Marca falha se campeonato associado não está preenchido
                } else { // Se os dados do campeonato associado estão OK, procede
                    let teamExists = false;
                    let teamCreated = false;
                    let championshipExistsForTeam = false;

                    try {
                        const existingCamps = await getCampeonatos(nomeCampeonatoForTeam, parseInt(anoCampeonatoForTeam));
                        if (existingCamps && existingCamps.length > 0) {
                            championshipExistsForTeam = true;
                            operationMessages.push(`Verificação de Campeonato para Time/Jogador: '${nomeCampeonatoForTeam} (${anoCampeonatoForTeam})' existe.`);
                        } else {
                            operationMessages.push(`Verificação de Campeonato para Time/Jogador: '${nomeCampeonatoForTeam} (${anoCampeonatoForTeam})' NÃO existe.`);
                            overallSuccess = false;
                        }
                    } catch (checkCampErr) {
                        operationMessages.push(`Erro ao verificar Campeonato para Time/Jogador: ${checkCampErr.message}`);
                        console.error("Erro ao verificar Campeonato para Time/Jogador:", checkCampErr);
                        setError(prev => (prev ? prev + '\n' : '') + `Erro Verif. Camp. Time: ${checkCampErr.message}`);
                        overallSuccess = false;
                    }

                    if (overallSuccess && championshipExistsForTeam) {
                        if (nomeTime) {
                            try {
                                const existingTeam = await checkTeamExists(nomeTime);
                                if (existingTeam && existingTeam.name) {
                                    teamExists = true;
                                    operationMessages.push(`Verificação de Time: Time '${nomeTime}' já existe.`);
                                } else {
                                    operationMessages.push(`Verificação de Time: Time '${nomeTime}' não encontrado.`);
                                }
                            } catch (checkErr) {
                                if (checkErr.message.includes("404")) {
                                     operationMessages.push(`Verificação de Time: Time '${nomeTime}' não encontrado (API retornou 404).`);
                                } else {
                                    operationMessages.push(`Erro ao verificar Time: ${checkErr.message}`);
                                    console.error("Erro ao verificar Time:", checkErr);
                                    setError(prev => (prev ? prev + '\n' : '') + `Erro Verif. Time: ${checkErr.message}`);
                                    overallSuccess = false;
                                }
                            }
                        }

                        if (overallSuccess && !teamExists && nomeTime && cidadeTime && tecnicoTime) {
                            console.log("Tentando criar novo time:", nomeTime);
                            const teamObject = {
                                c_nome_time: nomeTime,
                                c_cidade_time: cidadeTime,
                                c_tecnico_time: tecnicoTime,
                                jogadores: isPlayerDataProvided ? [{
                                    id_jogador: null, 
                                    c_Pnome_jogador: pNomeJogador,
                                    c_Unome_jogador: uNomeJogador || null,
                                    n_camisa: parseInt(camisa),
                                    c_posicao: positionNameToValue[posicao],
                                    d_data_nascimento: dataNascimento, 
                                }] : [] 
                            };
                            console.log("Objeto Time a ser enviado (teamObject):", teamObject);
                            console.log("JSON.stringify(teamObject):", JSON.stringify(teamObject));

                            try {
                                const teamResponseMessage = await postTime(teamObject, nomeCampeonatoForTeam, parseInt(anoCampeonatoForTeam));
                                operationMessages.push(`Time: ${teamResponseMessage}`);
                                teamCreated = true;
                                setNomeTime('');
                                setCidadeTime('');
                                setTecnicoTime('');
                                setPnomeJogador('');
                                setUnomeJogador('');
                                setCamisa('');
                                setPosicao('');
                                setDataNascimento('');

                                console.log("Criação de Time SUCESSO:", teamResponseMessage);
                            } catch (teamErr) {
                                operationMessages.push(`Erro ao criar Time: ${teamErr.message}`);
                                console.error("Erro ao criar Time:", teamErr);
                                setError(prev => (prev ? prev + '\n' : '') + `Erro Criação Time: ${teamErr.message}`);
                                overallSuccess = false;
                            }
                        } else if (overallSuccess && !teamExists && nomeTime && (!cidadeTime || !tecnicoTime)) {
                            operationMessages.push("Campos de Time (Cidade/Técnico) incompletos para criação.");
                        }

                        if (overallSuccess && isPlayerDataProvided && (teamExists && !teamCreated)) {
                            console.log("Tentando cadastrar jogador em time existente:", pNomeJogador, "Time:", nomeTime);
            try {
                const jogadorObject = {
                    c_Pnome_jogador: pNomeJogador,
                    c_Unome_jogador: uNomeJogador || null, // Garante que seja null se vazio
                    n_camisa: camisa ? parseInt(camisa) : null, // Se 'camisa' for string vazia, parseInt() resulta em NaN.
                    c_posicao: posicao !== '' ? positionNameToValue[posicao] : null, // Se 'posicao' for string vazia, envia null.
                    d_data_nascimento: dataNascimento || null, // Se 'dataNascimento' for string vazia, envia null.
                };
                console.log("Objeto Jogador a ser enviado (jogadorObject):", jogadorObject);
                console.log("Time associado para jogador:", nomeTime);

                const jogadorResponseMessage = await insertJogador(jogadorObject, nomeTime);
                operationMessages.push(`Jogador: ${jogadorResponseMessage}`);

                // Limpa os campos do formulário após o sucesso
                setPnomeJogador('');
                setUnomeJogador('');
                setCamisa('');
                setPosicao('');
                setDataNascimento('');

                console.log("Cadastro de Jogador SUCESSO:", jogadorResponseMessage);
            } catch (jogadorErr) {
                operationMessages.push(`Erro ao cadastrar Jogador: ${jogadorErr.message}`);
                console.error("Erro ao cadastrar Jogador:", jogadorErr);
                setError(prev => (prev ? prev + '\n' : '') + `Erro Cadastro Jogador: ${jogadorErr.message}`);
                overallSuccess = false;
                            }
                        } else if (isPlayerDataProvided && !nomeTime) {
                            operationMessages.push("Nome do Time é obrigatório para cadastrar Jogador.");
                        } else if (isPlayerDataProvided && teamCreated) {
                            operationMessages.push("Jogador já incluído na criação do novo Time.");
                        }
                    }
                }
            } 

                // --- Lógica para CADASTRAR PARTIDA ---
            const isMatchDataProvided = nomeMandante || nomeVisitante || rodada || dataJogo || horario || nomeEstadio || nomeCidadeEstadio;
            const isMatchCampeonatoProvided = nomeCampeonatoForTeam && anoCampeonatoForTeam; // Este é o campeonato selecionado que será usado

            if (isMatchDataProvided) {
                if (!isMatchCampeonatoProvided) {
                    operationMessages.push("Para cadastrar uma Partida, os campos de Campeonato (associado) são obrigatórios.");
                    overallSuccess = false;
                } else {
                    // Crie o objeto da partida com os dados do frontend
                    const partidaObject = {
                        dt_data_str: dataJogo,
                        hr_horario_str: horario,
                        n_rodada: rodada ? parseInt(rodada) : null,
                        c_nome_estadio: nomeEstadio || null,
                        c_time_casa: nomeMandante || null,
                        c_time_visitante: nomeVisitante || null,
                    };
                    console.log("Objeto Partida a ser enviado:", partidaObject);

                    try {
                        const partidaResponseMessage = await postPartida(
                            partidaObject,
                            nomeCampeonatoForTeam, // Nome do campeonato associado
                            parseInt(anoCampeonatoForTeam) // Ano do campeonato associado (garante que é número)
                        );
                        operationMessages.push(`Partida: ${partidaResponseMessage}`);

                        // Limpa os campos do formulário de partida após o sucesso
                        setNomeMandante('');
                        setNomeVisitante('');
                        setRodada('');
                        setDataJogo('');
                        setHorario('');
                        setNomeEstadio('');
                        setNomeCidadeEstadio('');

                        console.log("Cadastro de Partida SUCESSO:", partidaResponseMessage);
                    } catch (partidaErr) {
                        operationMessages.push(`Erro ao cadastrar Partida: ${partidaErr.message}`);
                        console.error("Erro ao cadastrar Partida:", partidaErr);
                        setError(prev => (prev ? prev + '\n' : '') + `Erro Cadastro Partida: ${partidaErr.message}`);
                        overallSuccess = false;
                    }
                }
            } 


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
                    anoCampeonatoForTeam={anoCampeonatoForTeam} // Certifique-se de que o nome está correto aqui
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
                    nomeCidadeEstadio={nomeCidadeEstadio}
                    onNomeCidadeEstadioChange={(e) => setNomeCidadeEstadio(e.target.value)}

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
