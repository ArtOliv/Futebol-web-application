import { useEffect, useState } from "react";
import './styles.css'
import ModalJogo from '../../components/ModalJogo'
import { getCampeonatos } from '../../services/campeonatoService';
import { getPartidas } from "../../services/jogoService";
import { getGolsPorPartida } from "../../services/golService";
import { getCartoesPorPartida } from "../../services/cartaoService";

function Jogos(){
    const [campeonato, setCampeonato] = useState([])
    const [selecionado, setSelecionado] = useState({ nome: "", ano: null })
    const [jogos, setJogos] = useState([])
    const [rodadaSelecionada, setRodadaSelecionada] = useState("")
    const [jogoSelecionado, setJogoSelecionado] = useState(null)
    const [carregando, setCarregando] = useState(true)
    const [error, setError] = useState(null);

    useEffect(() => {
        getCampeonatos()
            .then(data => {
                setCampeonato(data);
                if (data.length > 0) {
                    setSelecionado({ nome: data[0].c_nome_campeonato, ano: data[0].d_ano_campeonato });
                }
            })
            .catch(err => {
                console.error("Erro ao carregar campeonatos:", err);
                setError("Erro ao carregar campeonatos.");
            });
    }, []);

    useEffect(() => {
        if (!selecionado.nome || !selecionado.ano) return;

        setCarregando(true)
        setError(null)

        getPartidas(selecionado.nome, selecionado.ano)
            .then(data => {
                const formatado = data.map(j => {
                    const dataHora = new Date(j.dt_data_horario)
                    return {
                        campeonato: corrigirEncoding(j.c_nome_campeonato),
                        id: j.id_jogo,
                        status: j.c_status,
                        rodada: j.n_rodada,
                        mandante: j.c_time_casa,
                        visitante: j.c_time_visitante,
                        gols_mandante: j.n_placar_casa,
                        gols_visitante: j.n_placar_visitante,
                        local: j.c_nome_estadio,
                        dataCompleta: j.dt_data_horario,
                        data: dataHora.toLocaleDateString(),
                        hora: dataHora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        dia: formatarDiaSemana(dataHora.toLocaleDateString('pt-BR', { weekday: 'long' }))
                    }
                })
                setJogos(formatado)
                setRodadaSelecionada(formatado.length > 0 ? formatado[0].rodada : "")
                setCarregando(false)
            })
            .catch(err => {
                console.error("Erro ao carregar dados dos jogos:", err);
                setError("Não foi possível carregar os jogos.");
                setCarregando(false);
            });
    }, [selecionado]);

    if(carregando){
        return null
    }

    if(error){
        return (
            <div className="page-wrapper-background">
                <div className="main">
                    <div className="error-message">{error}</div>
                </div>
            </div>
        );
    }

    async function handleAbrirModal(jogoBase){
        try {
            const [gols, cartoes] = await Promise.all([
                getGolsPorPartida(jogoBase.id),
                getCartoesPorPartida(jogoBase.id)
            ])

            const eventos_mandante = []
            const eventos_visitante = []

            gols.forEach(ev => {
                const evento = { jogador: ev.c_nome_jogador, tempo: ev.n_minuto_gol, tipo: 'gol' }
                if (ev.c_nome_time === jogoBase.mandante) eventos_mandante.push(evento)
                else eventos_visitante.push(evento)
            })

            cartoes.forEach(ev => {
                if (ev.e_tipo === 'vermelho') {
                    const evento = { jogador: ev.c_nome_jogador, tempo: ev.n_minuto_cartao, tipo: 'vermelho' }
                    if (ev.c_nome_time === jogoBase.mandante) eventos_mandante.push(evento)
                    else eventos_visitante.push(evento)
                }
            })

            setJogoSelecionado({
                ...jogoBase,
                eventos_mandante,
                eventos_visitante
            })
        } catch (error) {
            console.error("Erro ao carregar eventos do jogo:", error)
            setError("Erro ao carregar eventos do jogo.")
        }
    }

    const jogosPorRodada = jogos.reduce((acc, jogo) => {
        if(!acc[jogo.rodada]){
            acc[jogo.rodada] = []
        }
        acc[jogo.rodada].push(jogo)
        return acc
    }, {})

    const rodadas = Object.keys(jogosPorRodada).sort((a, b) => Number(a) - Number(b))

    function formatarDiaSemana(str) {
        if (!str) return "";
        const capitalizado = str.charAt(0).toUpperCase() + str.slice(1);
        if(capitalizado.endsWith("-feira") && !["Domingo", "Sábado"].includes(capitalizado)) {
            return capitalizado.replace("-feira", "");
        }
        return capitalizado;
    }

    function corrigirEncoding(str){
        try {
            const bytes = new Uint8Array(str.split('').map(c => c.charCodeAt(0)));
            const decoder = new TextDecoder('utf-8');
            return decoder.decode(bytes);
        } catch {
            return str;
        }
    }

    return(
        <>
            <div className='main-page'>
                <select className="select-campeonato" value={`${selecionado.nome}-${selecionado.ano}`} onChange={e => {const [nome, ano] = e.target.value.split("-"); setSelecionado({nome, ano: Number(ano)});}}>
                    {campeonato.map(camp => (
                        <option key={`${camp.c_nome_campeonato}-${camp.d_ano_campeonato}`} value={`${camp.c_nome_campeonato}-${camp.d_ano_campeonato}`}>
                            {corrigirEncoding(camp.c_nome_campeonato)}
                        </option>
                    ))}
                </select>
                <div className="table-bg">
                    {jogos.length > 0 ? (
                        <>
                            {rodadas.length > 0 ? (
                                <select className="select-round" value={rodadaSelecionada} onChange={e => setRodadaSelecionada(e.target.value)}>
                                    {rodadas.map(rodada => (
                                        <option key={rodada} value={rodada}>Rodada {rodada}</option>
                                    ))}
                                </select>
                            ) : (
                                <div className="no-data-message">Rodadas indisponíveis</div>
                            )}
                            {rodadaSelecionada && jogosPorRodada[rodadaSelecionada] && (
                                <div key={rodadaSelecionada} className="round-section">
                                    <div className="match-list">
                                        {jogosPorRodada[rodadaSelecionada].map(jogo => (
                                            <div className="match-card" key={jogo.id} onClick={() => handleAbrirModal(jogo)}>
                                                <span className="stadium">{corrigirEncoding(jogo.local)}</span>
                                                <span className="teams">{jogo.mandante}</span>
                                                <span className="score">{jogo.gols_mandante}</span>
                                                <span className="score">X</span>
                                                <span className="score">{jogo.gols_visitante}</span>
                                                <span className="teams">{jogo.visitante}</span>
                                                <div className="info-group">
                                                    <span className="info">{jogo.dia}</span> 
                                                    <span className="info">|</span>
                                                    <span className="info">{jogo.data}</span> 
                                                    <span className="info">|</span>
                                                    <span className="info">{jogo.hora}</span> 
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="no-data-message">Nenhum jogo encontrado para o campeonato selecionado.</div>
                    )}
                </div>
                {jogoSelecionado && (
                    <ModalJogo jogo={jogoSelecionado} fechar={() => setJogoSelecionado(null)}/>
                )}
            </div>
        </>
    )
}

export default Jogos