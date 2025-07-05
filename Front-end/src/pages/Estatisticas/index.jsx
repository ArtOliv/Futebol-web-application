import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom'
import { getCampeonatos } from "../../services/campeonatoService";
import './styles.css'

function Estatisticas(){
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
                <div className="drop-contentteste">
                    
                </div>
            </div>
        </>
    )
}

export default Estatisticas