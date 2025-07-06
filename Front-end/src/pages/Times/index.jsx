import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './styles.css';
import SearchIcon from '../../assets/Search_icon.png'
import { getTime } from '../../services/timeService';
import { getPartidasPorTime } from '../../services/jogoService';

function Times() {
    const [teamData, setTeamData] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [jogosTime, setJogosTime] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const teamNameFromUrl = params.get('name');

        if (teamNameFromUrl) {
            fetchTeam(teamNameFromUrl);
        }
    }, [location.search]);

    const fetchTeam = async (teamName) => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await getTime(teamName);
            const jogos = await getPartidasPorTime(teamName);
            setTeamData(data);
            setJogosTime(jogos);
        } catch (err) {
            console.error("Erro ao buscar time:", err);
            setError(`Time "${teamName}" não encontrado.`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async (nameToSearch = searchTerm) => {
        if (!nameToSearch.trim()) {
            setTeamData(null);
            setJogosTime([]);
            setError(null);
            return;
        }

        try {
            const data = await getTime(nameToSearch.trim());
            const jogos = await getPartidasPorTime(nameToSearch.trim());
            setTeamData(data);
            setJogosTime(jogos);
            setError(null);
            navigate(`/times?name=${encodeURIComponent(nameToSearch.trim())}`);
        } catch (err) {
            console.error("Erro ao buscar time:", err);
            setError(`Time "${nameToSearch}" não encontrado na base de dados.`);
        }

        setSearchTerm('');
    };

    const handleClickPlayer = (player) => {
        navigate(`/jogadores?id=${player.id}`);
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
                            placeholder="Busque por time"
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
                        Utilize a busca acima para encontrar informações sobre um time.
                    </div>
                )}

                {teamData && (
                    <div className="teams-details-content-container">
                        <div className="team-header">
                            <div>
                                <h2>{teamData.name}</h2>
                            </div>
                        </div>

                        <div className="main-content-grid">
                            <div className="card games-card">
                                <h3>Jogos</h3>
                                <ul>
                                    {jogosTime.length > 0 ? (
                                        jogosTime.map((game, index) => {
                                            const isCasa = game.c_time_casa === teamData.name;
                                            const adversario = isCasa ? game.c_time_visitante : game.c_time_casa;
                                            
                                            // ALTERADO: Lógica para exibir o placar na perspectiva do time visualizado
                                            const placar = isCasa 
                                                ? `${game.n_placar_casa} x ${game.n_placar_visitante}` 
                                                : `${game.n_placar_visitante} x ${game.n_placar_casa}`; 

                                            const resultado =
                                                (isCasa && game.n_placar_casa > game.n_placar_visitante) ||
                                                (!isCasa && game.n_placar_visitante > game.n_placar_casa)
                                                    ? 'vitoria'
                                                    : game.n_placar_casa === game.n_placar_visitante
                                                    ? 'empate'
                                                    : 'derrota';

                                            return (
                                                <li key={game.id_jogo || index}> {/* ALTERADO: Usando game.id_jogo como key, com fallback para index */}
                                                    <span className={`game-status-indicator ${resultado}`}></span>
                                                    <span>{placar} {adversario} - {corrigirEncoding(game.c_nome_campeonato)}</span>
                                                </li>
                                            );
                                        })
                                    ) : (
                                        <li>Nenhum jogo recente disponível.</li>
                                    )}
                                </ul>
                            </div>

                            <div className="card players-card">
                                <h3>Jogadores</h3>
                                <div className="players-list">
                                    {teamData.players && teamData.players.length > 0 ?
                                        teamData.players.map((player) => (
                                            <div key={player.id} className="player-item" onClick={() => handleClickPlayer(player)}>
                                                {corrigirEncoding(player.nome)}
                                            </div>
                                        )) : <div>Nenhum jogador listado.</div>
                                    }
                                </div>
                            </div>

                            <div className="right-column-cards">
                                <div className="card info-card">
                                    <h3>Informações</h3>
                                    <p>Cidade: {corrigirEncoding(teamData.city)}</p>
                                    <p>Técnico: {corrigirEncoding(teamData.coach)}</p>
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