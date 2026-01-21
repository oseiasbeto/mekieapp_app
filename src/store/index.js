import { createStore } from 'vuex'
import modules from "./modules";
import { logger } from '@/utils/logger';

export default createStore({
    modules,
    state: {
        networkStatus: 'online'
    },
    mutations: {
        SET_NETWORK_STATUS(state, payload) {
            state.networkStatus = payload
        },
    },
    actions: {
        async reconnect({ commit }) {
            try {
               logger.log("bufferizando tudo...")
            } catch (err) {
                logger.error("Failed to mark as read message: ", err);
                throw err;
            }
        },
    },
    getters: {
        networkStatus: (state) => state.networkStatus
    }
})