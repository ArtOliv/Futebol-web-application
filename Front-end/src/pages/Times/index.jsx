// src/pages/Times/Times.jsx

import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './styles.css';
import SearchIcon from '../../assets/Search_icon.png'

function Times() {
    const [allTeamsData, setAllTeamsData] = useState([]);
    const [teamData, setTeamData] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        const loadAllTeams = async () => {
            setIsLoading(true);
            setError(null);
            setSearchTerm('');
            try {
                const response = await fetch('/times_data.json');
                if (!response.ok) {
                    throw new Error(`Erro ao carregar a lista de times: ${response.statusText}`);
                }
                const data = await response.json();
                setAllTeamsData(data);
            } catch (err) {
                console.error("Erro ao carregar dados de todos os times:", err);
                setError("Não foi possível carregar a lista de times. Verifique o console.");
            } finally {
                setIsLoading(false);
            }
        };
        loadAllTeams();
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const teamNameFromUrl = params.get('name');

        if (teamNameFromUrl && allTeamsData.length > 0) {
            const decodedTeamName = decodeURIComponent(teamNameFromUrl);
            handleSearch(decodedTeamName); 
        } else if (!teamNameFromUrl && searchTerm && teamData) {
            setPlayerData(null); 
            setError(null);
        }

        setSearchTerm('');
    }, [location.search, allTeamsData]);

    const handleSearch = (nameToSearch = searchTerm) => {
        if (!nameToSearch.trim()) {
            setTeamData(null);
            setError(null);
            return;
        }

        const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();

        const foundTeam = allTeamsData.find(team =>
            team.name.toLowerCase().includes(lowerCaseSearchTerm)
        );

        if (foundTeam) {
            setTeamData(foundTeam);
            setError(null);
        } else {
            setTeamData(null);
            setError(`Time "${searchTerm}" não encontrado na lista. Verifique a grafia.`);
        }

        setSearchTerm('');
    };

    const handleClickPlayer = (playerName) => {
        navigate(`/jogadores?name=${encodeURIComponent(playerName)}`);
    };

    if (isLoading && allTeamsData.length === 0) {
        return (
            <div className="page-wrapper-background">
                <div className="main">
                    <div className="loading-message">Carregando lista de times...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-wrapper-background">
            <div className='main'>
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

                {error && <div className="error-message">{error}</div>}

                {!teamData && !error && (
                    <div className="no-data-message">
                        Utilize a busca acima para encontrar informações sobre um time. <br/>
                        Tente digitar "Flamengo" ou "Palmeiras".
                    </div>
                )}

                {teamData && (
                    <div className="teams-details-content-container">
                        <div className="team-header">
                            <div>
                                <h2>{teamData.name}</h2>
                                <p>{teamData.leaguePosition}</p>
                            </div>
                        </div>

                        <div className="main-content-grid">
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

                            <div className="card players-card">
                                <h3>Jogadores</h3>
                                <div className="players-list">
                                    {teamData.players && teamData.players.length > 0 ?
                                        teamData.players.map((player, index) => (
                                            <div key={index} className="player-item" onClick={() => handleClickPlayer(player)}>
                                                {player}
                                            </div>
                                        )) : <div>Nenhum jogador listado.</div>
                                    }
                                </div>
                            </div>

                            <div className="right-column-cards">
                                <div className="card info-card">
                                    <h3>Informações</h3>
                                    <p>Fundado em: {teamData.founded}</p>
                                    <p>Cidade: {teamData.city}</p>
                                    <p>Técnico: {teamData.coach}</p>
                                    {teamData.stadium && <p>Estádio: {teamData.stadium}</p>}
                                    {teamData.capacity && <p>Capacidade: {teamData.capacity}</p>}
                                </div>

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
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Times;