import { createClient } from '@supabase/supabase-js';

// Substitua as variáveis abaixo pelas credenciais do seu projeto Supabase
const SUPABASE_URL = 'https://zjphbjtjdvlouglunwet.supabase.co';

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqcGhianRqZHZsb3VnbHVud2V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MzcyMjUsImV4cCI6MjA5NzIxMzIyNX0.8WupvEj63DWtcXW0ju9XX_NcQkhxq3gHGOYXKo4UmbY';

// Inicializa o cliente do Supabase
const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Formata o tempo de segundos para MM:SS
function formatarTempo(segundos) {
    const min = Math.floor(segundos / 60);
    const seg = Math.floor(segundos % 60);
    
    if (min > 0) {
        return `${min}m ${seg}s`;
    }
    return `${seg}s`;
}

// Formata a data (YYYY-MM-DD para DD/MM/YYYY)
function formatarData(dataString) {
    const partes = dataString.split('-');
    if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return dataString;
}

// Função para buscar os dados e montar a tabela
async function carregarLeaderboard() {
    const tbody = document.getElementById('leaderboard-body');

    try {
        // Faz a query utilizando o índice que você criou:
        // Maior lixo reciclado primeiro (desc), menor tempo em caso de empate (asc)
        const { data: partidas, error } = await client
            .from('partidas')
            .select('*')
            .order('lixos_reciclados', { ascending: false })
            .order('tempo_total_segundos', { ascending: true })
            .limit(10); // Traz os Top 10

        if (error) {
            throw error;
        }

        // Limpa a mensagem de "Buscando..."
        tbody.innerHTML = '';

        if (partidas.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="loading">Nenhuma partida registrada ainda.</td></tr>';
            return;
        }

        // Popula a tabela com os dados
        partidas.forEach((partida, index) => {
            const tr = document.createElement('tr');
            
            // Define o estilo da medalha baseada na posição
            let classePosicao = '';
            let iconePosicao = `${index + 1}º`;
            if (index === 0) { classePosicao = 'posicao-1'; iconePosicao = '🥇 1º'; }
            if (index === 1) { classePosicao = 'posicao-2'; iconePosicao = '🥈 2º'; }
            if (index === 2) { classePosicao = 'posicao-3'; iconePosicao = '🥉 3º'; }

            tr.innerHTML = `
                <td class="${classePosicao}">${iconePosicao}</td>
                <td><strong>${partida.nome_jogador}</strong></td>
                <td>♻️ ${partida.lixos_reciclados}</td>
                <td>⏱️ ${formatarTempo(partida.tempo_total_segundos)}</td>
                <td>📅 ${formatarData(partida.data_partida)}</td>
            `;

            tbody.appendChild(tr);
        });

    } catch (error) {
        console.error("Erro ao buscar dados do Supabase:", error);
        tbody.innerHTML = '<tr><td colspan="5" class="loading">Erro ao carregar o ranking. Tente novamente mais tarde.</td></tr>';
    }
}

// Executa a função quando a página termina de carregar
document.addEventListener('DOMContentLoaded', carregarLeaderboard);