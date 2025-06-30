import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom'
import { getClassificacaoGeral } from "../../services/classificacaoService";
import { getCampeonatos } from "../../services/campeonatoService";
import './styles.css'

function Classificacao(){
    const [dados, setDados] = useState([])
    const [campeonato, setCampeonato] = useState([])
    const [selecionado, setSelecionado] = useState({nome: "", ano: null})
    const [carregando, setCarregando] = useState(true)
    const [error, setError] = useState(null);
    const navigate = useNavigate()


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

        setCarregando(true);
        setError(null);

        getClassificacaoGeral()
            .then(data => {
                const dadosFiltrados = data.filter(item =>
                    item.c_nome_campeonato.toLowerCase() === selecionado.nome.toLowerCase() &&
                    item.d_ano_campeonato === selecionado.ano
                );

                const dadosFormatados = dadosFiltrados.map((item, index) => ({
                    posicao: index + 1,
                    time: item.c_nome_time,
                    pontos: item.n_pontos,
                    jogos: item.n_jogos,
                    vitorias: item.n_vitorias,
                    empates: item.n_empates,
                    derrotas: item.n_derrotas,
                    gols_pro: item.n_gols_pro,
                    gols_contra: item.n_gols_contra,
                    saldo_gols: item.n_saldo_gols
                }));

                setDados(dadosFormatados);
                setCarregando(false);
            })
            .catch(err => {
                console.error("Erro ao carregar dados da classificação:", err);
                setError("Não foi possível carregar a classificação.");
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

    const handleClickTime = (teamName) => {
        navigate(`/times?name=${encodeURIComponent(teamName)}`)
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
                <div className="drop-content">
                    {dados.length > 0 ? (
                        <table className="class-table">
                            <colgroup>
                                <col style={{ width: '100px' }}/>
                                <col style={{ width: '1200px' }}/>
                                <col/>
                                <col/>
                                <col/>
                                <col/>
                                <col/>
                                <col/>
                                <col/>
                                <col/>
                            </colgroup>
                            <thead className="class-thead">
                                <tr>
                                    <th>Posição</th>
                                    <th>Time</th>
                                    <th>P</th>
                                    <th>J</th>
                                    <th>V</th>
                                    <th>E</th>
                                    <th>D</th>
                                    <th>GP</th>
                                    <th>GC</th>
                                    <th>SG</th>
                                </tr>
                            </thead>
                            <tbody className="class-tbody">
                                {dados.map(grupos => (
                                    <tr key={grupos.time} onClick={() => handleClickTime(grupos.time)}>
                                        <td>{grupos.posicao}</td>
                                        <td>{grupos.time}</td>
                                        <td>{grupos.pontos}</td>
                                        <td>{grupos.jogos}</td>
                                        <td>{grupos.vitorias}</td>
                                        <td>{grupos.empates}</td>
                                        <td>{grupos.derrotas}</td>
                                        <td>{grupos.gols_pro}</td>
                                        <td>{grupos.gols_contra}</td>
                                        <td>{grupos.saldo_gols}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="no-data-message">Nenhum dado de classificação encontrado para o campeonato selecionado.</div>
                    )}
                </div>
            </div>
        </>
    )
}

export default Classificacao