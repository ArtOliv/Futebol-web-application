import { useEffect, useState } from "react";
import { getCampeonatos } from "../../services/campeonatoService";
import { getEstatisticasJogadores, getEstatisticasPartidas } from "../../services/estatisticasService";
import './styles.css'

function Estatisticas(){
    const [campeonato, setCampeonato] = useState([])
    const [selecionado, setSelecionado] = useState({nome: "", ano: null})
    const [estatisticas, setEstatisticas] = useState({});
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
        if(!selecionado.nome || !selecionado.ano){
            return
        }

        async function carregarEstatisticas() {
            setCarregando(true)
            try{
                const [jogadores, partidas] = await Promise.all([
                    getEstatisticasJogadores(selecionado.nome, selecionado.ano),
                    getEstatisticasPartidas(selecionado.nome, selecionado.ano)
                ])

                const formatar = (lista, campo) =>
                    lista.map(j => ({
                        nome: `${j.c_Pnome_jogador} ${j.c_Unome_jogador}`,
                        time: j.c_nome_time,
                        [campo]: j[campo]
                    }))

                const formatarTimes = (lista, campo) => 
                    lista.map(t => ({
                        nome: t.c_nome_time,
                        time: "",
                        [campo]: t[campo]
                    }))
                
                setEstatisticas({
                    artilheiros: formatar(jogadores.jogadores_mais_gols, "total_gols"),
                    amarelos: formatar(jogadores.jogadores_mais_cartoes_amarelos, "total_cartoes_amarelos"),
                    vermelhos: formatar(jogadores.jogadores_mais_cartoes_vermelhos, "total_cartoes_vermelhos"),
                    vitorias_casa: formatarTimes(partidas.times_mais_vencem_casa, "vitorias_casa"),
                    vitorias_fora: formatarTimes(partidas.times_mais_vencem_fora, "vitorias_fora"),
                    fair_play: formatarTimes(partidas.times_fair_play, "total_cartoes"),
                    violentos: formatarTimes(partidas.times_violentos, "total_cartoes")
                });

                setError(null)
            } catch(err) {
                console.error("Erro ao carregar estatísticas:", err)
            } finally {
                setCarregando(false);
            }
        }

        carregarEstatisticas();
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

    function corrigirEncoding(str){
        try {
            const bytes = new Uint8Array(str.split('').map(c => c.charCodeAt(0)));
            const decoder = new TextDecoder('utf-8');
            return decoder.decode(bytes);
        } catch {
            return str;
        }
    }

    const blocos = [
        { titulo: 'Artilheiro', campo: 'total_gols', coluna: 'Gols', dados: estatisticas.artilheiros || [] },
        { titulo: 'Cartões Amarelos', campo: 'total_cartoes_amarelos', coluna: 'Cartões', dados: estatisticas.amarelos || [] },
        { titulo: 'Cartões Vermelhos', campo: 'total_cartoes_vermelhos', coluna: 'Cartões', dados: estatisticas.vermelhos || [] },
        { titulo: 'Time que mais vence em casa', campo: 'vitorias_casa', coluna: 'Vitórias', dados: estatisticas.vitorias_casa || [] },
        { titulo: 'Time que mais vence fora', campo: 'vitorias_fora', coluna: 'Vitórias', dados: estatisticas.vitorias_fora || [] },
        { titulo: 'Time Fair Play', campo: 'total_cartoes', coluna: 'Cartões', dados: estatisticas.fair_play || [] },
        { titulo: 'Time mais violento', campo: 'total_cartoes', coluna: 'Cartões', dados: estatisticas.violentos || [] }
    ];

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
                <div className="parte_cinza">
                    {blocos.map((bloco, index) => (
                        <div key={index} className="estat-tabela-card">
                            <div className="titulo-card">{bloco.titulo}</div>
                            <table>
                                <colgroup>
                                    <col style={{ width: '85%' }} />
                                    <col style={{ width: '15%' }} />
                                </colgroup>
                                <thead>
                                    <tr>
                                        <th>{bloco.titulo.startsWith("Times") || bloco.titulo.startsWith("Time") ? "Time" : "Jogador"}</th>
                                        <th style={{ textAlign: 'center', paddingLeft: '100px' }}>
                                            {bloco.coluna[0].toUpperCase() + bloco.coluna.slice(1)}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bloco.dados.slice(0, 5).map((item, i) => (
                                        <tr key={i}>
                                            <td>
                                                <div className="row-content">
                                                    <span className="rank">{i + 1}</span> 
                                                    <span className="row-text">
                                                        {item.nome} 
                                                        {item.time && <span className="time-menor">{item.time}</span>}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="valor-direita">{item[bloco.campo]}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}

export default Estatisticas