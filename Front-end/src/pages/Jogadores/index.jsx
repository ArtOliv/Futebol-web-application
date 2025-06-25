import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './styles.css';
import SearchIcon from '../../assets/Search_icon.png'

function Jogadores() {
    const [allPlayersData, setAllPlayersData] = useState([]);
    const [playerData, setPlayerData] = useState(null);
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

        if (playerNameFromUrl && allPlayersData.length > 0) {
            const decodedPlayerName = decodeURIComponent(playerNameFromUrl);
            const foundPlayer = allPlayersData.find(player =>
                player.name.toLowerCase().includes(decodedPlayerName.toLowerCase())
            );
            if (foundPlayer) {
                setPlayerData(foundPlayer);
                setError(null);
            } else {
                setPlayerData(null);
                setError(`Jogador "${decodedPlayerName}" não encontrado.`);
            }

            setSearchTerm('');
        }
    }, [location.search, allPlayersData]);

    const handleSearch = () => {
        if (!searchTerm.trim()) { 
            setPlayerData(null); 
            setError(null); 
            return;
        }

        const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();

        const foundPlayer = allPlayersData.find(player =>
            player.name.toLowerCase().includes(lowerCaseSearchTerm)
        );

        if (foundPlayer) {
            setPlayerData(foundPlayer); 
            setError(null); 
        } else {
            setPlayerData(null); 
            setError(`Jogador "${searchTerm}" não encontrado na lista. Verifique a grafia.`);
        }

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
                {/* pesquisa */}
                <div className="search-bar-container">
                    <div className="search-bar-bg">
                        <input
                            type="text"
                            placeholder="Busque por jogador (ex: Cristiano Ronaldo, Messi)..."
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

                {/* mensagem de erro */}
                {error && <div className="error-message">{error}</div>}

                {/* mensagem jogador nao encontrado */}
                {!playerData && !error && (
                    <div className="no-data-message">
                        Utilize a busca acima para encontrar informações sobre um jogador. <br/>
                        Tente digitar "Cristiano Ronaldo" ou "Messi".
                    </div>
                )}

                {playerData && (
                    <div className="details-content-container">
                        <div className="player-header">
                                <h2>{playerData.name}</h2>
                                <p>{playerData.team}</p>
                        </div>


                        <div className="player-details-grid">
                            <div className="card player-info-card">
                                <div className="info-item">
                                    <span>Peso:</span>
                                    <span>{playerData.weight || 'N/A'}</span>
                                </div>
                                <div className="info-item">
                                    <span>Altura:</span>
                                    <span>{playerData.height || 'N/A'}</span>
                                </div>
                                <div className="info-item">
                                    <span>Idade:</span>
                                    <span>{playerData.age || 'N/A'}</span>
                                </div>
                                <div className="info-item">
                                    <span>Posição:</span>
                                    <span>{playerData.position || 'N/A'}</span>
                                </div>
                                <div className="info-item">
                                    <span>Camisa:</span>
                                    <span>{playerData.jerseyNumber || 'N/A'}</span>
                                </div>
                            </div>


                            <div className="card player-stats-card">
                                <h3>Estatísticas</h3>
                                <div className="stats-grid">
                                    <div className="stat-item">
                                        <span>Títulos:</span>
                                        <span>{playerData.statistics?.titles || 0}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span>Gols:</span>
                                        <span>{playerData.statistics?.goals || 0}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span>Vitórias:</span>
                                        <span>{playerData.statistics?.wins || 0}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span>Assistências:</span>
                                        <span>{playerData.statistics?.assists || 0}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span>Derrotas:</span>
                                        <span>{playerData.statistics?.losses || 0}</span>
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