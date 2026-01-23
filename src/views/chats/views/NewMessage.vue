<template>
    <div class="relative">
        <div class="sticky w-full flex flex-col bg-background-primary z-10 top-0">
            <Navbar @go-back="router.back" title="Nova mensagem" :is-fixed="false" />
            <div v-show="!loadingLoadUsers" class="mb-3"></div>
            <SearchUsersForm v-if="!loadingLoadUsers" ref="searchUserFormComponent" @search="handleSearch" />
        </div>
        <VirtualUsersList :ukey="ukey" ref="virtualUsersListComponent"
            :users="isSearching ? searchUsers.items || [] : suggestedUsers.items || []" :loading="loadingLoadUsers"
            :loading-more="loadingMoreUsers"
            :has-more="isSearching ? searchUsers?.pagination?.hasMore : suggestedUsers?.pagination?.hasMore"
            @load-more="loadMoreUsers" @select="select">
            <template v-if="!loadingLoadUsers" #before-content>
                <div v-if="!isSearching" class="px-4 mt-4 text-sm">
                    <p class="text-text-secondary">Sugestões:</p>
                </div>
            </template>
        </VirtualUsersList>
    </div>
</template>

<script setup>
import { computed, onMounted, onActivated, onDeactivated, ref } from 'vue';
import { useStore } from 'vuex';
import VirtualUsersList from '../../users/components/VirtualUsersList.vue';
import { useRouter } from 'vue-router';
import { debounce } from 'lodash-es'
import Navbar from '@/components/UI/Navbar.vue';
import SearchUsersForm from '@/views/search/components/SearchUsersForm.vue';

const loadingLoadUsers = ref(true)
const loadingMoreUsers = ref(false)
const loadingSearchUsers = ref(false)
const loadingOpenConv = ref(false)
const searchUserFormComponent = ref(null)
const ukey = ref("")
const isSearching = ref(false)
const virtualUsersListComponent = ref(null)

const store = useStore()
const router = useRouter()

const suggestedUsers = computed(() => store.getters.users)
const searchUsers = computed(() => store.getters.searchUsers)

// Computed para acessar as conversas do store Vuex
const conversations = computed(() => {
    // Acessa as conversas do store Vuex
    return store.getters.conversations;
})

// Estado da rede
const networkStatus = computed(() => {
    return store.getters.networkStatus
})

const isOnline = computed(() => {
    return networkStatus.value === 'online' ? true : false
})

const select = async (user) => {
    if (loadingOpenConv.value) return

    const convModules = conversations.value

    const convIndex = convModules.findIndex(m => m.source === 'active') || 0

    if (convIndex === -1) return

    const items = conversations.value[convIndex].items;

    // Verifica se a conversa já existe
    const index = items.findIndex(conv => conv.name === user.name);

    if (index !== -1) {
        const conv = items[index]
        store.commit("SET_CONVERSATION", {
            ...conv,
            source: 'active'
        })
        router.push('/messages/' + conv?._id)
    } else {
        loadingOpenConv.value = true

        if (!isOnline.value) return
        else {
            const isChat = user?.source === 'chat' ? true : false
            await store.dispatch('openDirectMessage', isChat ? user.user?._id : user._id)
                .then((conv) => {
                    router.push('/messages/' + conv?._id)
                }).finally(() => {
                    loadingOpenConv.value = false
                })
        }

    }
}

const focusSearchUsersForm = () => {
    searchUserFormComponent?.value?.focusInput()
}

const resetComponent = () => {
    isSearching.value = false
    searchUserFormComponent?.value?.clearSearch()
    ukey.value = ""
    store.commit("RESET_SEARCH_USERS")
}

const handleSearch = debounce(async (q) => {
    if (!q.trim()) {
        loadingSearchUsers.value = false
        isSearching.value = false
        store.commit("RESET_SEARCH_USERS")
        ukey.value = ""
    } else {
        if (!isOnline.value) return
        loadingSearchUsers.value = true
        isSearching.value = true
        await store.dispatch("searchUsers", q).then(items => {
            ukey.value = items?.length + '-' + Date.now()
        }).finally(() => {
            loadingSearchUsers.value = false
        })
    }
}, 300)

const loadMoreUsers = async () => {
    if (loadingMoreUsers.value || !isOnline.value) return;

    // Indica carregamento
    loadingMoreUsers.value = true;

    // Calcula a próxima página
    const nextPage = users?.value?.pagination?.page + 1 || 2;
    const total = users?.value?.pagination?.total || 0;
    const limit = 20

    // Busca mais conversas
    await store.dispatch("loadUsers", ({
        page: nextPage,
        limit,
        total,
        loadMore: true
    }));

    // Finaliza o carregamento
    loadingMoreUsers.value = false;
};

onActivated(() => {
    focusSearchUsersForm()
    virtualUsersListComponent?.value?.setScrollTop(0)
})
onDeactivated(() => {
    resetComponent()
})
onMounted(async () => {
    if (!isOnline.value) return
    
    await store.dispatch("loadUsers", {
        page: 1,
        limit: 20
    }).finally(() => {
        loadingLoadUsers.value = false
    })
})
</script>