<template>
    <div class="flex flex-col h-screen overflow-hidden">
        <!-- Fundo fixo com cor + pattern oficial -->
        <div class="sticky py-1 z-50 top-0 w-full">
            <ChatHeader @go-back="router.back()" :loading="loading" :conversation="conversation" />
            <NetworkStatusBar :status="networkStatus" />
        </div>

        <div ref="messagesContainer" @scroll="handleScroll" :style="{ paddingBottom: inputHeight + 'px' }"
            class="flex-1 pt-4 !overflow-y-scroll bg-chat-bg bg-cover">

            <div v-if="!loadingMessages">
                <div class="flex justify-center" ref="loadTrigger" v-if="cachedMessages?.pagination?.hasMore">
                    <SpinnerSmall />
                </div>
                <MessageBox @more-option="openDrawerMessage" v-for="(message, index) in cachedMessages?.items || []"
                    :key="message._id" :message="message" :user-id="user?._id"
                    :previousMessage="cachedMessages?.items[index - 1]" />

                <!--start read by-->
                <div v-if="readBy.length > 0" class="flex justify-end">
                    <p>Visto:</p> {{ readBy.length }}
                </div>
                <!--end read by-->
            </div>
            <div class="h-full flex justify-center items-center w-full" v-else>
                <SpinnerSmall />
            </div>

            <!-- Botão flutuante "scroll to bottom" – estilo Messenger -->
            <button v-if="showScrollToBottom" @click="scrollToBottom(true)"
                class="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 w-10 h-10 rounded-full bg-white dark:bg-background-secondary text-primary shadow-lg flex items-center justify-center transition-opacity duration-200"
                aria-label="Voltar para o final da conversa">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                </svg>
            </button>
        </div>


        <div class="z-10 dark:bg-dark-bg w-full">
            <MessageForm @typing-start="handleTypingStart" @typing-stop="handleTypingStop"
                @message-sent="handleSendMessage" ref="messageFormRef" :user-id="user._id"
                :disabled="isLoadingSendMessage" :reply-to="replyTo" @close-reply-to="resetReplyTo" />
        </div>

        <!--drawer-->
        <Drawer :is-open="drawer.show" @close="onCloseDrawer">
            <div v-if="drawer.name === 'MESSAGE_MORE_OPTIONS'">
                <div
                    class="flex border-b border-border-primary mb-1 overflow-x-auto gap-1 justify-center pt-3 px-1.5 py-2 items-center">
                    <button @click="handleReactMessage(messageSelected._id, '❤️')"
                        class="px-1 py-1 rounded-full text-3xl bg-background-secondary hover:bg-background-tertiary"
                        :class="{ 'bg-background-tertiary': isReacted('❤️', messageSelected) }">
                        <img class="w-8 h-u" src="../../../assets/imgs/emojis/heart.png" />
                    </button>
                    <button @click="handleReactMessage(messageSelected._id, '😆')"
                        class="px-1 py-1 rounded-full text-3xl bg-background-secondary hover:bg-background-tertiary"
                        :class="{ 'bg-background-tertiary': isReacted('😆', messageSelected) }">
                        <img class="w-8 h-u" src="../../../assets/imgs/emojis/haha.png" />
                    </button>

                    <button @click="handleReactMessage(messageSelected._id, '😡')"
                        class="px-1 py-1 rounded-full text-3xl bg-background-secondary hover:bg-background-tertiary"
                        :class="{ 'bg-background-tertiary': isReacted('😡', messageSelected) }">
                        <img class="w-8 h-u" src="../../../assets/imgs/emojis/angry.png" />
                    </button>
                    <button @click="handleReactMessage(messageSelected._id, '😢')"
                        class="px-1 py-1 rounded-full text-3xl bg-background-secondary hover:bg-background-tertiary"
                        :class="{ 'bg-background-tertiary': isReacted('😢', messageSelected) }">
                        <img class="w-8 h-u" src="../../../assets/imgs/emojis/sad.png" />
                    </button>

                    <button @click="handleReactMessage(messageSelected._id, '😮')"
                        class="px-1 py-1 rounded-full text-3xl bg-background-secondary hover:bg-background-tertiary"
                        :class="{ 'bg-background-tertiary': isReacted('😮', messageSelected) }">
                        <img class="w-8 h-u" src="../../../assets/imgs/emojis/wow.png" />
                    </button>

                    <button @click="handleReactMessage(messageSelected._id, '👍')"
                        class="px-1 py-1 rounded-full text-3xl bg-background-secondary hover:bg-background-tertiary"
                        :class="{ 'bg-background-tertiary': isReacted('👍', messageSelected) }">
                        <img class="w-8 h-u" src="../../../assets/imgs/emojis/like.png" />
                    </button>


                </div>
                <DrawerItem @on-press="onCloseDrawer" title="Copiar" />
                <DrawerItem @on-press="handleReplyTo(messageSelected)" title="Responder" />
                <DrawerItem @on-press="setModalConfirm({
                    isOpen: true,
                    title: 'Eliminar para ti?',
                    message: 'Esta mensagem vai ser eliminada para ti. Os restantes membros da conversa vão poder continuar a vê-la.',
                    confirmText: 'Eliminar',
                    data: {
                        msgId: messageSelected?._id,
                        convId: convId,
                        userId: user._id
                    },
                    actionType: 'deleteForMe'
                })" title="Eliminar para mim" />
                <DrawerItem v-if="isSentMessageSelected" @on-press="setModalConfirm({
                    isOpen: true,
                    title: 'Eliminar para todos?',
                    message: 'Esta mensagem vai ser eliminada para todos. Os restantes membros da conversa não vão poder continuar a vê-la.',
                    confirmText: 'Eliminar',
                    data: {
                        msgId: messageSelected?._id,
                        convId: convId,
                        userId: user._id
                    },
                    actionType: 'deleteMessage'
                })" title="Eliminar para todos" />
            </div>
        </Drawer>

        <!--modal-->
        <ConfirmationModal :is-open="modalConfirm.isOpen" :title="modalConfirm.title" :message="modalConfirm.message"
            :confirm-text="modalConfirm.confirmText" @close="closeModalConfirm" @confirm="handleConfirm" />
    </div>
</template>

<script setup>
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router';
import MessageForm from '../components/MessageForm.vue';
import { useStore } from 'vuex';
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import ChatHeader from '../components/ChatHeader.vue';
import MessageBox from '../components/MessageBox.vue';
import { getSocket } from '@/services/socket';
import SpinnerSmall from '@/components/UI/SpinnerSmall.vue';
import { useIntersectionObserver } from "@vueuse/core";
import Drawer from '@/components/drawer/Drawer.vue';
import DrawerItem from '@/components/drawer/DrawerItem.vue';
import ConfirmationModal from '@/components/modal/ConfirmationModal.vue';
import NetworkStatusBar from '@/components/Utils/NetworkStatusBar.vue';

const route = useRoute()
const store = useStore()
const socket = getSocket();
const router = useRouter()

const loading = ref(true)
const loadingMessages = ref(true)
const loadingMoreMessages = ref(false)
const isLoadingSendMessage = ref(false)
const messageSelected = ref(null)
const messagesContainer = ref(null)
const replyTo = ref({ show: false, message: null })
const modalConfirm = ref({
    isOpen: false,
    title: '',
    message: '',
    data: {},
    confirmText: '',
    actionType: ''
})

const drawer = ref({
    show: false,
    name: '',
    data: {}
})

const inputContainer = ref(null);
const inputHeight = ref(0); // altura inicial do input
const loadTrigger = ref(null)
const messageFormRef = ref(false)
const previousScrollHeight = ref(0)
const previousScrollTop = ref(0)
const showScrollToBottom = ref(false)

const convId = route.params.convId;

const user = computed(() => store.getters.currentUser || null)
const isSentMessageSelected = computed(() => messageSelected.value?.sender?._id === user.value?._id || false)
const conversation = computed(() => store.getters.currentConversation)
const messages = computed(() => store.getters.messages)
const cachedMessages = computed(() => {
    return messages.value.find(module => module.byId === conversation.value?._id) || null
})
const readBy = computed(() => {
    if (!conversation.value?._id) return []
    else return conversation.value?.read_by?.filter(i => i.user?._id !== user.value._id) || []
})

// Estado da rede
const networkStatus = computed(() => {
    return store.getters.networkStatus
})

const isOnline = computed(() => {
    return networkStatus.value === 'online' ? true : false
})

const isReacted = (emoji, message) => {
    return message?.reactions?.find((reaction) => reaction.emoji === emoji && reaction?.user?._id === user.value?._id);
};

const getMessageFromCache = (byId) => {
    return messages.value.find(m => m.byId == byId) || null;
}

const scrollToBottom = async (smooth = true) => {
    await nextTick();
    const el = messagesContainer.value;
    if (el) {
        el.scrollTo({
            top: el.scrollHeight,
            behavior: smooth ? 'smooth' : 'auto'
        });
    }
};

const loadMoreMessages = async () => {
    if (loadingMoreMessages.value || !cachedMessages.value?.pagination?.hasMore || !isOnline.value) return

    const container = messagesContainer.value
    if (!container) return

    // 1. Salva a altura atual ANTES de carregar mais
    previousScrollHeight.value = container.scrollHeight
    previousScrollTop.value = container.scrollTop


    loadingMoreMessages.value = true

    const page = cachedMessages.value?.pagination?.page + 1 || 2;
    const total = cachedMessages.value?.pagination?.total || null;
    const convId = cachedMessages.value?.byId || null
    const limit = 10

    loadingMoreMessages.value = true
    await store.dispatch("loadMessages", ({
        page,
        limit,
        convId,
        loadMore: true,
        total
    }))
        .finally(async () => {
            loadingMoreMessages.value = false

            // Restaura scroll
            await nextTick()
            const newScrollHeight = container.scrollHeight
            const heightDiff = newScrollHeight - previousScrollHeight.value
            container.scrollTop = previousScrollTop.value + heightDiff
        })
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
        messageSelected.value = null
    }, 300);
}

const resetReplyTo = () => {
    replyTo.value.show = false
    replyTo.value.message = null
}

const openDrawerMessage = (msg) => {
    if (!isOnline.value) return

    messageSelected.value = msg
    drawer.value.show = true
    drawer.value.name = 'MESSAGE_MORE_OPTIONS'
}

const updateInputHeight = () => {
    if (!inputContainer.value) return;
    const rect = inputContainer.value.getBoundingClientRect();
    inputHeight.value = rect.height;
};

const setModalConfirm = (data) => {
    modalConfirm.value = data

    if (drawer.value.show) {
        onCloseDrawer()
    }
}

const closeModalConfirm = () => {
    modalConfirm.value = {
        isOpen: false,
        title: '',
        message: '',
        data: {},
        confirmText: '',
        actionType: ''
    }
}

// Funções para controlar a digitação
const handleTypingStart = () => {

    if (conversation.value?.type !== 'direct' || !isOnline.value) return
    const reciverId = conversation.value?.xyz_id || null

    socket.emit('typing_start', {
        conv: conversation.value,
        reciverId,
        source: conversation?.value?.source
    })
}

const handleScroll = () => {
    checkScrollPosition()
}

const checkScrollPosition = () => {
  const container = messagesContainer.value
  if (!container) return

  const scrollTop = container.scrollTop
  const scrollHeight = container.scrollHeight
  const clientHeight = container.clientHeight

  // Mostra botão se estiver pelo menos 200px acima do bottom
  const nearBottom = scrollHeight - scrollTop - clientHeight < 200
  showScrollToBottom.value = !nearBottom
}

const handleTypingStop = () => {
    if (conversation.value?.type !== 'direct' || !isOnline.value) return
    const reciverId = conversation.value?.xyz_id || null

    socket.emit('typing_stop', {
        conv: conversation.value,
        reciverId,
        source: conversation?.value?.source
    })
}

const handleDeleteMessageForMe = (convId, source, msgId, userId) => {
    store.dispatch("deleteMessageForMe", { convId, source, msgId, userId })
}

const handleDeleteMessage = (convId, source, msgId) => {
    store.dispatch("deleteMessage", { convId, source, msgId })
}

const handleConfirm = () => {
    if (!modalConfirm.value?.isOpen) return

    const el = modalConfirm.value
    const actionType = el.actionType
    const source = conversation?.value?.source
    const { convId, msgId, userId } = el.data

    switch (actionType) {
        case 'deleteForMe':
            handleDeleteMessageForMe(convId, source, msgId, userId)
            break;
        case 'deleteMessage':
            handleDeleteMessage(convId, source, msgId)
            break
    }
    closeModalConfirm()
}

const handleReplyTo = (msg) => {
    replyTo.value.show = true
    replyTo.value.message = msg
    onCloseDrawer()
    messageFormRef.value.focus()
}

const handleSendMessage = async (message) => {
    const tempId = Math.random().toString(36).substring(2, 10);

    const newMessage = {
        content: message,
        conversation: conversation.value,
        created_at: Date.now(),
        read_by: [],
        message_type: 'text',
        sender: {
            profile_image: user?.value?.profile_image,
            _id: user?.value?._id,
            name: user?.value?.name,
            username: user?.value?.username,
        },
        ...(replyTo.value?.show && {
            reply_to: replyTo.value.message
        }),
        status: "sending",
        created_at: Date.now(),
        updated_at: Date.now(),
        _id: tempId
    }

    store.commit("ADD_MESSAGE_REALTIME", {
        convId: conversation.value?._id,
        source: conversation?.value?.source,
        message: newMessage
    })

    store.commit('UPDATE_UNREAD_COUNT_ON_CONVERSATION', {
        convId: conversation?.value?._id,
        source: conversation?.value?.source,
        count: 0
    })

    scrollToBottom();

    if (replyTo.value?.show) {
        resetReplyTo()
    }

    await store.dispatch("sendMessage", ({
        tempId,
        convId: conversation.value?._id,
        ...(newMessage?.reply_to && {
            replyToId: newMessage?.reply_to?._id || null
        }),
        source: conversation?.value?.source,
        content: message
    }))
};

const handleReactMessage = (messageId, emoji) => {
    store.dispatch("reactMessage", {
        convId: conversation.value?._id,
        msgId: messageId,
        emoji,
        sender: {
            _id: user.value?._id,
            name: user.value?.name,
            username: user.value?.username,
            profile_image: user.value?.profile_image,
            is_verified: user.value?.is_verified
        },
        source: conversation?.value?.source
    })
    resetDrawer()
}


// Observa o último elemento da lista
let isLoadingMore = false

useIntersectionObserver(
    loadTrigger,
    ([{ isIntersecting }]) => {
        if (
            isIntersecting &&
            cachedMessages.value?.pagination?.hasMore &&
            !isLoadingMore
        ) {
            isLoadingMore = true
            loadMoreMessages().finally(() => {
                isLoadingMore = false
            })
        }
    },
    { threshold: 0.1 }
)

let viewportHandler;

watch(() => route.params.convId, async (newId, oldId) => {
    if (!newId || newId === oldId) return;
    loadingMoreMessages.value = false
    messageFormRef.value.clearInput()
    resetReplyTo()

    const cachedMessages = getMessageFromCache(newId)
    if (cachedMessages) {
        await nextTick()
        scrollToBottom(false)
    } else {
        loadingMessages.value = true
        await store.dispatch("loadMessages", ({
            page: 1,
            limit: 10,
            convId: newId,
            hasMore: false
        }))
            .finally(() => {
                loading.value = false
                loadingMessages.value = false
                scrollToBottom(false)
            })
    }

    if (conversation?.value?.unread_count) {
        await store.dispatch("markAsRead", {
            convId: conversation?.value?._id,
            source: conversation?.value?.source
        })
    }
})

onBeforeRouteLeave((to, from, next) => {
    if (drawer.value.show) {
        resetDrawer()
        next(false)
    } else if (modalConfirm.value?.isOpen) {
        closeModalConfirm()
        next(false)
    } else {
        next()
    }
})

onMounted(async () => {
    if (!conversation.value?._id) {
        await store.dispatch("getConversation", convId).then(async () => {
            await store.dispatch("loadMessages", ({
                page: 1,
                limit: 10,
                convId: conversation.value?._id,
                hasMore: false
            }))
                .finally(() => {
                    loading.value = false
                    loadingMessages.value = false
                })
            await nextTick()
            scrollToBottom(false);
        }).finally(async () => {
            loadingMessages.value = false
            loading.value = false

            if (conversation?.value?.unread_count) {

                await store.dispatch("markAsRead", {
                    convId: conversation?.value?._id,
                    source: conversation?.value?.source
                })
            }
        })
    } else {
        if (conversation?.value?.unread_count) {

            await store.dispatch("markAsRead", {
                convId: conversation?.value?._id,
                source: conversation?.value?.source
            })
        }

        loading.value = false

        if (!cachedMessages.value) {
            await store.dispatch("loadMessages", ({
                page: 1,
                limit: 10,
                convId: conversation.value?._id,
                hasMore: false
            }))
                .finally(() => {
                    loading.value = false
                    loadingMessages.value = false
                })
        } else {
            loadingMessages.value = false
            loading.value = false
        }
    }

    await nextTick()
    updateInputHeight();

    // Ajusta com teclado (mobile)
    viewportHandler = () => {
        const viewport = window.visualViewport;
        if (viewport) {
            const tolerance = 50
            const isBottom = messagesContainer.value.scrollHeight - messagesContainer.value.scrollTop <= messagesContainer.value.offsetHeight + tolerance

            if (isBottom) {
                scrollToBottom(false)
            }
        }
    };

    window.visualViewport?.addEventListener('resize', viewportHandler);
    //window.visualViewport?.addEventListener('scroll', viewportHandler);

    scrollToBottom(false);

    if (socket) {
        socket.on('new_message', async (msg) => {
            if (msg.conversation?._id === conversation.value._id && msg.sender?._id !== user.value?._id) {
                await scrollToBottom();
            }
        });
    }
})

onUnmounted(() => {
    // SEMPRE remove o listener ao sair do componente
    socket.off('typing_start')
    socket.off('typing_stop')
    socket.off('newMessage');
    window.visualViewport?.removeEventListener('resize', viewportHandler);
    //window.visualViewport?.removeEventListener('scroll', viewportHandler);
})
</script>