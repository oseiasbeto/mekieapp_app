<template>
    <div class="relative">
        <div class="sticky w-full bg-background-primary z-10 top-0">
            <Navbar @go-back="router.back" title="Arquivadas" />
        </div>

        <div class="h-[52px]"></div>

        <VirtualChatList ref="virtualChatListComponent" :conversations="conversations?.items || []"
            :loading="loadingConversations" :loading-more="loadingMoreConversations" :user-id="user?._id"
            :has-more="conversations?.pagination?.hasMore" :show-btn-floating="false" source="archived" @select="select"
            @more-options="handleMoreOptions" @load-more="loadMoreConversations" @on-scroll="handleScroll">
        </VirtualChatList>

        <Drawer :is-open="drawer.show" @close="onCloseDrawer">
            <div v-if="drawer.name === 'MORE_OPTIONS'">
                <DrawerItem title="Desarquivar" @on-press="handleDisarchiveChat(chatSelected._id, source)" />
            </div>
        </Drawer>
    </div>

</template>

<script setup>
import { computed, onMounted, nextTick, onActivated, watch, ref } from 'vue';
import { useStore } from 'vuex';
import VirtualChatList from '../components/VirtualChatList.vue';
import { useRoute, useRouter } from 'vue-router';;
import { logger } from '@/utils/logger';
import { getSocket } from '@/services/socket';
import Navbar from '@/components/UI/Navbar.vue';
import Drawer from '@/components/drawer/Drawer.vue';
import DrawerItem from '@/components/drawer/DrawerItem.vue';

// Estado de carregamento para mais conversas
const loadingMoreConversations = ref(false);
const loadingConversations = ref(true)
const virtualChatListComponent = ref(null)
const source = ref('archived')
const chatSelected = ref(null)

const drawer = ref({
    show: false,
    name: '',
    data: {}
})

// Acesso ao store Vuex
const store = useStore()
const router = useRouter()
const route = useRoute()

const user = computed(() => store.getters.currentUser)
const socket = getSocket()

const modules = computed(() => {
    return store.getters.conversations;
})

const conversations = computed(() => {
    return modules.value.find(m => m.source === source.value) || null
})

const select = (conversation) => {
    // Lógica para selecionar uma conversa
    store.commit("SET_CONVERSATION", {
        ...conversation,
        source: source.value
    })
    router.push('/messages/' + conversation?._id)
}

const resetDrawer = () => {
    drawer.value = {
        show: false,
        name: '',
        data: {}
    }
}

const onCloseDrawer = () => {
    resetDrawer()
    setTimeout(() => {
        chatSelected.value = null
    }, 300);
}

const handleMoreOptions = (conv) => {
    chatSelected.value = conv
    drawer.value.show = true
    drawer.value.name = 'MORE_OPTIONS'
}

const handleDisarchiveChat = async (convId, source) => {
    onCloseDrawer()

    if (!convId || !source) return

    await store.dispatch("toggleArchiveConversation", {
        convId,
        source,
        userId: user.value?._id
    })
}

const setScrollPosition = async (position) => {
    await nextTick(); // Espera a atualização do DOM
    if (virtualChatListComponent.value?.setScrollTop) {
        virtualChatListComponent.value.setScrollTop(position);
    } else {
        logger.error('setScrollTop method not available on postListComponent');
    }
};

const handleScroll = async (value) => {
    store.commit("UPDATE_SCROLLTOP_ON_CONVERSATION", {
        value,
        source: source.value
    })
}

// Função para carregar mais conversas
const loadMoreConversations = async () => {
    if (loadingMoreConversations.value) return;

    // Indica carregamento
    loadingMoreConversations.value = true;

    // Calcula a próxima página
    const nextPage = conversations?.value?.pagination?.page + 1 || 2;
    const total = conversations?.value?.pagination?.total || 0;
    const limit = 10

    // Busca mais conversas
    await store.dispatch("loadConversations", ({
        page: nextPage,
        limit,
        total,
        loadMore: true,
        status: source.value
    })).then(convs => {
        const conversationIds = convs.map(c => c._id.toString())
        joinConversations(conversationIds)
    });

    // Finaliza o carregamento
    loadingMoreConversations.value = false;
};

const joinConversations = (ids) => {
    if (!ids?.length) return
    else socket?.emit("join_conversations", ids)
}

onActivated(() => {
    const position = conversations.value?.scrollTop
    setScrollPosition(position)
})

// Carrega as conversas ao montar o componente
onMounted(async () => {
    await store.dispatch("loadConversations", ({
        page: 1,
        limit: 10,
        status: source.value
    }))
        .then(convs => {
            store.commit("RESET_ALL_MESSAGES")
            const conversationIds = convs.map(c => c._id.toString())
            joinConversations(conversationIds)
        })
        .finally(() => {
            loadingConversations.value = false
        })
});
</script>