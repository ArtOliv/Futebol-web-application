import './styles.css'
import ArrowIcon from '../../assets/Arrow_icon.png'
import BallIcon from '../../assets/Ball_icon.png'
import RedCardIcon from '../../assets/RedCard_icon.png'

function Modal_jogo({jogo, fechar}){
    const temGol = [...(jogo.eventos_mandante || []), ...(jogo.eventos_visitante || [])].some(e => e.tipo === 'gol')

    const temVermelho = [...(jogo.eventos_mandante || []), ...(jogo.eventos_visitante || [])].some(e => e.tipo === 'vermelho')

    function agruparEventosJogador(eventos, tipo){
        const agrupado = {}

        eventos.forEach(ev => {
            if(ev.tipo === tipo){
                if(!agrupado[ev.jogador]){
                    agrupado[ev.jogador] = [];
                }
                agrupado[ev.jogador].push(ev.tempo)
            }
        })

        return Object.entries(agrupado).map(([jogador, tempo]) => ({jogador, tempo: tempo.join(', ')}))
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

    return (
        <div className="modal-overlay" onClick={fechar}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <button onClick={fechar}><img src={ArrowIcon} alt="Voltar"/></button>
                    <span className="camp-label">{jogo.campeonato}</span>
                    <span>•</span> 
                    <span className="date-label">{jogo.dia} | {jogo.data} | {jogo.hora}</span>
                    <span>•</span>
                    <span className="date-label">{jogo.status}</span>
                </div>
                <div className="scoreboard-container">
                    <div className="team">{jogo.mandante}</div>
                    <div className="central-scoreboard">
                        <span className="goals">{jogo.gols_mandante}</span>
                        <span className="vs">X</span>
                        <span className="goals">{jogo.gols_visitante}</span>
                    </div>
                    <div className="team">{jogo.visitante}</div>
                </div>
                <div className="central-events">
                    {temGol && (
                        <div className="event-line">
                            <div className="left">
                                {agruparEventosJogador(jogo.eventos_mandante, 'gol').map((ev, idx) => (
                                    <div key={idx}>{corrigirEncoding(ev.jogador)} {ev.tempo}</div>
                                ))}
                            </div>
                            <div className="central-icon">
                                <img src={BallIcon} alt="Gols" className="event-icon" />
                            </div>
                            <div className="right">
                                {agruparEventosJogador(jogo.eventos_visitante, 'gol').map((ev, idx) => (
                                    <div key={idx}>{corrigirEncoding(ev.jogador)} {ev.tempo}</div>
                                ))}
                            </div>
                        </div>
                    )}

                    {temVermelho && (
                        <div className="event-line">
                            <div className="left">
                                {agruparEventosJogador(jogo.eventos_mandante, 'vermelho').map((ev, idx) => (
                                    <div key={idx}>{corrigirEncoding(ev.jogador)} {ev.tempo}</div>
                                ))}
                            </div>
                            <div className="central-icon">
                                <img src={RedCardIcon} alt="Cartão vermelho" className="event-icon" />
                            </div>
                            <div className="right">
                                {agruparEventosJogador(jogo.eventos_visitante, 'vermelho').map((ev, idx) => (
                                    <div key={idx}>{corrigirEncoding(ev.jogador)} {ev.tempo}</div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Modal_jogo