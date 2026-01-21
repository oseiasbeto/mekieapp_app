import { logger } from '@/utils/logger';
import api from '../../api'

export default {
    state: {
        conversations: [],
        conversation: {},
        messages: []
    },
    mutations: {
        SET_CONVERSATION(state, conversation) {
            state.conversation = {
                ...conversation,
                scrollTop: 0
            }
        },

        LOAD_CONVERSATIONS(state, newModule) {
            const modules = state.conversations
            const source = newModule?.source || 'active'

            const index = modules.findIndex(m => m?.source === source)

            if (index === -1) {
                modules.push(newModule)
            } else {
                const conversations = modules[index].items || []
                const items = newModule?.items || []

                const uniqueItems = items.filter(
                    (conv) =>
                        !conversations.some(
                            (existingConv) => existingConv._id === conv._id
                        )
                );

                state.conversations[index].items = [
                    ...conversations,
                    ...uniqueItems
                ]

                state.conversations[index].pagination = newModule.pagination
            }
        },

        LOAD_MESSAGES(state, newModule) {
            const modules = state.messages
            const byId = newModule?.byId || null

            const index = modules.findIndex(m => m.byId === byId)

            if (index === -1) {
                modules.push(newModule)
            } else {
                const module = modules[index]
                const messages = module.items

                // Filtra os novos posts para remover quaisquer que já existam no cache
                const uniqueItems = newModule.items.filter(
                    (msg) =>
                        !messages.some(
                            (existingMsg) => existingMsg._id === msg._id
                        )
                );

                module.items.unshift(...uniqueItems)
                module.pagination = newModule.pagination
            }
        },

        UPDATE_SCROLLTOP_ON_CONVERSATION(state, { value, source }) {
            if (!source || !value) return

            const convModules = state.conversations
            const convIndex = convModules.findIndex(m => m.source === source)

            if (convIndex === -1) return

            const conversations = state.conversations[convIndex]

            if (!conversations?.items?.length) return
            conversations.scrollTop = value
        },

        UPDATE_TYPING_ON_CONVERSATION(state, { convId, source, payload }) {
            if (!convId || !source) return

            const convModules = state.conversations
            const convIndex = convModules.findIndex(m => m.source === source)

            if (convIndex !== -1) {
                const items = state.conversations[convIndex].items

                if (!items.length) return

                const itemIndex = items.findIndex(conv => conv._id === convId)

                if (itemIndex !== -1) {
                    items[itemIndex].is_typing = payload
                }
            }

            const conv = state.conversation
            if (conv && conv._id === convId) {
                conv.is_typing = payload
            }
        },

        UPDATE_MESSAGE(state, { byId, msgId, payload }) {
            if (!byId || !msgId || !payload) return

            const modules = state.messages
            const index = modules.findIndex(m => m.byId === byId)

            if (index !== -1) {
                const module = modules[index]
                const messages = module.items

                const indexMessage = messages.findIndex((m) => m._id == msgId)

                if (indexMessage !== -1) {
                    messages[indexMessage] = payload
                }
            }
        },

        UPDATE_CONVERSATION_ON_MESSAGE(state, { convId, newMessage, source, content, isInc = false, updateAt }) {
            if (!convId || !newMessage || !source || !content) return

            const convModules = state.conversations
            const convIndex = convModules.findIndex(m => m.source === source)

            if (convIndex === -1) return

            const conversations = state.conversations[convIndex].items
            const index = conversations.findIndex(conv => conv._id === convId)

            if (index !== -1) {
                const conversation = conversations[index]
                if (index !== 0) {
                    conversations.splice(index, 1);
                    conversations.unshift(conversation);
                }

                conversation.last_message.content = content
                conversation.last_message.created_at = updateAt

                if (isInc) {
                    conversation.unread_count += 1
                }

                const modules = state.messages
                const indexMessage = modules.findIndex(m => m.byId === convId)

                if (indexMessage !== -1) {
                    const module = modules[indexMessage]

                    if (!module) return

                    const messages = module.items
                    const pagination = module.pagination

                    const existingMessageIndex = messages.findIndex(m => m?._id === newMessage?._id)

                    if (existingMessageIndex === -1) {
                        messages.push(newMessage)

                        const total = pagination.total;
                        const limit = pagination.limit || 10;

                        pagination.total = total + 1;
                        pagination.totalPages = Math.ceil(total / limit);
                    } return
                }

                // ordena por última mensagem (igual Telegram)
                conversations.sort((a, b) => {
                    const timeA = new Date(a.last_message?.created_at || a.createdAt)
                    const timeB = new Date(b.last_message?.created_at || b.createdAt)
                    return timeB - timeA
                })
            }
        },

        ADD_OR_UPDATE_CONVERSATION(state, { conversation, source, userId, senderId }) {
            if (!userId || !senderId) return

            if (source) {
                const convModules = state.conversations

                const convIndex = convModules.findIndex(m => m.source === source)

                if (convIndex === -1) return

                const updatedConv = conversation; // pode estar incompleto!
                const items = state.conversations[convIndex].items;

                // Verifica se a conversa já existe
                const index = items.findIndex(c => c._id === updatedConv._id);

                // Se existir, atualiza; se não, adiciona
                if (index !== -1) {
                    // Atualiza apenas os campos que vieram (merge)
                    state.conversations[convIndex].items[index] = {
                        ...state.conversations[convIndex].items[index], // mantém tudo que já tinha
                        last_message: updatedConv.last_message,                       // sobrescreve só o que veio novo
                        unread_count: userId === senderId ? 0 : state.conversations[convIndex].items[index].unread_count + 1,
                        // Garante que campos importantes não sumam:
                        _id: updatedConv._id || state.conversations[convIndex].items[index]._id,
                        read_by: []
                    };

                    const currentConversation = state.conversation
                    if (currentConversation?._id) {
                        state.conversation.read_by = []
                    }

                    // Move para o topo
                    const [conversation] = state.conversations[convIndex].items.splice(index, 1);
                    state.conversations[convIndex].items.unshift(conversation);
                } else {
                    // Nova conversa → adiciona no topo
                    state.conversations[convIndex].items.unshift({
                        ...updatedConv,
                        unread_count: userId !== senderId ? 1 : 0
                    });
                }
            }
        },

        MARK_AS_READ_CONVERSATION(state, { user, read_at, source, convId }) {
            const convModules = state.conversations

            const convIndex = convModules.findIndex(m => m.source === source)

            if (convIndex !== -1) {
                const items = state.conversations[convIndex].items;

                // Verifica se a conversa já existe
                const index = items.findIndex(c => c._id === convId);

                // Se existir, atualiza; se não, adiciona
                if (index !== -1) {
                    const userAsReadedIndex = items[index].read_by.findIndex(i => i?.user?._id.toString() === user?._id.toString())

                    if (userAsReadedIndex === -1) {
                        state.conversations[convIndex].items[index].read_by.push({
                            user,
                            read_at
                        })
                    }
                }
            }

            const currentConversation = state.conversation

            if (currentConversation?._id) {

                currentConversation.read_by.push({
                    user,
                    read_at
                })
            }

            logger.log("Conversa marcada como lida: ", convId)
        },

        UPDATE_UNREAD_COUNT_ON_CONVERSATION(state, { convId, source, count }) {
            if (!convId) return

            const convModules = state.conversations
            const convIndex = convModules.findIndex(m => m.source === source)

            if (convIndex !== -1) {
                const conversations = state.conversations[convIndex].items

                if (conversations.length) {
                    const index = conversations.findIndex(conv => conv._id === convId)

                    if (index !== -1) {
                        conversations[index].unread_count = count
                    }
                }
            }

            if (state.conversation?._id && state.conversation?._id === convId) {
                state.conversation.read_by = []
            }
        },

        TOGGLE_ARCHIVE_CONVERSATION(state, { convId, source, userId }) {
            const convModules = state.conversations

            const convIndex = convModules.findIndex(m => m.source === source)

            if (convIndex === -1) return

            const items = state.conversations[convIndex].items;

            // Verifica se a conversa já existe
            const index = items.findIndex(c => c._id === convId)
            if (index !== -1) {
                const conv = items[index]

                const userAsArchivedIndex = conv.archived_by.findIndex(u => u.toString() === userId.toString())

                if (userAsArchivedIndex !== -1) {
                    conv.archived_by.splice(userAsArchivedIndex, 1)
                    state.conversations[convIndex].items.splice(index, 1)

                    const indexActiveModule = state.conversations.findIndex(m => m.source === 'active')
                    if (indexActiveModule !== -1) {
                        state.conversations[indexActiveModule].items.push(conv)

                        state.conversations[indexActiveModule].items.sort((a, b) => {
                            const timeA = new Date(a.last_message?.created_at || a.createdAt)
                            const timeB = new Date(b.last_message?.created_at || b.createdAt)
                            return timeB - timeA
                        })
                    }
                } else {
                    conv.archived_by.push(userId)
                    const indexArchivedModule = state.conversations.findIndex(m => m.source === 'archived')

                    if (indexArchivedModule !== -1) {
                        state.conversations[indexArchivedModule].items.push(conv)
                        state.conversations[indexArchivedModule].items.sort((a, b) => {
                            const timeA = new Date(a.last_message?.created_at || a.createdAt)
                            const timeB = new Date(b.last_message?.created_at || b.createdAt)
                            return timeB - timeA
                        })
                    }


                    state.conversations[convIndex].items.splice(index, 1)
                }
            }
        },

        UPDATE_STATUS_NETWORK_CONVERSATION(state, { userId, payload }) {
            const convModules = state.conversations
            let convIndex = -1

            const findIndexFromActiveChats = convModules.findIndex(m => m.source === 'active')
            const findIndexFromArchivedChats = convModules.findIndex(m => m.source === 'archived')

            if (findIndexFromArchivedChats !== -1) {
                convIndex = findIndexFromArchivedChats
            } else if (findIndexFromActiveChats !== -1) {
                convIndex = findIndexFromActiveChats
            }

            if (convIndex !== -1) {
                const items = state.conversations[convIndex]?.items;

                // Verifica se a conversa já existe
                const index = items.findIndex(c => c?.type === 'direct' && c?.xyz_id === userId);

                if (index !== -1) {
                    state.conversations[convIndex].items[index].is_online = payload
                    state.conversations[convIndex].items[index].last_seen = new Date()
                } else return
            }

            if (state.conversation?._id && state.conversation?.xyz_id == userId) {
                state.conversation.is_online = payload
                state.conversation.last_seen = new Date()
            }
        },

        ADD_MESSAGE_REALTIME(state, { convId, source, message }) {
            const module = state.messages.find(m => m.byId === convId)

            if (!module) return

            const messages = module.items
            const pagination = module.pagination

            const existingMessageIndex = messages.findIndex(m => m?._id === message?._id)

            if (existingMessageIndex === -1) {
                messages.push(message)

                const total = pagination.total;
                const limit = pagination.limit || 10;

                pagination.total = total + 1;
                pagination.totalPages = Math.ceil(total / limit);
            } else return

            // atualiza last_message da conversa na sidebar
            const convModules = state.conversations

            const convIndex = convModules.findIndex(m => m.source === source)

            if (convIndex !== -1) {
                const conversations = state.conversations[convIndex].items

                const conv = conversations.find(c => c._id === convId)
                if (conv) {
                    conv.last_message = {
                        _id: message._id,
                        sender: message.sender,
                        content: message.content || '[Mídia]',
                        message_type: message.message_type,
                        created_at: message.created_at
                    }
                }
            }
        },

        RESET_MESSAGES(state) {
            const modules = state.messages
            const byId = newModule?._id || null

            const index = modules.findIndex(m => m.byId === byId)

            if (index !== -1) {
                modules[index].items = []
            } else return
        },

        RESET_ALL_MESSAGES(state) {
            state.messages = []
        },

        RESET_CONVERSATION(state) {
            state.conversation = {}
        },

        DELETE_MESSAGE_FOR_ME(state, { convId, source, msgId, userId }) {
            if (!convId || !msgId) return

            const modules = state.messages
            const index = modules.findIndex(m => m.byId === convId)

            if (index !== -1) {
                const module = modules[index]
                const messages = module.items

                const indexMessage = messages.findIndex((m) => m._id == msgId)

                if (indexMessage !== -1) {
                    if (!messages[indexMessage].deleted_for?.includes(userId)) {
                        messages[indexMessage].deleted_for.push(userId)

                        logger.log("mensagem apagada para mim: ", messages[indexMessage])
                    }
                }
            }
        },

        DELETE_MESSAGE(state, { convId, source, msgId }) {
            if (!convId || !msgId) return

            const modules = state.messages
            const index = modules.findIndex(m => m.byId === convId)

            if (index !== -1) {
                const module = modules[index]
                const messages = module.items
                const indexMessage = messages.findIndex((m) => m._id == msgId)

                if (indexMessage !== -1) {
                    messages[indexMessage].status = 'is_deleted'
                }
            }

            const convModules = state.conversations
            const convIndex = convModules.findIndex(m => m.source === source)

            if (convIndex !== -1) {
                const convItemIndex = state.conversations[convIndex].items.findIndex(c => c._id === convId)

                if (convItemIndex !== -1) {
                    const previewText = 'Eliminou uma mensagem'
                    const typeMessage = 'deleted_message'
                    const now = new Date()

                    state.conversations[convIndex].items[convItemIndex].unread_count = 0
                    state.conversations[convIndex].items[convItemIndex].read_by = []
                    state.conversations[convIndex].items[convItemIndex].message_type = typeMessage
                    state.conversations[convIndex].items[convItemIndex].last_message.content = previewText
                    state.conversations[convIndex].items[convItemIndex].last_message.created_at = now
                    state.conversations[convIndex].items[convItemIndex].last_message.msgId = msgId || null

                    if (convItemIndex !== 0) {
                        const conversation = state.conversations[convIndex].items[convItemIndex]
                        state.conversations[convIndex].items.splice(convItemIndex, 1);
                        state.conversations[convIndex].items.unshift(conversation);
                    }

                    if (state.conversation?._id && state.conversation?._id == convId) {
                        state.conversation.read_by = []
                    }
                }
            }

            logger.log("mensagem apagada para todos: ", msgId)
        },

        REACT_MESSAGE(state, { convId, msgId, source, emoji, core, sender, isFromMe = true }) {
            if (!convId || !msgId || !emoji || !sender?._id) return

            const modules = state.messages
            const index = modules.findIndex(m => m.byId === convId)

            if (index !== -1) {
                const module = modules[index]
                const messages = module.items

                const indexMessage = messages.findIndex((m) => m._id == msgId)

                if (indexMessage !== -1) {
                    const message = messages[indexMessage]

                    const existingReactionIndex = message.reactions.findIndex(r => r.user?._id.toString() === sender?._id.toString() && r.emoji === emoji)

                    if (existingReactionIndex !== -1) {
                        message.reactions.splice(existingReactionIndex, 1)

                        logger.log(`reação ${emoji} removida da mensagen: `, message)
                    } else {
                        const existingReaction = message.reactions.find(r => r.user?._id.toString() == sender?._id.toString())

                        if (existingReaction) {
                            existingReaction.emoji = emoji
                            logger.log(`mensagem reagida com ${emoji}: `, message)
                        } else {
                            message.reactions.push({ user: sender, emoji })
                            logger.log(`mensagem reagida com ${emoji}: `, message)
                        }
                    }
                }
            }

            const convModules = state.conversations
            const convIndex = convModules.findIndex(m => m.source === source)

            if (convIndex === -1) return

            const convItemindex = convModules[convIndex].items.findIndex(c => c._id === convId)

            if (convItemindex !== -1) {
                const now = new Date()

                if (core === 'push') {
                    if (!isFromMe) {
                        const unreadCount = state.conversations[convIndex].items[convItemindex].unread_count
                        state.conversations[convIndex].items[convItemindex].unread_count = unreadCount + 1
                    }
                    state.conversations[convIndex].items[convItemindex].last_message.message_type = 'reaction_message'
                } else if (core === 'remove') {
                    if (!isFromMe) {
                        const unreadCount = state.conversations[convIndex].items[convItemindex].unread_count
                        state.conversations[convIndex].items[convItemindex].unread_count = unreadCount > 0 ? unreadCount - 1 : 0
                    }
                    state.conversations[convIndex].items[convItemindex].last_message.message_type = 'text'
                }

                state.conversations[convIndex].items[convItemindex].read_by = []
                state.conversations[convIndex].items[convItemindex].last_message.sender = sender
                state.conversations[convIndex].items[convItemindex].last_message.reaction = emoji
                state.conversations[convIndex].items[convItemindex].last_message.created_at = now
                state.conversations[convIndex].items[convItemindex].last_message.msgId = msgId || null

                if (convItemindex !== 0) {
                    const conversation = state.conversations[convIndex].items[convItemindex]
                    state.conversations[convIndex].items.splice(convItemindex, 1);
                    state.conversations[convIndex].items.unshift(conversation);
                }

                if (state.conversation?._id && state.conversation?._id == convId) {
                    state.conversation.read_by = []
                }
            }
        },
    },
    actions: {
        // Função para obter conversas
        async loadConversations({ commit }, { page = 1, limit = 10, loadMore = false, total = 0, status = 'active' }) {
            try {
                // Requisição para obter conversas
                const response = await api.get('/conversations',
                    {
                        params: {
                            page,
                            limit,
                            total: loadMore ? total : undefined,
                            status
                        }
                    }
                );

                // Dados da resposta
                const data = response.data;

                // Itens de conversas
                const items = data.conversations || [];

                // Configuração de paginação
                const pagination = {
                    page: data.page, // Página atual
                    total: data.total, // Total de itens
                    totalPages: data.totalPages, // Total de páginas
                    hasMore: data.hasMore // Novo campo indicando se há mais páginas    
                };

                const newModule = {
                    source: status,
                    pagination,
                    items
                }

                // Atualiza o store com as conversas
                commit("LOAD_CONVERSATIONS", newModule);

                return items
            } catch (err) {
                // Log de erro
                logger.error("Failed to fetch conversations:", err);
                throw err;
            }
        },

        async loadMessages({ commit }, { page = 1, limit = 10, convId, loadMore = false, total = 0 }) {
            try {
                const response = await api.get(`/messages/${convId}`,
                    {
                        params: {
                            page,
                            limit,
                            total: loadMore ? total : undefined
                        }
                    }
                );

                const data = response.data;

                const items = data.messages || [];
                const byId = convId

                const pagination = {
                    page: data.page, // Página atual
                    total: data.total, // Total de itens
                    totalPages: data.totalPages, // Total de páginas
                    hasMore: data.hasMore // Novo campo indicando se há mais páginas    
                }

                const newModule = {
                    byId,
                    items,
                    pagination
                }

                commit("LOAD_MESSAGES", newModule)
            } catch (err) {
                // Log de erro
                logger.error("Failed to fetch messages:", err);
                throw err;
            }
        },

        // Função para enviar mensagem
        async sendMessage({ commit }, { convId, tempId, source, replyToId, content }) {
            try {
                const response = await api.post("/messages/new-message", {
                    convId,
                    content,
                    ...(replyToId && {
                        reply_to: replyToId
                    }),
                    source
                });

                const newMessage = response.data.data;

                if (tempId) {
                    // Atualiza conversa na sidebar
                    commit("UPDATE_MESSAGE", {
                        byId: newMessage?.conversation?._id,
                        msgId: tempId,
                        source,
                        payload: newMessage
                    })
                }
            } catch (err) {
                logger.error("Failed to send message:", err);
                throw err;
            }
        },

        async openDirectMessage({ commit }, userId) {
            try {
                const res = await api.post('/conversations/direct', { userId })
                const { conversation } = res.data

                commit('SET_CONVERSATION', conversation)

                return conversation
            } catch (err) {
                logger.error("Failed to open direct message:", err);
                throw err;
            }
        },

        async getConversation({ commit }, convId) {
            try {
                const res = await api.get(`/conversations/${convId}`)
                const { conversation } = res.data

                commit('SET_CONVERSATION', conversation)

                return conversation
            } catch (err) {
                logger.error("Failed to get conversation by id:", err);
                throw err;
            }
        },

        // Marcar como lido
        async markAsRead({ commit }, { convId, source }) {
            try {
                await api.post(`/conversations/${convId}/mark-as-read`, {
                    source: source
                })
                commit('UPDATE_UNREAD_COUNT_ON_CONVERSATION', { convId, source, count: 0 })
            } catch (err) {
                logger.error("Failed to mark as read message: ", err);
                throw err;
            }
        },

        async deleteMessageForMe({ commit }, { convId, msgId, userId }) {
            try {
                await api.delete(`/messages/for-me/${msgId}`)
                commit('DELETE_MESSAGE_FOR_ME', { convId, msgId, userId })
            } catch (err) {
                logger.error("Failed to delete message for me: ", err);
                throw err;
            }
        },

        async deleteMessage({ commit }, { convId, source, msgId }) {
            try {
                await api.delete(`/messages/${msgId}`)
                commit('DELETE_MESSAGE', { convId, source, msgId })
            } catch (err) {
                logger.error("Failed to delete message: ", err);
                throw err;
            }
        },

        async reactMessage({ commit }, { convId, msgId, source, emoji, sender }) {
            try {
                const response = await api.put(`/messages/react/${msgId}`, {
                    emoji,
                    source
                })

                const { core } = response?.data

                commit("REACT_MESSAGE", { convId, msgId, emoji, source, sender, core })
            } catch (err) {
                logger.error("Falha ao reagir a messagem  :", err);
                throw err;
            }
        },

        async toggleArchiveConversation({ commit }, { convId, source, userId }) {
            try {
                await api.put(`/conversations/${convId}/archive`)
                commit('TOGGLE_ARCHIVE_CONVERSATION', { convId, source, userId })
            } catch (err) {
                logger.error("Falha ao arquivar/desarquivar a conversa  :", err);
                throw err;
            }
        },
    },
    getters: {
        conversations: (state) => state.conversations,
        messages: (state) => state.messages,
        currentConversation: (state) => state.conversation,
    }
}