// utils/formatMessageTime.js
import moment from 'moment';
import 'moment/locale/pt-br';

// Configura locale global
moment.locale('pt-br');

/**
 * Formata o tempo de uma mensagem como no WhatsApp
 * @param {string|Date} date - Data da mensagem
 * @param {Object} options - { showSeconds: false }
 * @returns {string} - "Agora", "5 min", "Ontem", "14:30", "15/03", "15/03/2024"
 */
export const formatMessageTime = (date, currentTime) => {

    const msgTime = moment(date);
    if (!msgTime.isValid()) return '—';

    // Se currentTime for timestamp, converte para moment
    const now = typeof currentTime === 'number'
        ? moment(currentTime)
        : moment(currentTime);

    const diffMinutes = now.diff(msgTime, 'minutes');

    // === AGORA / MINUTOS ATRÁS ===
    if (diffMinutes < 1) return 'Agora';
    if (diffMinutes < 60) return `${diffMinutes} min`;

    // === HOJE ===
    if (msgTime.isSame(now, 'day')) {
        return msgTime.format('HH:mm');
    }

    // === ONTEM ===
    if (msgTime.isSame(now.clone().subtract(1, 'day'), 'day')) {
        return 'Ontem';
    }

    // === ESTA SEMANA (até 6 dias) ===
    if (diffMinutes < 7 * 24 * 60) {
        return msgTime.format('dddd'); // Segunda, Terça...
    }

    // === ESTE ANO ===
    if (msgTime.isSame(now, 'year')) {
        return msgTime.format('DD/MM'); // 15/03
    }

    // === ANOS ANTERIORES ===
    return msgTime.format('DD/MM/YYYY'); // 15/03/2024
};