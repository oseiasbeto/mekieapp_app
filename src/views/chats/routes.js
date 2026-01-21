export default [
    {
        path: '/chats',
        name: 'Chats',
        meta: {
            requiresAuth: true,
            rootPage: 'chats',
            title: 'Conversas'
        },
        component: () => import('./views/ActiveChats.vue')
    },
    {
        path: '/chats/archived',
        name: 'Archived chats',
        meta: {
            requiresAuth: true,
            rootPage: 'chats',
            title: 'Conversas arquivadas'
        },
        component: () => import('./views/ArchivedChats.vue')
    },
     {
        path: '/chat/:chatId',
        name: 'Chat',
        meta: {
            requiresAuth: true,
            rootPage: 'chats',
            title: 'Detalhes da conversa'
        },
        component: () => import('./views/Chat.vue')
    },
     {
        path: '/messages/:convId',
        name: 'Messages',
        meta: {
            requiresAuth: true,
            rootPage: 'chats',
            title: 'Mensagens'
        },
        component: () => import('./views/Messages.vue')
    },
     {
        path: '/new-message',
        name: 'New Message',
        meta: {
            requiresAuth: true,
            rootPage: 'chats',
            title: 'Nova mensagem'
        },
        component: () => import('./views/NewMessage.vue')
    }
]