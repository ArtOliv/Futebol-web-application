import React, { useState, useEffect } from 'react';
import './styles.css';

// Importa as funções de serviço para deletar diferentes entidades
import { deleteCampeonato } from '../../services/campeonatoService'; // Importado deleteCampeonato
import { deleteJogador, getJogadoresForDropdown } from '../../services/jogadorService';
import { deletePartida, getPartidasPorTime } from '../../services/jogoService';
import { deleteGol, getGolsPorPartida } from '../../services/golService';
import { deleteCartao, getCartoesPorPartida } from '../../services/cartaoService'; 

import DropDownDeleteCampeonato from './DropdownDeleteCampeonato';
import DropdownDeleteJogador from './DropdownDeleteJogador';
import DropdownDeleteJogos from './DropdownDeleteJogos';
import DropdownDeleteGols from './DropdownDeleteGols';
import DropdownDeleteCartao from './DropdownDeleteCartao';


function FormDelete() {
    // --- ESTADOS PARA DELETAR CAMPEONATO ---
    const [nomeCampeonatoToDelete, setNomeCampeonatoToDelete] = useState('');
    const [anoCampeonatoToDelete, setAnoCampeonatoToDelete] = useState(''); // Estado para o ano do campeonato

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
    const [errorLoadingGols, setErrorLoadingGols] = useState(null); // Corrigido nome da variável de estado de erro
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
                // Mapeia IDs para string para consistência com o value do select
                setAvailableJogadores(Array.isArray(jogadores) ? jogadores.map(j => ({ ...j, id_jogador: String(j.id_jogador) })) : []);
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
                // Mapeia id_jogo para string E garante que n_rodada está no objeto
                setAvailablePartidas(Array.isArray(partidas) ? partidas.map(p => ({ 
                    ...p, 
                    id_jogo: String(p.id_jogo),
                    n_rodada: p.n_rodada // Garante que n_rodada é mapeado para o objeto partida
                })) : []);
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

    useEffect(() => {
        const fetchGols = async () => {
            if (!filterByIdPartidaGols || isNaN(parseInt(filterByIdPartidaGols))) {
                setAvailableGols([]);
                setLoadingGols(false);
                setErrorLoadingGols(null); // Usa o estado de erro correto
                return;
            }
            setLoadingGols(true);
            setErrorLoadingGols(null); // Usa o estado de erro correto
            try {
                const gols = await getGolsPorPartida(parseInt(filterByIdPartidaGols));
                // Mapeia id_gol para string para consistência com o value do select
                setAvailableGols(Array.isArray(gols) ? gols.map(g => ({ ...g, id_gol: String(g.id_gol) })) : []);
            } catch (err) {
                console.error("Erro ao carregar gols para o dropdown:", err);
                setErrorLoadingGols("Erro ao carregar lista de gols."); // Usa o estado de erro correto
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
        console.log("Nome Campeonato no momento da submissão:", nomeCampeonatoToDelete); // Adicionado log para Campeonato
        console.log("Ano Campeonato no momento da submissão:", anoCampeonatoToDelete);   // Adicionado log para Campeonato
        console.log("ID Jogador no momento da submissão:", idJogadorToDelete);
        console.log("ID Partida no momento da submissão:", idPartidaToDelete);
        console.log("ID Gol no momento da submissão:", idGolToDelete);
        console.log("ID Cartao no momento da submissão:", idCartaoToDelete);

        setMessage('');
        setError(null);
        setLoading(true);

        try {
            let operationMessages = [];

            // Lógica para DELETAR Campeonato
            // Verifica se ambos nome e ano foram preenchidos e o ano é um número válido
            if (nomeCampeonatoToDelete && !isNaN(parseInt(anoCampeonatoToDelete))) {
                console.log("Tentando deletar Campeonato:", nomeCampeonatoToDelete, anoCampeonatoToDelete);
                try {
                    // Chama a função deleteCampeonato (certifique-se que ela existe e aceita (nome, ano))
                    const responseMessage = await deleteCampeonato(nomeCampeonatoToDelete, parseInt(anoCampeonatoToDelete)); // Corrigido: anoCampeonatoToDelete para anoCampeonatoToDelete
                    operationMessages.push(`Campeonato: ${responseMessage}`);
                    setNomeCampeonatoToDelete(''); // Limpa o estado
                    setAnoCampeonatoToDelete('');   // Limpa o estado
                } catch (campeonatoErr) {
                    operationMessages.push(`Erro ao deletar Campeonato: ${campeonatoErr.message}`);
                    console.error("Erro ao deletar Campeonato:", campeonatoErr);
                    setError(prev => (prev ? prev + '\n' : '') + `Erro Campeonato: ${campeonatoErr.message}`);
                }
            } else if (nomeCampeonatoToDelete || anoCampeonatoToDelete) {
                // Se um dos campos foi preenchido, mas não ambos ou ano inválido
                operationMessages.push("Nome e Ano do Campeonato são obrigatórios para deletar Campeonato.");
                setError(prev => (prev ? prev + '\n' : '') + `Erro Campeonato: Nome e Ano são obrigatórios ou Ano inválido.`);
            }


            // Lógica para DELETAR Jogador
            if (idJogadorToDelete && !isNaN(parseInt(idJogadorToDelete))) {
                console.log("Tentando deletar Jogador com ID:", idJogadorToDelete);
                try {
                    const responseMessage = await deleteJogador(parseInt(idJogadorToDelete));
                    operationMessages.push(`Jogador: ${responseMessage}`);
                    setIdJogadorToDelete(''); 
                    
                    if (filterByNomeTime) {
                        const updatedJogadores = await getJogadoresForDropdown(null, filterByNomeTime);
                        setAvailableJogadores(Array.isArray(updatedJogadores) ? updatedJogadores.map(j => ({ ...j, id_jogador: String(j.id_jogador) })) : []);
                    } else {
                        setAvailableJogadores([]);
                    }

                } catch (jogadorErr) {
                    operationMessages.push(`Erro ao deletar Jogador: ${jogadorErr.message}`);
                    console.error("Erro ao deletar Jogador:", jogadorErr);
                    setError(prev => (prev ? prev + '\n' : '') + `Erro Jogador: ${jogadorErr.message}`);
                }
            } else if (idJogadorToDelete) {
                operationMessages.push("ID do Jogador inválido. Por favor, selecione um jogador válido.");
                setError(prev => (prev ? prev + '\n' : '') + `Erro Jogador: ID inválido.`);
            }

            // Lógica para DELETAR Partida
            if (idPartidaToDelete && !isNaN(parseInt(idPartidaToDelete))) {
                console.log("Tentando deletar Partida com ID:", idPartidaToDelete);
                try {
                    const responseMessage = await deletePartida(parseInt(idPartidaToDelete));
                    operationMessages.push(`Partida: ${responseMessage}`);
                    setIdPartidaToDelete(''); 
                    
                    if (filterByNomeTimeJogos) {
                        const updatedPartidas = await getPartidasPorTime(filterByNomeTimeJogos);
                        setAvailablePartidas(Array.isArray(updatedPartidas) ? updatedPartidas.map(p => ({ ...p, id_jogo: String(p.id_jogo), n_rodada: p.n_rodada })) : []);
                    } else {
                        setAvailablePartidas([]);
                    }

                } catch (partidaErr) {
                    operationMessages.push(`Erro ao deletar Partida: ${partidaErr.message}`);
                    console.error("Erro ao deletar Partida:", partidaErr);
                    setError(prev => (prev ? prev + '\n' : '') + `Erro Partida: ${partidaErr.message}`);
                }
            } else if (idPartidaToDelete) {
                operationMessages.push("ID da Partida inválido. Por favor, selecione uma partida válida.");
                setError(prev => (prev ? prev + '\n' : '') + `Erro Partida: ID inválido.`);
            }

            // Lógica para DELETAR Gol
            if (idGolToDelete && !isNaN(parseInt(idGolToDelete))) {
                console.log("Tentando deletar Gol com ID:", idGolToDelete);
                try {
                    const responseMessage = await deleteGol(parseInt(idGolToDelete));
                    operationMessages.push(`Gol: ${responseMessage}`);
                    setIdGolToDelete(''); 

                    if (filterByIdPartidaGols) {
                        const updatedGols = await getGolsPorPartida(parseInt(filterByIdPartidaGols));
                        setAvailableGols(Array.isArray(updatedGols) ? updatedGols.map(g => ({ ...g, id_gol: String(g.id_gol) })) : []);
                    } else {
                        setAvailableGols([]); 
                    }

                } catch (golErr) {
                    operationMessages.push(`Erro ao deletar Gol: ${golErr.message}`);
                    console.error("Erro ao deletar Gol:", golErr);
                    setError(prev => (prev ? prev + '\n' : '') + `Erro Gol: ${golErr.message}`);
                }
            } else if (idGolToDelete) {
                operationMessages.push("ID do Gol inválido. Por favor, selecione um gol válido.");
                setError(prev => (prev ? prev + '\n' : '') + `Erro Gol: ID inválido.`);
            }

            // Lógica para DELETAR Cartao
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
                <DropDownDeleteCampeonato
                    nomeCampeonato={nomeCampeonatoToDelete}
                    anoCampeonato={anoCampeonatoToDelete} // Corrigido: Passa o nome da prop correta (anoCampeonato)
                    onNomeChange={(e) => setNomeCampeonatoToDelete(e.target.value)}
                    onAnoChange={(e) => setAnoCampeonatoToDelete(e.target.value)}
                />


                <DropdownDeleteJogador
                    idJogador={idJogadorToDelete}
                    onIdChange={(e) => setIdJogadorToDelete(e.target.value)}
                    availableJogadores={availableJogadores}
                    loadingJogadores={loadingJogadores}
                    errorLoadingJogadores={errorLoadingJogadores}
                    filterByNomeTime={filterByNomeTime}
                    onFilterByNomeTimeChange={handleFilterByNomeTimeChange}
                />

                <DropdownDeleteJogos
                    idPartida={idPartidaToDelete}
                    onIdPartidaChange={(e) => setIdPartidaToDelete(e.target.value)}
                    filterByNomeTimeJogos={filterByNomeTimeJogos}
                    onFilterByNomeTimeJogosChange={handleFilterByNomeTimeJogosChange}
                    availablePartidas={availablePartidas}
                    loadingPartidas={loadingPartidas}
                    errorLoadingPartidas={errorLoadingPartidas}
                />

                <DropdownDeleteGols
                    idGol={idGolToDelete}
                    onIdGolChange={(e) => setIdGolToDelete(e.target.value)}
                    filterByIdPartidaGols={filterByIdPartidaGols}
                    onFilterByIdPartidaGolsChange={handleFilterByIdPartidaGolsChange}
                    availableGols={availableGols}
                    loadingGols={loadingGols}
                    errorLoadingGols={errorLoadingGols}
                />

                <DropdownDeleteCartao
                    idCartao={idCartaoToDelete}
                    onIdCartaoChange={(e) => setIdCartaoToDelete(e.target.value)}
                    filterByIdPartidaCartoes={filterByIdPartidaCartoes}
                    onFilterByIdPartidaCartoesChange={handleFilterByIdPartidaCartoesChange}
                    availableCartoes={availableCartoes}
                    loadingCartoes={loadingCartoes}
                    errorLoadingCartoes={errorLoadingCartoes}
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