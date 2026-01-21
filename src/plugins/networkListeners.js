// useNetwork.js
import store from "@/store"
import { logger } from "@/utils/logger";

// Função para configurar os listeners de rede
const setupNetworkListeners = () => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
};

// Funções de manipulador de eventos
const handleOnline = () => {
    logger.log('Rede online detectada');
    store.commit("SET_NETWORK_STATUS", 'online');
    store.dispatch('reconnect');
};

// Manipulador para evento offline
const handleOffline = () => {
    logger.log('Rede offline detectada');
    store.commit("SET_NETWORK_STATUS", 'offline')
};

// Função para remover os listeners de rede
const removeNetworkListeners = () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
};

// Exporta as funções para uso em outros módulos
export { setupNetworkListeners, removeNetworkListeners }