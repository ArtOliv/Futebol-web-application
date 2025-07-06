import { useEffect, useState } from "react";
import { getCampeonatos } from "../../services/campeonatoService";
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
    async function carregarEstatisticas() {
      try {
        const resposta = await fetch('/estatisticas.json');
        const json = await resposta.json();
        setEstatisticas(json);
        setCarregando(false);
      } catch (err) {
        console.error('Erro ao carregar JSON:', err);
        setError('Erro ao carregar dados.');
        setCarregando(false);
      }
    }

    carregarEstatisticas();
  }, []);

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
        { titulo: 'Artilheiros', campo: 'gols', dados: estatisticas.artilheiros || [] },
        { titulo: 'Cartões Amarelos', campo: 'amarelos', dados: estatisticas.amarelos || [] },
        { titulo: 'Cartões Vermelhos', campo: 'vermelhos', dados: estatisticas.vermelhos || [] },
        { titulo: 'Assistências', campo: 'assistencias', dados: estatisticas.assistencias || [] },
        { titulo: 'Defesas', campo: 'defesas', dados: estatisticas.defesas || [] }
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
                                        <th>Jogador</th>
                                        <th style={{ textAlign: 'center', paddingLeft: '115px' }}>
                                            {bloco.titulo.includes('Cartões') ? 'Cartões' : bloco.campo[0].toUpperCase() + bloco.campo.slice(1)}
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
                                                        <span className="time-menor">{item.time}</span>
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