import React, { useState, useEffect } from 'react';
import './styles.css';

// Importa as funções de serviço para deletar diferentes entidades
import { deleteCampeonato } from '../../services/campeonatoService';
import { deleteTime } from '../../services/timeService';
import { deleteJogador, getJogadoresForDropdown } from '../../services/jogadorService';
import { deletePartida, getPartidasPorTime } from '../../services/jogoService';
import { deleteGol, getGolsPorPartida } from '../../services/golService';
import { deleteCartao, getCartoesPorPartida } from '../../services/cartaoService'; 

import DropDownDeleteCampeonato from './DropdownDeleteCampeonato';
import DropdownDeleteTimes from './DropdownDeleteTimes';
import DropdownDeleteJogador from './DropdownDeleteJogador';
import DropdownDeleteJogos from './DropdownDeleteJogos';
import DropdownDeleteGols from './DropdownDeleteGols';
import DropdownDeleteCartao from './DropdownDeleteCartao';


function FormDelete() {
    // --- ESTADOS PARA DELETAR CAMPEONATO ---
    const [nomeCampeonatoToDelete, setNomeCampeonatoToDelete] = useState('');
    const [anoCampeonatoToDelete, setAnoCampeonatoToDelete] = useState('');

    // --- ESTADO PARA DELETAR TIME ---
    const [nomeTimeToDelete, setNomeTimeToDelete] = useState('');

    // --- ESTADO PARA DELETAR JOGADOR ---
    const [idJogadorToDelete, setIdJogadorToDelete] = useState('');

    // ESTADO PARA DELETAR PARTIDA
    const [idPartidaToDelete, setIdPartidaToDelete] = useState('');

    // ESTADO DELETAR GOLS
    const [idGolToDelete, setIdGolToDelete] = useState('');

    // ESTADO DELETAR CARTAO
    const [idCartaoToDelete, setIdCartaoToDelete] = useState('');

    // --- ESTADOS PARA FEEDBACK GERAL DO FORMULÁRIO ---
    const [message, setMessage] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // ESTADOS PARA DROPDOWN DE JOGADORES (para filtro e lista)
    const [availableJogadores, setAvailableJogadores] = useState([]);
    const [loadingJogadores, setLoadingJogadores] = useState(true);
    const [errorLoadingJogadores, setErrorLoadingJogadores] = useState(null);
    const [filterByNomeTime, setFilterByNomeTime] = useState(''); 

    // --- ESTADOS PARA DROPDOWN DE PARTIDAS (para filtro e lista) ---
    const [availablePartidas, setAvailablePartidas] = useState([]);
    const [loadingPartidas, setLoadingPartidas] = useState(true);
    const [errorLoadingPartidas, setErrorLoadingPartidas] = useState(null);
    const [filterByNomeTimeJogos, setFilterByNomeTimeJogos] = useState(''); 

    // --- ESTADOS PARA DROPDOWN DE GOLS (para filtro e lista) ---
    const [availableGols, setAvailableGols] = useState([]);
    const [loadingGols, setLoadingGols] = useState(true);
    const [errorLoadingGols, setErrorLoadingGols] = useState(null);
    const [filterByIdPartidaGols, setFilterByIdPartidaGols] = useState(''); 

    // --- NEW: ESTADOS PARA DROPDOWN DE CARTOES (para filtro e lista) ---
    const [availableCartoes, setAvailableCartoes] = useState([]);
    const [loadingCartoes, setLoadingCartoes] = useState(true);
    const [errorLoadingCartoes, setErrorLoadingCartoes] = useState(null);
    const [filterByIdPartidaCartoes, setFilterByIdPartidaCartoes] = useState(''); 


    const handleFilterByNomeTimeChange = (e) => {
        setFilterByNomeTime(e.target.value);
        setIdJogadorToDelete('');
    };

    const handleFilterByNomeTimeJogosChange = (e) => { 
        setFilterByNomeTimeJogos(e.target.value);
        setIdPartidaToDelete(''); 
    };

    const handleFilterByIdPartidaGolsChange = (e) => { 
        setFilterByIdPartidaGols(e.target.value);
        setIdGolToDelete('');
    };

    const handleFilterByIdPartidaCartoesChange = (e) => { 
        setFilterByIdPartidaCartoes(e.target.value);
        setIdCartaoToDelete(''); 
    };


    useEffect(() => {
        const fetchJogadores = async () => {
            if (!filterByNomeTime) {
                setAvailableJogadores([]);
                setLoadingJogadores(false);
                setErrorLoadingJogadores(null);
                return;
            }
            setLoadingJogadores(true);
            setErrorLoadingJogadores(null);
            try {
                const jogadores = await getJogadoresForDropdown(null, filterByNomeTime);
                setAvailableJogadores(Array.isArray(jogadores) ? jogadores : []);
            } catch (err) {
                console.error("Erro ao carregar jogadores para o dropdown:", err);
                setErrorLoadingJogadores("Erro ao carregar lista de jogadores.");
                setAvailableJogadores([]);
            } finally {
                setLoadingJogadores(false);
            }
        };
        fetchJogadores();
    }, [filterByNomeTime]);

    useEffect(() => {
        const fetchPartidas = async () => {
            if (!filterByNomeTimeJogos) {
                setAvailablePartidas([]);
                setLoadingPartidas(false);
                setErrorLoadingPartidas(null);
                return;
            }
            setLoadingPartidas(true);
            setErrorLoadingPartidas(null);
            try {
                const partidas = await getPartidasPorTime(filterByNomeTimeJogos);
                setAvailablePartidas(Array.isArray(partidas) ? partidas : []);
            } catch (err) {
                console.error("Erro ao carregar partidas para o dropdown:", err);
                setErrorLoadingPartidas("Erro ao carregar lista de partidas.");
                setAvailablePartidas([]);
            } finally {
                setLoadingPartidas(false);
            }
        };
        fetchPartidas();
    }, [filterByNomeTimeJogos]);

    // --- useEffect para carregar gols para o dropdown ---
    useEffect(() => {
        const fetchGols = async () => {
            if (!filterByIdPartidaGols || isNaN(parseInt(filterByIdPartidaGols))) {
                setAvailableGols([]);
                setLoadingGols(false);
                setErrorLoadingGols(null);
                return;
            }
            setLoadingGols(true);
            setErrorLoadingGols(null);
            try {
                const gols = await getGolsPorPartida(parseInt(filterByIdPartidaGols));
                setAvailableGols(Array.isArray(gols) ? gols : []);
            } catch (err) {
                console.error("Erro ao carregar gols para o dropdown:", err);
                setErrorLoadingGols("Erro ao carregar lista de gols.");
                setAvailableGols([]);
            } finally {
                setLoadingGols(false);
            }
        };
        fetchGols();
    }, [filterByIdPartidaGols]);

    useEffect(() => {
        const fetchCartoes = async () => {
            if (!filterByIdPartidaCartoes || isNaN(parseInt(filterByIdPartidaCartoes))) {
                setAvailableCartoes([]);
                setLoadingCartoes(false);
                setErrorLoadingCartoes(null);
                return;
            }
            setLoadingCartoes(true);
            setErrorLoadingCartoes(null);
            try {
                const cartoes = await getCartoesPorPartida(parseInt(filterByIdPartidaCartoes));
                setAvailableCartoes(Array.isArray(cartoes) ? cartoes : []);
            } catch (err) {
                console.error("Erro ao carregar cartões para o dropdown:", err);
                setErrorLoadingCartoes("Erro ao carregar lista de cartões.");
                setAvailableCartoes([]);
            } finally {
                setLoadingCartoes(false);
            }
        };
        fetchCartoes();
    }, [filterByIdPartidaCartoes]);


    const handleOverallDelete = async (event) => {
        event.preventDefault();

        console.log("--- handleOverallDelete INICIADO ---");
        console.log("ID Cartao no momento da submissão:", idCartaoToDelete);

        setMessage('');
        setError(null);
        setLoading(true);

        try {
            let operationMessages = [];



            // --- Lógica para DELETAR Cartao ---
            if (idCartaoToDelete && !isNaN(parseInt(idCartaoToDelete))) {
                console.log("Tentando deletar Cartao com ID:", idCartaoToDelete);
                try {
                    const responseMessage = await deleteCartao(parseInt(idCartaoToDelete));
                    operationMessages.push(`Cartao: ${responseMessage}`);
                    setIdCartaoToDelete(''); 
                    if (filterByIdPartidaCartoes) {
                        await getCartoesPorPartida(parseInt(filterByIdPartidaCartoes)).then(setAvailableCartoes);
                    } else {
                        setAvailableCartoes([]);
                    }
                } catch (CartaoErr) {
                    operationMessages.push(`Erro ao deletar Cartao: ${CartaoErr.message}`);
                    console.error("Erro ao deletar Cartao:", CartaoErr);
                    setError(prev => (prev ? prev + '\n' : '') + `Erro Cartao: ${CartaoErr.message}`);
                }
            } else if (idCartaoToDelete) {
                operationMessages.push("ID do Cartao inválido. Por favor, selecione um cartão válido."); 
                setError(prev => (prev ? prev + '\n' : '') + `Erro Cartao: ID inválido.`);
            }


            // Exibe todas as mensagens acumuladas no estado 'message', unindo-as com quebras de linha
            if (operationMessages.length > 0) {
                setMessage(operationMessages.join('\n'));
            } else {
                setMessage("Nenhuma operação de deleção foi solicitada.");
            }

        } catch (err) {
            console.error("Erro inesperado na submissão geral:", err);
            setError(err.message || "Ocorreu um erro inesperado durante a deleção.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <form onSubmit={handleOverallDelete}>
                {/* Componente para deletar Campeonato */}
                <DropDownDeleteCampeonato
                    nomeCampeonato={nomeCampeonatoToDelete}
                    anoCampeonato={anoCampeonatoToDelete}
                    onNomeChange={(e) => setNomeCampeonatoToDelete(e.target.value)}
                    onAnoChange={(e) => setAnoCampeonatoToDelete(e.target.value)}
                />

                {/* Componente para deletar Time */}
                <DropdownDeleteTimes
                    nomeTime={nomeTimeToDelete}
                    onNomeChange={(e) => setNomeTimeToDelete(e.target.value)}
                />

                {/* Componente para deletar Jogador (com filtro interno) */}
                <DropdownDeleteJogador
                    idJogador={idJogadorToDelete}
                    onIdChange={(e) => setIdJogadorToDelete(e.target.value)}
                    availableJogadores={availableJogadores}
                    loadingJogadores={loadingJogadores}
                    errorLoadingJogadores={errorLoadingJogadores}
                    filterByNomeTime={filterByNomeTime}
                    onFilterByNomeTimeChange={handleFilterByNomeTimeChange}
                />

                {/* Componente deletar partida */}
                <DropdownDeleteJogos
                    idPartida={idPartidaToDelete}
                    onIdPartidaChange={(e) => setIdPartidaToDelete(e.target.value)}
                    filterByNomeTimeJogos={filterByNomeTimeJogos}
                    onFilterByNomeTimeJogosChange={handleFilterByNomeTimeJogosChange}
                    availablePartidas={availablePartidas}
                    loadingPartidas={loadingPartidas}
                    errorLoadingPartidas={errorLoadingPartidas}
                />

                {/* Componente deletar gols */}
                <DropdownDeleteGols
                    idGol={idGolToDelete}
                    onIdGolChange={(e) => setIdGolToDelete(e.target.value)}
                    filterByIdPartidaGols={filterByIdPartidaGols}
                    onFilterByIdPartidaGolsChange={handleFilterByIdPartidaGolsChange}
                    availableGols={availableGols}
                    loadingGols={loadingGols}
                    errorLoadingGols={errorLoadingGols}
                />

                {/* Componente deletar cartões (UPDATED) */}
                <DropdownDeleteCartao
                    idCartao={idCartaoToDelete}
                    onIdCartaoChange={(e) => setIdCartaoToDelete(e.target.value)}
                    filterByIdPartidaCartoes={filterByIdPartidaCartoes} // Pass new filter state
                    onFilterByIdPartidaCartoesChange={handleFilterByIdPartidaCartoesChange} // Pass new filter handler
                    availableCartoes={availableCartoes} // Pass list of cards
                    loadingCartoes={loadingCartoes}     // Pass loading state
                    errorLoadingCartoes={errorLoadingCartoes} // Pass error state
                />

                <div className="delete-button">
                    <button type="submit" disabled={loading}>
                        {loading ? 'Deletando...' : 'Deletar'}
                    </button>
                </div>
            </form>

            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
        </>
    );
}

export default FormDelete;