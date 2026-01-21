import api from '../../api'

import clearSessionIdFromCookies from "@/utils/clear-session-id-from-cookies"; // Remove o session_id dos cookies.
import setSessionIdFromCookies from "@/utils/set-session-id-from-cookies"; // Armazena o session_id nos cookies.

// Importa a função para conectar ao WebSocket (Socket.IO).
import { connectSocket, disconnectSocket } from "@/services/socket";
import { logger } from '@/utils/logger';

export default {
    state: {
        user: null,
        token: null,
        sessionId: null
    },
    mutations: {
        SET_AUTH(state, { user, access_token, session_id }) {
            state.user = user
            state.token = access_token
            state.sessionId = session_id

            setSessionIdFromCookies(session_id);

            // Conecta ao WebSocket e informa ao backend que o usuário está online.
            const socket = connectSocket(access_token);
            socket.emit("setUserOnline", user._id);
        },
        LOGOUT(state) {
            state.user = null
            state.token = null
            state.sessionId = null

            clearSessionIdFromCookies()
            disconnectSocket()
        },
        UPDATE_USER(state, payload) {
            state.user = payload
        }
    },
    actions: {
        async sendPhone({ commit }, phoneNumber) {
            try {
                api.post('/auth/register/phone', {
                    phone_number: phoneNumber
                })
            } catch (err) {
                logger.error("Erro ao enviar o OTP: " + err)
                throw err
            }
        },
        async verifyCode({ commit }, { phoneNumber, code }) {
            try {
                const response = await api.post('/auth/verify/code', {
                    phone_number: phoneNumber,
                    code
                })

                commit('SET_AUTH', {
                    user: response.data.user,
                    access_token: response.data.access_token,
                    session_id: response.data.session_id
                })
                return response.data
            } catch (err) {
                // IMPORTANTE: re-throw para o frontend receber no catch
                logger.error('Erro ao verificar código:', err.response?.data || err)
                throw err  // <-- isso faz o .catch no componente funcionar
            }
        },
        async refreshToken({ commit }, sessionId) {
            try {
                const res = await api.post("/auth/refresh-access-token", {
                    session_id: sessionId,
                });

                const user = res.data.user;
                const accessToken = res.data.access_token;

                commit('SET_AUTH', {
                    user,
                    access_token: accessToken,
                    session_id: sessionId
                })
                return res
            } catch (err) {
                if (err.response?.status === 401) {
                    // Se a resposta indicar que o token não é mais válido, limpa o session_id.
                    clearSessionIdFromCookies();
                    disconnectSocket();
                }
                logger.error(err.message);
                throw err;
            }
        },
        async completeProfile({ commit }, data) {
            try {
                const { name } = data
                const response = await api.put('/auth/complete-profile', {
                    name: name
                })

                const { user } = response.data

                commit("UPDATE_USER", user)

                return response.data
            } catch (err) {
                // IMPORTANTE: re-throw para o frontend receber no catch
                logger.error('Erro ao completar o perfil:', err.response?.data || err)
                throw err  // <-- isso faz o .catch no componente funcionar
            }
        }
    },
    getters: {
        accessToken: (state) => state.token,
        currentUser: (state) => state.user,
    }
}