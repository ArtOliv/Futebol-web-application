import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './styles.css';
import SearchIcon from '../../assets/Search_icon.png'

function Jogadores() {
    const [allPlayersData, setAllPlayersData] = useState([]);
    const [foundPlayers, setFoundPlayers] = useState([]);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation()

    useEffect(() => {
        const loadAllPlayers = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch('/jogadores_data.json'); 
                if (!response.ok) {
                    throw new Error(`Erro ao carregar a lista de jogadores: ${response.statusText}`);
                }
                const data = await response.json();
                setAllPlayersData(data); 
            } catch (err) {
                console.error("Erro ao carregar dados de todos os jogadores:", err);
                setError("Não foi possível carregar a lista de jogadores. Verifique o console.");
            } finally {
                setIsLoading(false);
            }
        };
        loadAllPlayers();
    }, []);


    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const playerNameFromUrl = params.get('name');
        const playerIdFromUrl = params.get('id');

        if (allPlayersData.length > 0) {
            if (playerIdFromUrl) {
                const playerById = allPlayersData.find(player => player.id === playerIdFromUrl);
                setSelectedPlayer(playerById || null);
                setFoundPlayers([]);
                setError(playerById ? null : `Jogador com ID "${playerIdFromUrl}" não encontrado.`);
                setSearchTerm('');
            } else if (playerNameFromUrl) {
                const decodedPlayerName = decodeURIComponent(playerNameFromUrl);
                const playersByName = allPlayersData.filter(player =>
                    player.name.toLowerCase().includes(decodedPlayerName.toLowerCase())
                );
                setFoundPlayers(playersByName);
                setSelectedPlayer(null);
                setError(playersByName.length > 0 ? null : `Jogador "${decodedPlayerName}" não encontrado.`);
                setSearchTerm(decodedPlayerName);
            } else {
                setFoundPlayers([]);
                setSelectedPlayer(null);
                setError(null);
                setSearchTerm('');
            }
        }
    }, [location.search, allPlayersData]);

    const handleSearch = (term = searchTerm) => {
        const lowerCaseTerm = term.toLowerCase().trim();

        if (!lowerCaseTerm) {
            setFoundPlayers([]);
            setSelectedPlayer(null);
            setError(null);
            return;
        }

        const filteredPlayers = allPlayersData.filter(player =>
            player.name.toLowerCase().includes(lowerCaseTerm)
        );

        setFoundPlayers(filteredPlayers);
        setSelectedPlayer(null);
        setError(filteredPlayers.length > 0 ? null : `Jogador "${term}" não encontrado.`);
    };

    const handleSelectPlayer = (player) => {
        setSelectedPlayer(player);
        setFoundPlayers([]);
        setSearchTerm(player.name);
        setSearchTerm('');
    };

    if (isLoading && allPlayersData.length === 0) {
        return (
            <div className="page-wrapper-background">
                <div className="main">
                    <div className="loading-message">Carregando lista de jogadores...</div>
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
                            placeholder="Busque por jogador (ex: Cristiano Ronaldo, Messi)..."
                            className="search-input"
                            value={searchTerm}
                            onChange={e => {
                                setSearchTerm(e.target.value)
                                handleSearch(e.target.value)
                            }}
                            onKeyDown={e => {
                                if (e.key === 'Enter') {
                                    handleSearch();
                                }
                            }}
                            />
                        <button className="search-button" onClick={() => handleSearch()}>
                            <img src={SearchIcon} alt='pesquisar'/>
                        </button>
                    </div>
                </div>

                {error && <div className="error-message">{error}</div>}

                {!selectedPlayer && !error && (
                    <>
                        {!searchTerm && foundPlayers.length === 0 && (
                            <div className="no-data-message">
                                Utilize a busca acima para encontrar informações sobre um jogador. <br/>
                                Tente digitar "Cristiano Ronaldo" ou "Messi".
                            </div>
                        )}

                        {foundPlayers.length > 0 && (
                            <div className="search-results-list">
                                <h3>Resultados da Busca:</h3>
                                <ul>
                                    {foundPlayers.map((player) => (
                                        <li key={player.id + player.team}
                                            onClick={() => handleSelectPlayer(player)}
                                        >
                                            {player.name} ({player.team})
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {searchTerm && foundPlayers.length === 0 && (
                            <div className="no-data-message">
                                Jogador "{searchTerm}" não encontrado. Verifique a grafia.
                            </div>
                        )}
                    </>
                )}

                {selectedPlayer && (
                    <div className="details-content-container">
                        <div className="player-header">
                                <h2>{selectedPlayer.name}</h2>
                                <p>{selectedPlayer.team}</p>
                        </div>


                        <div className="player-details-grid">
                            <div className="card player-info-card">
                                <div className="info-item">
                                    <span>Idade:</span>
                                    <span>{selectedPlayer.age || 'N/A'}</span>
                                </div>
                                <div className="info-item">
                                    <span>Posição:</span>
                                    <span>{selectedPlayer.position || 'N/A'}</span>
                                </div>
                                <div className="info-item">
                                    <span>Camisa:</span>
                                    <span>{selectedPlayer.jerseyNumber || 'N/A'}</span>
                                </div>
                            </div>


                            <div className="card player-stats-card">
                                <h3>Estatísticas</h3>
                                <div className="stats-grid">
                                    <div className="stat-item">
                                        <span>Gols:</span>
                                        <span>{selectedPlayer.statistics?.goals || 0}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span>Vitórias:</span>
                                        <span>{selectedPlayer.statistics?.wins || 0}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span>Derrotas:</span>
                                        <span>{selectedPlayer.statistics?.losses || 0}</span>
                                    </div>
                                </div>
                            </div>
                        </div> 
                    </div> 
                )}
            </div>
        </div>
    );
}

export default Jogadores;