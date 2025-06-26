import { useEffect, useState } from "react";
import './styles.css'
import ModalJogo from '../../components/ModalJogo'

function Jogos(){
    const [campeonato, setCampeonato] = useState("brasileirao")
    const [jogos, setJogos] = useState([])
    const [rodadaSelecionada, setRodadaSelecionada] = useState("")
    const [jogoSelecionado, setJogoSelecionado] = useState(null)
    const [carregando, setCarregando] = useState(true)
    const [error, setError] = useState(null);

    useEffect(() => {
        setCarregando(true)
        setError(null)
        fetch(`/jogos_${campeonato}.json`)
        .then(res => {
            if (!res.ok) {
                throw new Error(`Erro ao carregar dados dos jogos: ${res.statusText}`);
            }
            return res.json();
        })
        .then(data => {
            setJogos(data)
            setRodadaSelecionada(data.length > 0 ? data[0].rodada : "")
            setCarregando(false)
        })
        .catch(err => { 
            console.error("Erro ao carregar dados dos jogos:", err);
            setError("Não foi possível carregar os jogos. Verifique a conexão ou os arquivos."); 
            setCarregando(false);
        })
    }, [campeonato])

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

    const jogosPorRodada = jogos.reduce((acc, jogo) => {
        if(!acc[jogo.rodada]){
            acc[jogo.rodada] = []
        }
        acc[jogo.rodada].push(jogo)
        return acc
    }, {})

    const rodadas = Object.keys(jogosPorRodada).sort((a, b) => a - b)

    return(
        <>
            <div className='main-page'>
                <select className="select-campeonato" value={campeonato} onChange={e => setCampeonato(e.target.value)}>
                    <option value="brasileirao">Brasileirão 2023</option>
                    <option value="libertadores">Libertadores</option>
                    <option value="mundial">Mundial</option>
                </select>
                <div className="table-bg">
                    {jogos.length > 0 ? (
                        <>
                            {rodadas.length > 0 && (
                                <select className="select-round" value={rodadaSelecionada} onChange={e => setRodadaSelecionada(e.target.value)}>
                                    {rodadas.map(rodada => (
                                        <option key={rodada} value={rodada}>Rodada {rodada}</option>
                                    ))}
                                </select>
                            )}
                            {rodadaSelecionada && jogosPorRodada[rodadaSelecionada] && (
                                <div key={rodadaSelecionada} className="round-section">
                                    <div className="match-list">
                                        {jogosPorRodada[rodadaSelecionada].map(jogo => (
                                            <div className="match-card" key={jogo.jogo} onClick={() => setJogoSelecionado(jogo)}>
                                                <span className="stadium">{jogo.local}</span>
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