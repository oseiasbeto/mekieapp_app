<template>
    <div class="shrink-0 sticky flex flex-col top-0 w-full z-[10] px-5 bg-background-primary">
        <div class="flex my-auto h-[52px] items-center justify-between">
            <div>
                <h2 class="text-primary dark:text-white text-3xl font-secondary font-bold">
                    mekieapp
                </h2>
            </div>

            <div>
            </div>
        </div>

        <NetworkStatusBar :status="networkStatus" />
    </div>
    <div>
        <VirtualChatList ref="virtualChatListComponent" :conversations="conversations?.items || []"
            :loading="loadingConversations" :loading-more="loadingMoreConversations" :user-id="user?._id"
            :has-more="conversations?.pagination?.hasMore" @select="select" @new-chat="router.push('/new-message')"
            source="active" @load-more="loadMoreConversations" @on-scroll="handleScroll"
            @more-options="handleMoreOptions">
            <template #before-content>
                <div class="px-4 mb-2 py-2">
                    <SearchWrapper @on-press="router.push('/chats/archived')" placeholder="Pesquisar no MekieApp" />
                </div>
            </template>
        </VirtualChatList>

        <Drawer :is-open="drawer.show" @close="onCloseDrawer">
            <div v-if="drawer.name === 'MORE_OPTIONS'">
                <DrawerItem title="Arquivar" @on-press="handleArchiveChat(chatSelected._id, source)" />
            </div>
        </Drawer>
    </div>

</template>

<script setup>
import { computed, onMounted, nextTick, onActivated, watch, ref } from 'vue';
import { useStore } from 'vuex';
import VirtualChatList from '../components/VirtualChatList.vue';
import { useRoute, useRouter } from 'vue-router';
import SearchWrapper from '@/views/search/components/SearchWrapper.vue';
import { logger } from '@/utils/logger';
import { getSocket } from '@/services/socket';
import Drawer from '@/components/drawer/Drawer.vue';
import DrawerItem from '@/components/drawer/DrawerItem.vue';
import NetworkStatusBar from '@/components/Utils/NetworkStatusBar.vue';

// Estado de carregamento para mais conversas
const loadingMoreConversations = ref(false);
const loadingConversations = ref(true)
const virtualChatListComponent = ref(null)
const source = ref('active')
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

// Estado da rede
const networkStatus = computed(() => {
    return store.getters.networkStatus
})

const isOnline = computed(() => {
    return networkStatus.value === 'online' ? true : false
})

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

const select = (conversation) => {

    // Lógica para selecionar uma conversa
    store.commit("SET_CONVERSATION", {
        ...conversation,
        source: source.value
    })
    router.push('/messages/' + conversation?._id)
};

const handleMoreOptions = (conv) => {
    if (!isOnline.value) return

    chatSelected.value = conv
    drawer.value.show = true
    drawer.value.name = 'MORE_OPTIONS'
}

const handleScroll = async (value) => {
    if (!isOnline.value) return

    store.commit("UPDATE_SCROLLTOP_ON_CONVERSATION", {
        value,
        source: source.value
    })
}

const handleArchiveChat = async (convId, source) => {
    if (!isOnline.value) return

    onCloseDrawer()

    if (!convId || !source) return

    await store.dispatch("toggleArchiveConversation", {
        convId,
        source,
        userId: user.value?._id
    })
}

// Função para carregar mais conversas
const loadMoreConversations = async () => {
    if (!isOnline.value) return

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
        loadMore: true
    }))

    // Finaliza o carregamento
    loadingMoreConversations.value = false;
};

const setScrollPosition = async (position) => {
    await nextTick(); // Espera a atualização do DOM
    if (virtualChatListComponent.value?.setScrollTop) {
        virtualChatListComponent.value.setScrollTop(position);
    } else {
        logger.error('setScrollTop method not available on postListComponent');
    }
}

onActivated(() => {
    const position = conversations.value?.scrollTop
    setScrollPosition(position)
})

// Carrega as conversas ao montar o componente
onMounted(async () => {
    await store.dispatch("loadConversations", ({
        page: 1,
        limit: 10
    }))
        .then(() => {
            store.commit("RESET_ALL_MESSAGES")
        })
        .finally(() => {
            loadingConversations.value = false
        })
});
</script>