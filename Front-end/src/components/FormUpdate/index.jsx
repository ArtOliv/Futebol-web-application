// src/components/FormUpdate/index.jsx
import React, { useState, useEffect } from 'react';
import './styles.css';


import {postGol } from '../../services/golService'; 
import { postCartao } from '../../services/cartaoService'; 

// Importa SOMENTE os componentes de dropdown que FormUpdate REALMENTE USA/RENDERIZA
// Os DropdownDelete* pertencem ao FormDelete.
import DropDownUpdateTimes from './DropdownUpdateTimes';
import DropDownUpdateJogos from './DropdownUpdateJogos';


function FormUpdate() {
    // --- ESTADOS GERAIS PARA ATUALIZAÇÃO (para DropDownUpdateTimes e DropDownUpdateJogos) ---
    const [idTimeUpdate, setIdTimeUpdate] = useState(''); 
    const [idPartidaUpdate, setIdPartidaUpdate] = useState(''); 

    // --- ESTADOS PARA FEEDBACK GERAL DO FORMULÁRIO ---
    const [message, setMessage] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    // --- Funções de manipulação de filtros (para passar aos componentes filhos se necessário) ---
    const handleIdTimeUpdateChange = (e) => setIdTimeUpdate(e.target.value);
    const handleIdPartidaUpdateChange = (e) => setIdPartidaUpdate(e.target.value);


    // --- Função principal para submeter as atualizações (chamada por DropDownUpdateJogos) ---
    const handleOverallUpdateSubmit = async (gameData, adicionarGol, adicionarCartao, tipoCartao) => {
        setLoading(true);
        setMessage('');
        setError(null);
        let operationMessages = [];

        try {
            // Lógica para Adicionar Gol
            if (adicionarGol) {
                const golData = {
                    id_jogo: gameData.id_partida,
                    id_jogador: gameData.id_jogador,
                    n_minuto_gol: gameData.minuto,
                    // Garanta que o modelo GolCreate no backend tem os campos esperados
                    // Ex: nome_campeonato, ano_campeonato se for chave composta para o jogo
                    // Você pode precisar adicionar nome_campeonato: matchData.c_nome_campeonato e ano_campeonato: matchData.d_ano_campeonato aqui
                    // ou passá-los de outra forma se o backend precisar.
                };
                try {
                    const response = await postGol(golData);
                    operationMessages.push(`Gol: ${response}`);
                } catch (err) {
                    operationMessages.push(`Erro ao adicionar Gol: ${err.message}`);
                    setError(prev => (prev ? prev + '\n' : '') + `Erro Gol: ${err.message}`);
                }
            }

            // Lógica para Adicionar Cartão
            if (adicionarCartao) {
                const cartaoData = {
                    id_jogo: gameData.id_partida,
                    id_jogador: gameData.id_jogador,
                    n_minuto_cartao: gameData.minuto,
                    c_tipo_cartao: tipoCartao,
                    // Garanta que o modelo CartaoCreate no backend tem os campos esperados
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
                {/* O botão "Atualizar" aqui pode ser removido, pois as submissões agora ocorrem nos componentes DropDownUpdateTimes/Jogos */}
                {/* Ou mantido se houver uma lógica de "atualização geral" que inclua ambos os DropDowns */}
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