import { useEffect, useState } from "react";
import './styles.css'
import ModalJogo from '../../components/Modal_jogo'

function Jogos(){
    const [campeonato, setCampeonato] = useState("brasileirao")
    const [jogos, setJogos] = useState([])
    const [rodadaSelecionada, setRodadaSelecionada] = useState("")
    const [jogoSelecionado, setJogoSelecionado] = useState(null)
    const [carregando, setCarregando] = useState(true)

    useEffect(() => {
        setCarregando(true)
        fetch(`/jogos_${campeonato}.json`)
        .then(res => res.json())
        .then(data => {
            setJogos(data)
            setRodadaSelecionada(data.length > 0 ? data[0].rodada : "")
            setCarregando(false)
        })
    }, [campeonato])

    if(carregando){
        return null
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
                </div>
                {jogoSelecionado && (
                    <ModalJogo jogo={jogoSelecionado} fechar={() => setJogoSelecionado(null)}/>
                )}
            </div>
        </>
    )
}

export default Jogos