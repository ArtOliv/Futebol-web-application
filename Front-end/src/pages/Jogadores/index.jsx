import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './styles.css';
import SearchIcon from '../../assets/Search_icon.png'
import { getJogadoresPorNome } from '../../services/jogadorService';
import { getJogadoresPorId } from '../../services/jogadorService';
import { getEstatisticasJogadorGeral } from '../../services/estatisticasService';


function Jogadores() {
    const [foundPlayers, setFoundPlayers] = useState([]);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation()
    const navigate = useNavigate()

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const playerNameFromUrl = params.get('name');
        const playerIdFromUrl = params.get('id');

        const fetchPlayers = async () => {
            setIsLoading(true);
            setError(null);
            
            try {
                if (playerIdFromUrl) {
                    const player = await getJogadoresPorId(playerIdFromUrl);
                    const stats = await getEstatisticasJogadorGeral(player.id_jogador);
                    setSelectedPlayer({
                        id: parseInt(player.id_jogador) || 0,
                        name: player.nome_completo, // 'nome_completo' é do get_jogador_por_id
                        team: player.c_nome_time,
                        age: calcularIdade(player.d_data_nascimento),
                        // ALTERADO: Apenas use player.c_posicao diretamente se for string
                        position: player.c_posicao || 'N/A', 
                        jerseyNumber: player.n_camisa,
                        statistics: {
                            goals: stats.gols || 0,
                            yellowCards: stats.cartoes_amarelos || 0,
                            redCards: stats.cartoes_vermelhos || 0
                        }
                    });
                    setSearchTerm('');
                } else if (playerNameFromUrl) {
                    const decodedName = decodeURIComponent(playerNameFromUrl);
                    const data = await getJogadoresPorNome(decodedName);
                    
                    if (!Array.isArray(data) || data.length === 0) {
                        setFoundPlayers([]);
                        setSelectedPlayer(null);
                        setError(`Jogador "${decodedName}" não encontrado.`);
                        return;
                    }

                    const formatted = await Promise.all(data.map(async (player) => {
                        const stats = await getEstatisticasJogadorGeral(player.id_jogador)
                        return{
                            id: parseInt(player.id_jogador) || 0,
                            name: `${player.c_Pnome_jogador || ''} ${player.c_Unome_jogador || ''}`.trim(),
                            team: player.nome_time,
                            age: calcularIdade(player.d_data_nascimento),
                            // ALTERADO: Apenas use player.c_posicao diretamente se for string
                            position: player.c_posicao || 'N/A',
                            jerseyNumber: player.n_camisa,
                            statistics: {
                                goals: stats.gols || 0,
                                yellowCards: stats.cartoes_amarelos || 0,
                                redCards: stats.cartoes_vermelhos || 0
                            }
                        }
                    }));

                    setFoundPlayers(formatted);
                    setSelectedPlayer(null);
                    setError(formatted.length > 0 ? null : `Jogador "${decodedName}" não encontrado.`);
                    setSearchTerm(decodedName);
                } else {
                    setSelectedPlayer(null);
                }
            } catch (err) {
                console.error("Erro ao buscar jogadores:", err);
                setError("Erro ao buscar jogador.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchPlayers();
    }, [location.search]);

    const handleSearch = async (term = searchTerm) => {
        const trimmed = term.toLowerCase().trim();
        if (!trimmed) {
            setFoundPlayers([]);
            setSelectedPlayer(null);
            setError(null);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const data = await getJogadoresPorNome(trimmed);

            if (!Array.isArray(data) || data.length === 0) {
                setFoundPlayers([]);
                setSelectedPlayer(null);
                setError(`Jogador "${trimmed}" não encontrado.`);
                return;
            }

            // Apenas monta a lista com nome e time, sem estatísticas
            const players = data.map(player => ({
                id: parseInt(player.id_jogador) || 0,
                name: `${player.c_Pnome_jogador || ''} ${player.c_Unome_jogador || ''}`.trim(),
                team: player.nome_time
            }));

            setFoundPlayers(players);
            setSelectedPlayer(null);
            setError(null);
        } catch (err) {
            console.error("Erro ao buscar jogadores:", err);
            setError("Erro ao buscar jogadores. Verifique o console.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectPlayer = (player) => {
        navigate(`/jogadores?id=${player.id}`);
    };

    const calcularIdade = (dataNascimento) => {
        if (!dataNascimento) return 'N/A';
        const hoje = new Date();
        const nascimento = new Date(dataNascimento);
        let idade = hoje.getFullYear() - nascimento.getFullYear();
        const m = hoje.getMonth() - nascimento.getMonth();
        if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
            idade--;
        }
        return idade;
    };

    return (
        <div className="page-wrapper-background">
            <div className='main'>
                <div className="search-bar-container">
                    <div className="search-bar-bg">
                        <input
                            type="text"
                            placeholder="Busque por jogador"
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
                                Utilize a busca acima para encontrar informações sobre um jogador.
                            </div>
                        )}

                        {foundPlayers.length > 0 && (
                            <div className="search-results-list">
                                <h3>Resultados da Busca:</h3>
                                <ul>
                                    {foundPlayers.map((player) => (
                                        <li key={player.id} 
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
                                    {/* ALTERADO: Apenas exibe a string diretamente */}
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
                                        <span>Cartões amarelos:</span>
                                        <span>{selectedPlayer.statistics?.yellowCards || 0}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span>Cartoẽs vermelhos:</span>
                                        <span>{selectedPlayer.statistics?.redCards || 0}</span>
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