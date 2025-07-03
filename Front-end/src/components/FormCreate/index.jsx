// src/components/FormCreate/index.jsx
import React, { useState } from 'react'; // Importe useState
import './styles.css';

// Importe a função de serviço para o campeonato
import { postCampeonato } from '../../services/campeonatoService'; // Caminho relativo correto para o serviço
// Importe outros serviços (times, jogos) se for usá-los aqui
// import { postTime } from '../services/timeService';

// Importe os componentes DropDown
import DropDownCampeonato from './DropdownCampeonato'; // Caminho relativo
import DropDownTimes from './DropdownTimes';
import DropDownJogos from './DropdownJogos';

function FormCreate(){
    // --- ESTADOS PARA O CAMPEONATO (GERENCIADOS AQUI) ---
    // Corrigido: nomeCampeonato e anoCampeonato (sem 'e' extra no final da palavra)
    const [nomeCampeonato, setNomeCampeonato] = useState('');
    const [anoCampeonato, setAnoCampeonato] = useState(''); // Variável de estado é 'anoCampeonato'

    // --- ESTADOS PARA FEEDBACK GERAL DO FORMULÁRIO ---
    const [message, setMessage] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // --- FUNÇÃO DE SUBMISSÃO GERAL ---
    const handleOverallSubmit = async (event) => {
        event.preventDefault(); // Impede o recarregamento da página ao submeter o formulário

        // Limpa mensagens anteriores de feedback
        setMessage('');
        setError(null);
        setLoading(true); // Ativa o estado de carregamento

        try {
            // --- Lógica para CADASTRAR CAMPEONATO ---
            // Verifica se os campos de campeonato estão preenchidos
            if (nomeCampeonato && anoCampeonato) { // Usando os nomes corretos das variáveis de estado
                const responseMessage = await postCampeonato(
                    nomeCampeonato, // Usando o nome correto da variável de estado
                    parseInt(anoCampeonato) // Usando o nome correto da variável de estado
                );
                // Adiciona a mensagem de sucesso do campeonato
                setMessage(prev => prev + (prev ? '\n' : '') + `Campeonato: ${responseMessage}`);
                // Limpa os campos do campeonato após o sucesso
                setNomeCampeonato('');
                setAnoCampeonato('');
            } 
            // --- Lógica para CADASTRAR OUTROS ITENS (EXEMPLO: TIMES, JOGOS) ---
            // Você pode adicionar aqui a lógica para submeter os dados de DropDownTimes e DropDownJogos.
            // Para isso, você precisaria de estados para os campos deles aqui em FormCreate,
            // e passá-los como props para DropDownTimes e DropDownJogos, assim como fizemos para Campeonato.
            // Exemplo:
            // if (nomeTime && cidadeTime) {
            //    const timeResponseMessage = await postTime({ nome_time: nomeTime, cidade: cidadeTime }, nomeCampeonato, anoCampeamento);
            //    setMessage(prev => prev + (prev ? '\n' : '') + `Time: ${timeResponseMessage}`);
            //    setNomeTime('');
            // }


        } catch (err) {
            console.error("Erro na submissão geral:", err);
            // Exibe a mensagem de erro geral para o usuário
            setError(err.message || "Ocorreu um erro desconhecido durante a submissão.");
        } finally {
            setLoading(false); // Desativa o estado de carregamento
        }
    };

    return(
        <>
            {/* O FORM PRINCIPAL AGORA ENVOLVE TODOS OS DROPDOWNS E TEM O onSubmit */}
            <form onSubmit={handleOverallSubmit}>
                {/* Passa os estados e handlers para o DropDownCampeonato */}
                <DropDownCampeonato
                    nomeCampeonato={nomeCampeonato} // Passando a variável de estado 'nomeCampeonato'
                    anoCampeonato={anoCampeonato} // CORRIGIDO: Passando a variável de estado 'anoCampeonato' como prop 'anoCampeonato'
                    onNomeChange={(e) => setNomeCampeonato(e.target.value)} // Atualizando o estado 'nomeCampeonato'
                    onAnoChange={(e) => setAnoCampeonato(e.target.value)} // CORRIGIDO: Atualizando o estado 'anoCampeonato'
                />
                {/* Os outros dropdowns ainda não estão conectados aos estados aqui,
                    mas você pode adicioná-los da mesma forma que o campeonato. */}
                <DropDownTimes/>
                <DropDownJogos/>

                <div className="create-button">
                    {/* Este é o botão de submissão geral para todos os formulários */}
                    <button type="submit" disabled={loading}>
                        {loading ? 'Criando...' : 'Criar'}
                    </button>
                </div>
            </form>

            {/* Mensagens de feedback gerais para o FormCreate */}
            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
        </>
    );
}

export default FormCreate;
