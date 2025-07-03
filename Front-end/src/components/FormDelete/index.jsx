import React, { useState } from 'react'; 
import './styles.css'; 

// Importa as funções de serviço para deletar diferentes entidades
import { deleteCampeonato } from '../../services/campeonatoService'; 
import { deleteTime } from '../../services/timeService'; 
import { deleteJogador } from '../../services/jogadorService'; 
import { deletePartida } from '../../services/jogoService'
import { deleteGol } from '../../services/golService'
import { deleteCartao } from '../../services/cartaoService'

// Importa os componentes DropDown de deleção para cada entidade
import DropDownDeleteCampeonato from './DropdownDeleteCampeonato'; 
import DropdownDeleteTimes from './DropdownDeleteTimes'; 
import DropdownDeleteJogador from './DropdownDeleteJogador';
import DropdownDeleteJogos from './DropdownDeleteJogos';
import DropdownDeleteGols from './DropdownDeleteGols';
import DropdownDeleteCartao from './DropdownDeleteCartao';



function FormDelete() {
    // --- ESTADOS PARA DELETAR CAMPEONATO ---
    const [nomeCampeonatoToDelete, setNomeCampeonatoToDelete] = useState('');
    const [anoCampeonatoToDelete, setAnoCampeonatoToDelete] = useState('');

    // --- ESTADO PARA DELETAR TIME ---
    const [nomeTimeToDelete, setNomeTimeToDelete] = useState('');

    // --- ESTADO PARA DELETAR JOGADOR ---
    const [idJogadorToDelete, setIdJogadorToDelete] = useState(''); 

    // ESTADO PARA DELETAR PARTIDA
    const [idPartidaToDelete, setIdPartidaToDelete] = useState('');

    //ESTADO DELETAR GOLS
    const [idGolToDelete, setIdGolToDelete] = useState('');

    //ESTADO DELETAR CARTAO
    const [idCartaoToDelete, setIdCartaoToDelete] = useState('');

    // --- ESTADOS PARA FEEDBACK GERAL DO FORMULÁRIO ---
    const [message, setMessage] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);


    const handleOverallDelete = async (event) => {
        event.preventDefault(); 

        // --- INÍCIO DO DEBUG  ---
        console.log("--- handleOverallDelete INICIADO ---");
        console.log("Evento que disparou:", event.type); // Deve ser 'submit'
        if (event.submitter) {
            console.log("Botão que submeteu:", event.submitter.outerHTML); // Qual botão foi clicado (se houver)
        } else {
            console.log("Submissão sem botão específico (ex: Enter key).");
        }
        console.log("Nome Campeonato no momento da submissão:", nomeCampeonatoToDelete);
        console.log("Nome Time no momento da submissão:", nomeTimeToDelete);
        console.log("ID Jogador no momento da submissão:", idJogadorToDelete);
        console.log("ID Partida no momento da submissão:", idPartidaToDelete);
        console.log("ID Gol no momento da submissão:", idGolToDelete);
        console.log("ID Cartao no momento da submissão:", idCartaoToDelete);
        // --- FIM DO DEBUG CRÍTICO ---


        setMessage('');
        setError(null);
        setLoading(true);

        try {
            let operationMessages = []; 

            // --- Lógica para DELETAR CAMPEONATO ---
            // Verifica se os campos de campeonato estão preenchidos para esta operação
            if (nomeCampeonatoToDelete && anoCampeonatoToDelete) {
                console.log("Tentando deletar campeonato:", nomeCampeonatoToDelete, anoCampeonatoToDelete); // Log de depuração
                try {
                    // Chama a função de serviço para deletar o campeonato
                    const responseMessage = await deleteCampeonato(
                        nomeCampeonatoToDelete,
                        parseInt(anoCampeonatoToDelete) // Converte o ano para um número inteiro
                    );
                    operationMessages.push(`Campeonato: ${responseMessage}`); // Adiciona mensagem de sucesso
                    // Limpa os campos após a deleção bem-sucedida
                    setNomeCampeonatoToDelete('');
                    setAnoCampeonatoToDelete('');
                    console.log("Deleção de Campeonato SUCESSO:", responseMessage); // Log de depuração
                } catch (campErr) {
                    // Captura e acumula erros específicos da deleção de campeonato
                    operationMessages.push(`Erro ao deletar Campeonato: ${campErr.message}`);
                    console.error("Erro ao deletar Campeonato:", campErr); // Log de erro
                    setError(prev => (prev ? prev + '\n' : '') + `Erro Campeonato: ${campErr.message}`);
                }
            } 

            // --- Lógica para DELETAR TIME ---
            // Verifica se o campo de nome do time está preenchido para esta operação
            if (nomeTimeToDelete) {
                console.log("Tentando deletar time:", nomeTimeToDelete); // Log de depuração
                try {
                    // Chama a função de serviço para deletar o time
                    const responseMessage = await deleteTime(nomeTimeToDelete);
                    operationMessages.push(`Time: ${responseMessage}`); // Adiciona mensagem de sucesso
                    setNomeTimeToDelete(''); // Limpa o campo após o sucesso
                    console.log("Deleção de Time SUCESSO:", responseMessage); // Log de depuração
                } catch (timeErr) {
                    // Captura e acumula erros específicos da deleção de time
                    operationMessages.push(`Erro ao deletar Time: ${timeErr.message}`);
                    console.error("Erro ao deletar Time:", timeErr); // Log de erro
                    setError(prev => (prev ? prev + '\n' : '') + `Erro Time: ${timeErr.message}`);
                }
            }

            // --- Lógica para DELETAR JOGADOR ---
            // Verifica se o ID do jogador está preenchido e é um número válido
            if (idJogadorToDelete && !isNaN(parseInt(idJogadorToDelete))) { // Uso da variável idJogadorToDelete
                console.log("Tentando deletar jogador com ID:", idJogadorToDelete); // Log de depuração
                try {
                    // Chama a função de serviço para deletar o jogador
                    const responseMessage = await deleteJogador(parseInt(idJogadorToDelete)); // Converte o ID para número inteiro
                    operationMessages.push(`Jogador: ${responseMessage}`); // Adiciona mensagem de sucesso
                    setIdJogadorToDelete(''); // Limpa o campo após o sucesso
                    console.log("Deleção de Jogador SUCESSO:", responseMessage); // Log de depuração
                } catch (jogadorErr) {
                    // Captura e acumula erros específicos da deleção de jogador
                    operationMessages.push(`Erro ao deletar Jogador: ${jogadorErr.message}`);
                    console.error("Erro ao deletar Jogador:", jogadorErr); // Log de erro
                    setError(prev => (prev ? prev + '\n' : '') + `Erro Jogador: ${jogadorErr.message}`);
                }
            } else if (idJogadorToDelete) { // Se o campo foi preenchido mas não é um número válido
                operationMessages.push("ID do Jogador inválido. Por favor, insira um número.");
                setError(prev => (prev ? prev + '\n' : '') + `Erro Jogador: ID inválido.`);
            } 


            // --- Lógica para DELETAR PARTIDA ---
            // Verifica se o ID da partida está preenchido e é um número válido
            if (idPartidaToDelete && !isNaN(parseInt(idPartidaToDelete))) {
                console.log("Tentando deletar partida com ID:", idPartidaToDelete);
                try {
                    const responseMessage = await deletePartida(parseInt(idPartidaToDelete)); // Chama a função de serviço
                    operationMessages.push(`Partida: ${responseMessage}`);
                    setIdPartidaToDelete(''); // Limpa o campo
                    console.log("Deleção de Partida SUCESSO:", responseMessage);
                } catch (partidaErr) {
                    operationMessages.push(`Erro ao deletar Partida: ${partidaErr.message}`);
                    console.error("Erro ao deletar Partida:", partidaErr);
                    setError(prev => (prev ? prev + '\n' : '') + `Erro Partida: ID inválido.`);
                }
            } else if (idPartidaToDelete) {
                operationMessages.push("ID da Partida inválido. Por favor, insira um número.");
                setError(prev => (prev ? prev + '\n' : '') + `Erro Partida: ID inválido.`);
            }

            // --- Lógica para DELETAR Gol ---
            // Verifica se o ID da Gol está preenchido e é um número válido
            if (idGolToDelete && !isNaN(parseInt(idGolToDelete))) {
                console.log("Tentando deletar Gol com ID:", idGolToDelete);
                try {
                    const responseMessage = await deleteGol(parseInt(idGolToDelete)); // Chama a função de serviço
                    operationMessages.push(`Gol: ${responseMessage}`);
                    setIdGolToDelete(''); // Limpa o campo
                    console.log("Deleção de Gol SUCESSO:", responseMessage);
                } catch (GolErr) {
                    operationMessages.push(`Erro ao deletar Gol: ${GolErr.message}`);
                    console.error("Erro ao deletar Gol:", GolErr);
                    setError(prev => (prev ? prev + '\n' : '') + `Erro Gol: ID inválido.`);
                }
            } else if (idGolToDelete) {
                operationMessages.push("ID da Gol inválido. Por favor, insira um número.");
                setError(prev => (prev ? prev + '\n' : '') + `Erro Gol: ID inválido.`);
            }

            // --- Lógica para DELETAR Cartao ---
            // Verifica se o ID da Cartao está preenchido e é um número válido
            if (idCartaoToDelete && !isNaN(parseInt(idCartaoToDelete))) {
                console.log("Tentando deletar Cartao com ID:", idCartaoToDelete);
                try {
                    const responseMessage = await deleteCartao(parseInt(idCartaoToDelete)); // Chama a função de serviço
                    operationMessages.push(`Cartao: ${responseMessage}`);
                    setIdCartaoToDelete(''); // Limpa o campo
                    console.log("Deleção de Cartao SUCESSO:", responseMessage);
                } catch (CartaoErr) {
                    operationMessages.push(`Erro ao deletar Cartao: ${CartaoErr.message}`);
                    console.error("Erro ao deletar Cartao:", CartaoErr);
                    setError(prev => (prev ? prev + '\n' : '') + `Erro Cartao: ID inválido.`);
                }
            } else if (idCartaoToDelete) {
                operationMessages.push("ID da Cartao inválido. Por favor, insira um número.");
                setError(prev => (prev ? prev + '\n' : '') + `Erro Cartao: ID inválido.`);
            }


            // Exibe todas as mensagens acumuladas no estado 'message', unindo-as com quebras de linha
            if (operationMessages.length > 0) {
                setMessage(operationMessages.join('\n'));
            } else {
                setMessage("Nenhuma operação de deleção foi solicitada."); // Mensagem se nenhum campo foi preenchido
            }

        } catch (err) { // Este bloco captura erros inesperados que não foram tratados nos blocos try/catch internos
            console.error("Erro inesperado na submissão geral:", err); // Log de erro geral
            setError(err.message || "Ocorreu um erro inesperado durante a deleção.");
        } finally {
            setLoading(false); // Desativa o estado de carregamento, independentemente do resultado
        }
    };

    return (
        <>
            {/* O formulário principal que engloba todos os dropdowns de deleção */}
            <form onSubmit={handleOverallDelete}>
                {/* Componente para deletar Campeonato, recebendo seus estados e handlers */}
                <DropDownDeleteCampeonato
                    nomeCampeonato={nomeCampeonatoToDelete}
                    anoCampeonato={anoCampeonatoToDelete}
                    onNomeChange={(e) => setNomeCampeonatoToDelete(e.target.value)}
                    onAnoChange={(e) => setAnoCampeonatoToDelete(e.target.value)}
                />

                {/* Componente para deletar Time, recebendo seus estados e handlers */}
                <DropdownDeleteTimes
                    nomeTime={nomeTimeToDelete}
                    onNomeChange={(e) => setNomeTimeToDelete(e.target.value)}
                />
                
                {/* Componente para deletar Jogador, recebendo seus estados e handlers */}
                <DropdownDeleteJogador
                    idJogador={idJogadorToDelete}
                    onIdChange={(e) => setIdJogadorToDelete(e.target.value)}
                />

                {/* Componente deletar partida */}
                <DropdownDeleteJogos
                    idPartida={idJogadorToDelete}
                    onIdPartidaChange = {(e) => setIdPartidaToDelete(e.target.value)}

                />

                <DropdownDeleteGols
                    idGol={idGolToDelete}
                    onIdGolChange = {(e) => setIdGolToDelete(e.target.value)}
                
                />
                <DropdownDeleteCartao
                    idCartao={idCartaoToDelete}
                    onIdCartaoChange = {(e) => setIdCartaoToDelete(e.target.value)}
                
                />

                <div className="delete-button">
                    {/* Botão de submissão geral para todas as operações de deleção */}
                    <button type="submit" disabled={loading}>
                        {loading ? 'Deletando...' : 'Deletar'}
                    </button>
                </div>
            </form>

            {/* Exibe mensagens de sucesso/informação */}
            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
        </>
    );
}

export default FormDelete;
