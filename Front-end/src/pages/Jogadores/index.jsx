import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './styles.css';
import SearchIcon from '../../assets/Search_icon.png'
import { getJogadoresPorNome } from '../../services/jogadorService';
import { getJogadoresPorId } from '../../services/jogadorService';


function Jogadores() {
    const [foundPlayers, setFoundPlayers] = useState([]);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const location = useLocation()

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
                    setSelectedPlayer({
                        id: player.id_jogador,
                        name: player.nome_completo,
                        team: player.c_nome_time,
                        age: calcularIdade(player.d_data_nascimento),
                        position: player.c_posicao,
                        jerseyNumber: player.n_camisa,
                        statistics: {
                            goals: player.gols || 0,
                            wins: player.vitorias || 0,
                            losses: player.derrotas || 0
                        }
                    });
                    setSearchTerm('');
                } else if (playerNameFromUrl) {
                    const decodedName = decodeURIComponent(playerNameFromUrl);
                    const data = await getJogadoresPorNome(decodedName);
                    const formatted = data.map(player => ({
                        id: player.id_jogador,
                        name: player.nome_completo,
                        team: player.c_nome_time,
                        age: calcularIdade(player.d_data_nascimento),
                        position: player.c_posicao,
                        jerseyNumber: player.n_camisa,
                        statistics: {
                            goals: player.gols || 0,
                            wins: player.vitorias || 0,
                            losses: player.derrotas || 0
                        }
                    }));

                    setFoundPlayers(formatted);
                    setSelectedPlayer(null);
                    setError(formatted.length > 0 ? null : `Jogador "${decodedName}" não encontrado.`);
                    setSearchTerm(decodedName);
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
            const formatted = data.map(player => ({
                id: player.id_jogador,
                name: player.nome_completo,
                team: player.c_nome_time,
                age: calcularIdade(player.d_data_nascimento),
                position: player.c_posicao,
                jerseyNumber: player.n_camisa,
                statistics: {
                    goals: player.gols || 0,
                    wins: player.vitorias || 0,
                    losses: player.derrotas || 0
                }
            }));

            setFoundPlayers(formatted);
            setSelectedPlayer(null);
            setError(formatted.length > 0 ? null : `Jogador "${term}" não encontrado.`);
        } catch (err) {
            console.error("Erro ao buscar jogadores:", err);
            setError("Erro ao buscar jogadores. Verifique o console.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectPlayer = (player) => {
        setSelectedPlayer(player);
        setFoundPlayers([]);
        setSearchTerm(player.name);
        setSearchTerm('');
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

    function corrigirEncoding(str){
        try {
            const bytes = new Uint8Array(str.split('').map(c => c.charCodeAt(0)));
            const decoder = new TextDecoder('utf-8');
            return decoder.decode(bytes);
        } catch {
            return str;
        }
    }

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
                                    <span>{corrigirEncoding(selectedPlayer.position) || 'N/A'}</span>
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
                                        <span>{selectedPlayer.statistics?.wins || 0}</span>
                                    </div>
                                    <div className="stat-item">
                                        <span>Cartoẽs vermelhos:</span>
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