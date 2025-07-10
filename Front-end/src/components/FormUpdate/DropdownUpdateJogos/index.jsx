import React, { useState, useEffect } from 'react';
import ArrowIcon from '../../../assets/Arrow_icon.png';
// Importe as funções de serviço necessárias
import { getPartidaPorId } from '../../../services/jogoService'; // Para buscar a partida existente
import { getJogadoresForDropdown } from '../../../services/jogadorService'; // Para buscar jogadores por time

function DropDownUpdateJogos({
    idPartidaUpdate,            // ID da partida a ser atualizada, vindo do FormUpdate
    onIdPartidaUpdateChange,    // Handler para mudança do ID da partida
    onUpdateSubmit,             // Handler para submeter a atualização (no FormUpdate)
}) {
    const [aberto, setAberto] = useState(false);
    const [abreAcaoAdicional, setAbreAcaoAdicional] = useState(false); // Para gol/cartão
    const [matchData, setMatchData] = useState(null); // Dados da partida carregada
    const [loadingMatch, setLoadingMatch] = useState(false);
    const [errorLoadingMatch, setErrorLoadingMatch] = useState(null);

    // --- Estados para atualização da Partida ---
    // Você pode adicionar estados para placares, status, etc., se quiser editar a partida em si.
    // Por enquanto, focaremos em adicionar gol/cartão.

    // --- Estados para Seleção de Jogadores (para gol/cartão) ---
    const [filterByNomeTimeAcao, setFilterByNomeTimeAcao] = useState(''); // Nome do time para filtrar jogadores para ação
    const [availableJogadoresAcao, setAvailableJogadoresAcao] = useState([]); // Jogadores do time filtrado
    const [loadingJogadoresAcao, setLoadingJogadoresAcao] = useState(false);
    const [errorLoadingJogadoresAcao, setErrorLoadingJogadoresAcao] = useState(null);
    const [idJogadorAcao, setIdJogadorAcao] = useState(''); // Jogador selecionado para gol/cartão

    // --- Estados para Ação de Gol/Cartão ---
    const [adicionarGol, setAdicionarGol] = useState(false); // Checkbox para adicionar gol
    const [minutoAcao, setMinutoAcao] = useState(''); // Minuto do gol/cartão
    const [tipoCartao, setTipoCartao] = useState(''); // Tipo de cartão (Amarelo/Vermelho)
    const [adicionarCartao, setAdicionarCartao] = useState(false); // Checkbox para adicionar cartão

    const tipoCartaoOptions = [
        { value: '', label: "- Selecione o Tipo -" },
        { value: "AMARELO", label: "Amarelo" },
        { value: "VERMELHO", label: "Vermelho" }
    ];

    // Efeito para carregar dados da partida quando o ID muda
    useEffect(() => {
        const fetchMatch = async () => {
            if (!idPartidaUpdate || isNaN(parseInt(idPartidaUpdate))) {
                setMatchData(null);
                setLoadingMatch(false);
                setErrorLoadingMatch(null);
                return;
            }

            setLoadingMatch(true);
            setErrorLoadingMatch(null);
            setMatchData(null); // Limpa dados da partida anterior

            try {
                const data = await getPartidaPorId(parseInt(idPartidaUpdate));
                setMatchData(data);
            } catch (err) {
                console.error("Erro ao carregar dados da partida:", err);
                setErrorLoadingMatch(err.message || "Erro ao carregar dados da partida.");
            } finally {
                setLoadingMatch(false);
            }
        };

        const debounceFetch = setTimeout(() => {
            fetchMatch();
        }, 500);

        return () => clearTimeout(debounceFetch);
    }, [idPartidaUpdate]);


    // Efeito para carregar jogadores com base no time de filtro
    useEffect(() => {
        const fetchJogadores = async () => {
            if (!filterByNomeTimeAcao) {
                setAvailableJogadoresAcao([]);
                setLoadingJogadoresAcao(false);
                setErrorLoadingJogadoresAcao(null);
                return;
            }

            setLoadingJogadoresAcao(true);
            setErrorLoadingJogadoresAcao(null);

            try {
                const jogadores = await getJogadoresForDropdown(null, filterByNomeTimeAcao);
                setAvailableJogadoresAcao(Array.isArray(jogadores) ? jogadores : []);
            } catch (err) {
                console.error("Erro ao carregar jogadores para ação:", err);
                setErrorLoadingJogadoresAcao("Erro ao carregar lista de jogadores.");
                setAvailableJogadoresAcao([]);
            } finally {
                setLoadingJogadoresAcao(false);
            }
        };
        const debounceFetch = setTimeout(() => {
            fetchJogadores();
        }, 500);

        return () => clearTimeout(debounceFetch);
    }, [filterByNomeTimeAcao]);

    // Função para resetar os campos de ação (gol/cartão)
    const resetAcaoFields = () => {
        setMinutoAcao('');
        setIdJogadorAcao('');
        setTipoCartao('');
        setAdicionarGol(false);
        setAdicionarCartao(false);
    };

    // Handler para submissão dos dados (gol/cartão)
    const handleSubmitAcao = (e) => {
        e.preventDefault(); // Evita o recarregamento da página
        console.log("handleSubmitAcao executado!"); // ADICIONE ESTE LOG

        // Validações básicas antes de chamar o handler pai
        if (!idPartidaUpdate || isNaN(parseInt(idPartidaUpdate))) {
            setErrorLoadingMatch("ID da Partida é obrigatório.");
            return;
        }
        if (!idJogadorAcao) {
            setErrorLoadingJogadoresAcao("Selecione um jogador para a ação.");
            return;
        }
        if (!minutoAcao || isNaN(parseInt(minutoAcao))) {
            setErrorLoadingMatch("Minuto do gol/cartão é obrigatório e deve ser um número.");
            return;
        }
        if (parseInt(minutoAcao) <= 0) {
            setErrorLoadingMatch("Minuto deve ser maior que 0.");
            return;
        }

        const dataToSend = {
            id_partida: parseInt(idPartidaUpdate),
            id_jogador: parseInt(idJogadorAcao),
            minuto: parseInt(minutoAcao),
            adicionarGol: adicionarGol,
            adicionarCartao: adicionarCartao,
            tipoCartao: tipoCartao,
        };
        console.log("Dados a serem enviados:", dataToSend);
        onUpdateSubmit(dataToSend, 'add_action');

        resetAcaoFields(); // Limpa os campos após a submissão
    };



    // Handler para finalizar o jogo
    const handleFinalizarJogo = (e) => {
        e.preventDefault(); // Evita o recarregamento da página
        setErrorLoadingMatch(null);

        if (!idPartidaUpdate || isNaN(parseInt(idPartidaUpdate))) {
            setErrorLoadingMatch("ID da Partida é obrigatório para finalizar o jogo.");
            return;
        }

        // Prepara o payload para atualizar o status e placares (usando os atuais da matchData)
        const finalizePayload = {
            id_partida: parseInt(idPartidaUpdate),
            c_status: "Finalizado", // Status a ser enviado
            n_placar_casa: matchData?.n_placar_casa, // Reusa o placar atual carregado
            n_placar_visitante: matchData?.n_placar_visitante // Reusa o placar atual carregado
        };
        // Chama a função de submissão no componente pai, indicando que é para finalizar o jogo
        onUpdateSubmit(finalizePayload, 'finalize_game');
    };

    return (
        <>
            <div className="dropdown">
                <button type="button" className='dropdown-button' onClick={() => setAberto(!aberto)}>
                    <img src={ArrowIcon} alt='seta' className={`button-arrow ${aberto ? 'rotate' : ''}`}/>
                    <span className="dropdown-text">Atualizar Jogos</span>
                </button>
                {aberto && (
                    <div className="input-container">
                        <div className="form-group">
                            <label htmlFor='updateIdPartida'>ID da Partida:</label>
                            <input
                                type="number"
                                id="updateIdPartida"
                                value={idPartidaUpdate}
                                onChange={onIdPartidaUpdateChange} // Atualiza o ID no FormUpdate
                                placeholder="Digite o ID da partida"
                                min="1"
                            />
                            {/* --- NOVO BOTÃO: Finalizar Jogo --- */}
                            {idPartidaUpdate && matchData && !loadingMatch && !errorLoadingMatch && matchData.c_status !== "Finalizado" && (
                                <button type="button" onClick={handleFinalizarJogo} className="finalize-game-button">Finalizar Jogo</button>
                            )}
                        </div>

                        {loadingMatch && <p>Carregando partida...</p>}
                        {errorLoadingMatch && <p className="error-message">{errorLoadingMatch}</p>}
                        {matchData && !errorLoadingMatch && (
                            <p className="info-message">Partida: {matchData.c_time_casa} vs {matchData.c_time_visitante} ({new Date(matchData.dt_data_horario).toLocaleDateString()}) - Status: {matchData.c_status}</p>
                        )}
                        {!loadingMatch && !matchData && idPartidaUpdate && (
                            <p className="info-message">Partida não encontrada para o ID informado.</p>
                        )}
                        {!idPartidaUpdate && (
                            <p className="info-message">Digite o ID da partida para carregar seus detalhes.</p>
                        )}

                        {/* Seção Adicionar Gol/Cartão - Agora um formulário separado */}
                        {matchData && (
                            <form onSubmit={handleSubmitAcao}> {/* Este formulário é apenas para adicionar ações */}
                                <button type="button" className='sub-dropdown-button' onClick={() => setAbreAcaoAdicional(!abreAcaoAdicional)}>
                                    <img src={ArrowIcon} alt='seta' className={`button-arrow ${abreAcaoAdicional ? 'rotate' : ''}`}/>
                                    <span className="sub-dropdown-text">Adicionar Gol/Cartão</span>
                                </button>

                                {abreAcaoAdicional && (
                                    <div className="sub-dropdown-content">
                                        {/* Campos de filtro e seleção de jogador */}
                                        <div className="form-group">
                                            <label htmlFor='filterNomeTimeAcao'>Nome do Time (Jogador/Cartão):</label>
                                            <input
                                                type="text"
                                                id="filterNomeTimeAcao"
                                                value={filterByNomeTimeAcao}
                                                onChange={(e) => {
                                                    setFilterByNomeTimeAcao(e.target.value);
                                                    setIdJogadorAcao(''); // Limpa seleção de jogador
                                                }}
                                                placeholder="Time do jogador/cartão"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor='selectJogadorAcao'>Selecionar Jogador:</label>
                                            {loadingJogadoresAcao && <p>Carregando jogadores...</p>}
                                            {errorLoadingJogadoresAcao && <p className="error-message">{errorLoadingJogadoresAcao}</p>}
                                            {!loadingJogadoresAcao && !errorLoadingJogadoresAcao && Array.isArray(availableJogadoresAcao) && (
                                                <select
                                                    id="selectJogadorAcao"
                                                    value={idJogadorAcao}
                                                    onChange={(e) => setIdJogadorAcao(e.target.value)}
                                                >
                                                    <option key="select-empty-jogador-acao" value="">- Selecione um Jogador -</option>
                                                    {availableJogadoresAcao.map(jogador => (
                                                        <option key={jogador.id_jogador} value={jogador.id_jogador}>
                                                            {jogador.c_Pnome_jogador} {jogador.c_Unome_jogador ? jogador.c_Unome_jogador : ''} ({jogador.nome_time})
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                            {!loadingJogadoresAcao && !errorLoadingJogadoresAcao && availableJogadoresAcao.length === 0 && filterByNomeTimeAcao && (
                                                <p className="info-message">Nenhum jogador encontrado para este time.</p>
                                            )}
                                            {!loadingJogadoresAcao && !errorLoadingJogadoresAcao && availableJogadoresAcao.length === 0 && !filterByNomeTimeAcao && (
                                                <p className="info-message">Digite o nome do time para buscar jogadores.</p>
                                            )}
                                        </div>

                                        {/* Campos de ação só aparecem se um jogador for selecionado */}
                                        {idJogadorAcao && (
                                            <>
                                                <div className="form-group">
                                                    <label htmlFor='minutoAcao'>Minuto:</label>
                                                    <input
                                                        type="number"
                                                        id="minutoAcao"
                                                        value={minutoAcao}
                                                        onChange={(e) => setMinutoAcao(e.target.value)}
                                                        min="1"
                                                        placeholder="Minuto da ação"
                                                    />
                                                </div>
                                                

                                                <div className="form-group checkbox-group">
                                                    <label htmlFor='adicionarGol'>Adicionar Gol?</label>
                                                    <input
                                                        type="checkbox"
                                                        id="adicionarGol"
                                                        checked={adicionarGol}
                                                        onChange={(e) => setAdicionarGol(e.target.checked)}
                                                    />
                                                </div>

                                                <div className="form-group checkbox-group">
                                                    <label htmlFor='adicionarCartao'>Adicionar Cartão?</label>
                                                    <input
                                                        type="checkbox"
                                                        id="adicionarCartao"
                                                        checked={adicionarCartao}
                                                        onChange={(e) => setAdicionarCartao(e.target.checked)}
                                                    />
                                                </div>

                                                {adicionarCartao && (
                                                    <div className="form-group">
                                                        <label htmlFor='tipoCartao'>Tipo de Cartão:</label>
                                                        <select
                                                            id="tipoCartao"
                                                            value={tipoCartao}
                                                            onChange={(e) => setTipoCartao(e.target.value)}
                                                        >
                                                            {tipoCartaoOptions.map((option) => (
                                                                <option key={option.value} value={option.value}>
                                                                    {option.label}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                        <button type="submit" disabled={!idJogadorAcao || !minutoAcao}>Adicionar Ação</button>
                                    </div>
                                )}
                            </form>
                        )}
                    </div>
                )}
            </div>
        </>
    );
}

export default DropDownUpdateJogos;