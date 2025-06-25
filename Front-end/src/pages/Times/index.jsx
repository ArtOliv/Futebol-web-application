// src/pages/Times/Times.jsx

import React, { useEffect, useState } from 'react';
import './styles.css';
import SearchIcon from '../../assets/Search_icon.png'

function Times() {
    // Estado para armazenar TODOS os dados dos times (carregados do JSON principal)
    const [allTeamsData, setAllTeamsData] = useState([]);
    // Estado para os detalhes do time SELECIONADO/BUSCADO para exibição
    const [teamData, setTeamData] = useState(null);
    // Estado para o valor do input de busca
    const [searchTerm, setSearchTerm] = useState('');
    // Estado para controlar o carregamento inicial do JSON de todos os times
    const [isLoading, setIsLoading] = useState(true); // Começa como true para carregar o JSON inicial
    // Estado para erros (seja na carga do JSON ou na busca por time)
    const [error, setError] = useState(null);

    // useEffect para carregar o JSON principal (times_data.json) uma única vez ao montar
    useEffect(() => {
        const loadAllTeams = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Busca o arquivo JSON principal que contém todos os times na pasta public
                const response = await fetch('/times_data.json'); // Caminho para o JSON de lista
                if (!response.ok) {
                    throw new Error(`Erro ao carregar a lista de times: ${response.statusText}`);
                }
                const data = await response.json();
                setAllTeamsData(data); // Armazena todos os times
            } catch (err) {
                console.error("Erro ao carregar dados de todos os times:", err);
                setError("Não foi possível carregar a lista de times. Verifique o console.");
            } finally {
                setIsLoading(false);
            }
        };
        loadAllTeams();
    }, []); // Array de dependências vazio: executa apenas uma vez ao montar o componente

    // Função para lidar com a busca de um time específico a partir de allTeamsData
    // Esta função é chamada quando o usuário clica em buscar ou pressiona Enter
    const handleSearch = () => {
        if (!searchTerm.trim()) { // Se o termo de busca estiver vazio ou só com espaços
            setTeamData(null); // Limpa o timeData
            setError(null); // Limpa o erro
            return;
        }

        const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();

        // Procura pelo time na lista carregada
        const foundTeam = allTeamsData.find(team =>
            team.name.toLowerCase().includes(lowerCaseSearchTerm)
        );

        if (foundTeam) {
            setTeamData(foundTeam); // Define os dados do time encontrado
            setError(null); // Limpa qualquer erro anterior
        } else {
            setTeamData(null); // Não encontrou o time
            setError(`Time "${searchTerm}" não encontrado na lista. Verifique a grafia.`);
        }
    };

    // Renderização condicional para carregamento inicial da lista de times
    if (isLoading && allTeamsData.length === 0) {
        return (
            <div className="page-wrapper-background">
                <div className="main">
                    <div className="loading-message">Carregando lista de times...</div>
                </div>
            </div>
        );
    }

    // Renderização principal da página
    return (
        <div className="page-wrapper-background">
            <div className='main'>
                {/* Elemento de Busca */}
                <div className="search-bar-container">
                    <div className="search-bar-bg">
                        <input
                            type="text"
                            placeholder="Busque por time (ex: Flamengo, Palmeiras)"
                            className="search-input"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') {
                                    handleSearch();
                                }
                            }}
                            />
                        <button className="search-button" onClick={handleSearch}>
                            <img src={SearchIcon} alt='pesquisar'/>
                        </button>
                    </div>
                </div>

                {/* Mensagem de Erro (se houver) */}
                {error && <div className="error-message">{error}</div>}

                {/* Mensagem se nenhum time foi buscado ou encontrado */}
                {!teamData && !error && (
                    <div className="no-data-message">
                        Utilize a busca acima para encontrar informações sobre um time. <br/>
                        Tente digitar "Flamengo" ou "Palmeiras".
                    </div>
                )}

                {/* Conteúdo dos detalhes do time (visível apenas se teamData existir) */}
                {teamData && (
                    <div className="teams-details-content-container">
                        {/* 1. Header do Time */}
                        <div className="team-header">
                            <div>
                                <h2>{teamData.name}</h2>
                                <p>{teamData.leaguePosition}</p>
                            </div>
                        </div>

                        {/* 2. Grid Principal com 3 Colunas */}
                        <div className="main-content-grid">
                            {/* Coluna da Esquerda: Card de Jogos */}
                            <div className="card games-card">
                                <h3>Jogos</h3>
                                <ul>
                                    {teamData.games && teamData.games.length > 0 ?
                                        teamData.games.map((game, index) => (
                                            <li key={index}>
                                                <span className={`game-status-indicator ${game.result}`}></span>
                                                {game.description}
                                            </li>
                                        )) : <li>Nenhum jogo recente disponível.</li>
                                    }
                                </ul>
                            </div>

                            {/* Coluna do Centro: Card de Jogadores */}
                            <div className="card players-card">
                                <h3>Jogadores</h3>
                                <div className="players-list">
                                    {teamData.players && teamData.players.length > 0 ?
                                        teamData.players.map((player, index) => (
                                            <div key={index} className="player-item">
                                                <span className="player-circle"></span> {player}
                                            </div>
                                        )) : <div>Nenhum jogador listado.</div>
                                    }
                                </div>
                            </div>

                            {/* Coluna da Direita: Container para Informações e Títulos */}
                            <div className="right-column-cards">
                                {/* Card de Informações */}
                                <div className="card info-card">
                                    <h3>Informações</h3>
                                    <p>Fundado em: {teamData.founded}</p>
                                    <p>Cidade: {teamData.city}</p>
                                    <p>Técnico: {teamData.coach}</p>
                                    {teamData.stadium && <p>Estádio: {teamData.stadium}</p>}
                                    {teamData.capacity && <p>Capacidade: {teamData.capacity}</p>}
                                </div>

                                {/* Card de Títulos */}
                                <div className="card titles-card">
                                    <h3>Títulos</h3>
                                    <ul>
                                        {teamData.titles && teamData.titles.length > 0 ?
                                            teamData.titles.map((title, index) => (
                                                <li key={index}><span className="close-icon">X</span> {title}</li>
                                            )) : <li>Nenhum título disponível.</li>
                                        }
                                    </ul>
                                </div>
                            </div>
                        </div> {/* Fim do main-content-grid */}
                    </div> /* Fim do details-content-container */
                )} {/* Fim da renderização condicional teamData */}
            </div>
        </div>
    );
}

export default Times;