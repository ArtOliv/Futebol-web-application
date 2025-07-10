// src/components/FormUpdate/index.jsx
import React, { useState, useEffect } from 'react';
import './styles.css';

import { postGol } from '../../services/golService';
import { postCartao } from '../../services/cartaoService';
// Importe a função PATCH correta, que agora se chama updatePartida
import { updatePartida } from '../../services/jogoService'; // Alterado de updatePartida para updatePartida

// Importa SOMENTE os componentes de dropdown que FormUpdate REALMENTE USA/RENDERIZA
import DropDownUpdateJogos from './DropdownUpdateJogos';


function FormUpdate() {
    const [idPartidaUpdate, setIdPartidaUpdate] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleIdPartidaUpdateChange = (e) => setIdPartidaUpdate(e.target.value);

    const handleOverallUpdateSubmit = async (gameData, actionType) => {
        setLoading(true);
        setMessage('');
        setError(null);
        let operationMessages = [];

        try {
            if (actionType === 'finalize_game') {
                try {
                    const dataToUpdate = {
                        c_status: "Finalizado",
                        // Opcional: Se o backend espera os placares, inclua-os aqui
                        // n_placar_casa: gameData.n_placar_casa,
                        // n_placar_visitante: gameData.n_placar_visitante,
                    };
                    // *** Usar updatePartida para enviar a atualização de status ***
                    const response = await updatePartida(gameData.id_partida, dataToUpdate);
                    operationMessages.push(`Partida finalizada: ${response.message || 'Sucesso!'}`); // Ajuste para 'response.message'
                    setMessage("Jogo finalizado com sucesso!");
                } catch (err) {
                    console.error("Erro ao finalizar jogo:", err);
                    operationMessages.push(`Erro ao finalizar jogo: ${err.message}`);
                    setError(prev => (prev ? prev + '\n' : '') + `Erro ao finalizar jogo: ${err.message}`);
                }
            } else if (actionType === 'add_action') {
                const { adicionarGol, adicionarCartao, tipoCartao } = gameData;

                if (adicionarGol) {
                    const golData = {
                        id_jogo: gameData.id_partida,
                        id_jogador: gameData.id_jogador,
                        n_minuto_gol: gameData.minuto,
                    };
                    try {
                        const response = await postGol(golData);
                        operationMessages.push(`Gol: ${response}`);
                    } catch (err) {
                        operationMessages.push(`Erro ao adicionar Gol: ${err.message}`);
                        setError(prev => (prev ? prev + '\n' : '') + `Erro Gol: ${err.message}`);
                    }
                }

                if (adicionarCartao) {
                    const cartaoData = {
                        id_jogo: gameData.id_partida,
                        id_jogador: gameData.id_jogador,
                        n_minuto_cartao: gameData.minuto,
                        c_tipo_cartao: tipoCartao,
                    };
                    try {
                        const response = await postCartao(cartaoData);
                        operationMessages.push(`Cartão: ${response}`);
                    } catch (err) {
                        operationMessages.push(`Erro ao adicionar Cartão: ${err.message}`);
                        setError(prev => (prev ? prev + '\n' : '') + `Erro Cartão: ${err.message}`);
                    }
                }
                if (operationMessages.length > 0) {
                    setMessage(operationMessages.join('\n'));
                } else {
                    setMessage("Nenhuma atualização ou ação solicitada.");
                }
            }
        } catch (err) {
            console.error("Erro inesperado na submissão da atualização:", err);
            setError(err.message || "Ocorreu um erro inesperado durante a atualização.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <DropDownUpdateJogos
                idPartidaUpdate={idPartidaUpdate}
                onIdPartidaUpdateChange={handleIdPartidaUpdateChange}
                onUpdateSubmit={handleOverallUpdateSubmit}
            />
            <div className="update-button">
                <button type="submit" disabled={loading}>
                    {loading ? 'Atualizando...' : 'Atualizar'}
                </button>
            </div>
            {message && <p className="success-message">{message}</p>}
            {error && <p className="error-message">{error}</p>}
        </>
    )
}

export default FormUpdate;