import { useEffect, useState } from "react";
import './styles.css'

function Classificacao(){
    const [dados, setDados] = useState([]);
    const [campeonato, setCampeonato] = useState("classificacao");

    useEffect(() => {
        fetch(`/${campeonato}.json`)
            .then(res => res.json())
            .then(setDados)
    }, [campeonato]);

    return(
        <>
            <div className='main-page'>
                <select className="select-campeonato" value={campeonato} onChange={e => setCampeonato(e.target.value)}>
                    <option value="classificacao">Brasileirão 2023</option>
                    <option value="libertadores">Libertadores</option>
                    <option value="mundial">Mundial</option>
                </select>

                <div className="drop-content">
                    <table>
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
                        <thead>
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
                        <tbody>
                            {dados.map(grupos => (
                                <tr key={grupos.time}>
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
                </div>
            </div>
        </>
    )
}

export default Classificacao