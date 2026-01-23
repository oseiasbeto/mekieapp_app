import { logger } from '@/utils/logger';
import { io } from 'socket.io-client';

const node_env = process.env.NODE_ENV === 'production' ? 'prod' : 'dev';

const SOCKET_URL = node_env === 'dev' ?
    'http://localhost:5050' : node_env == 'prod' ?
    'https://mekieappapi-production.up.railway.app/' :
    'http://192.168.0.227:5050'

let socket;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
const RECONNECT_INTERVAL = 2000;
let reconnectTimeoutId = null;
let isManualDisconnect = false;
let authToken = null;

/**
 * Conecta ao WebSocket do servidor
 * @param {string} token - Token de autenticação do usuário.
 * @returns {Socket} - Instância do socket.
 */
export function connectSocket(token) {
    if (isManualDisconnect) {
        isManualDisconnect = false;
    }

    authToken = token;

    if (socket?.connected) {
        logger.log('WebSocket já conectado:', socket.id);
        return socket;
    }

    logger.log('Tentando conectar ao WebSocket');

    // Limpa tentativas anteriores de reconexão
    if (reconnectTimeoutId) {
        clearTimeout(reconnectTimeoutId);
        reconnectTimeoutId = null;
    }

    socket = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true,
        reconnection: false,
    });

    socket.on('connect', () => {
        logger.log('Conectado ao WebSocket:', socket.id);
        reconnectAttempts = 0;
    });

    socket.on('connect_error', (error) => {
        logger.error('Erro na conexão WebSocket:', error.message);
        scheduleReconnection();
    });

    socket.on('disconnect', (reason) => {
        logger.log('Desconectado do WebSocket. Razão:', reason);

        // Se não foi uma desconexão manual, tenta reconectar
        if (!isManualDisconnect && reason !== 'io client disconnect') {
            scheduleReconnection();
        }
    });
    return socket;
}

/**
 * Agenda uma tentativa de reconexão
 */
function scheduleReconnection() {
    if (isManualDisconnect || !authToken) {
        return;
    }

    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
        logger.error('Número máximo de tentativas de reconexão atingido');
        return;
    }

    reconnectAttempts++;
    const delay = RECONNECT_INTERVAL * Math.pow(2, reconnectAttempts - 1);

    logger.log(`Tentativa de reconexão ${reconnectAttempts} em ${delay}ms`);

    reconnectTimeoutId = setTimeout(() => {
        if (!isManualDisconnect && authToken) {
            logger.log('Executando reconexão...');
            connectSocket(authToken);
        }
    }, delay);
}


/**
 * Retorna a instância atual do socket, se existir.
 * @returns {Socket|null} - Instância do socket ou null se não conectado.
 */
export function getSocket() {
    return socket;
}

/**
 * Verifica se o socket está conectado
 * @returns {boolean} - true se conectado
 */
export function isSocketConnected() {
    return socket?.connected || false;
}

/**
 * Desconecta do WebSocket.
 */
export function disconnectSocket() {
    if (socket) {
        logger.log('Desconectando socket...');
        isManualDisconnect = true;

        // Limpa timeouts e handlers
        if (reconnectTimeoutId) {
            clearTimeout(reconnectTimeoutId);
            reconnectTimeoutId = null;
        }
        
        socket.disconnect();
        socket = null;
        authToken = null;
        reconnectAttempts = 0;
    }
}