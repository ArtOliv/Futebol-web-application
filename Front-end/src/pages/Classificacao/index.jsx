import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom'
import './styles.css'

function Classificacao(){
    const [dados, setDados] = useState([])
    const [campeonato, setCampeonato] = useState("classificacao")
    const [carregando, setCarregando] = useState(true)
    const [error, setError] = useState(null);
    const navigate = useNavigate()

    useEffect(() => {
        setCarregando(true)
        setError(null); 
        fetch(`/${campeonato}.json`)
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Erro ao carregar os dados da classificação: ${res.statusText}`);
                }
                return res.json();
            })
            .then(data => {
                setDados(data)
                setCarregando(false)
            })
            .catch(err => {
                console.error("Erro ao carregar dados da classificação:", err);
                setError("Não foi possível carregar a classificação. Verifique a conexão ou os arquivos."); // Define a mensagem de erro
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

    const handleClickTime = (teamName) => {
        navigate(`/times?name=${encodeURIComponent(teamName)}`)
    }

    return(
        <>
            <div className='main-page'>
                <select className="select-campeonato" value={campeonato} onChange={e => setCampeonato(e.target.value)}>
                    <option value="classificacao">Brasileirão 2023</option>
                    <option value="libertadores">Libertadores</option>
                    <option value="mundial">Mundial</option>
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