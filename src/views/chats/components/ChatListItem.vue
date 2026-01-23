<template>
  <div @contextmenu.prevent="$emit('more-options', conversation)" @click="$emit('click')" class="
      flex items-center px-4 py-3 gap-3.5 cursor-pointer transition-all duration-200 relative
      hover:bg-background-secondary
    ">
    <!-- Avatar com status online -->
    <div class="relative flex-shrink-0">
      <Avatar :url="conversation?.avatar || '/default-avatar.png'" size="lg" alt="" />

      <!-- Bolinha verde de online (só em conversas diretas) -->
      <div v-if="props?.conversation.type === 'direct' && props?.conversation.is_online"
        class="absolute bottom-0 right-0 w-4 h-4 bg-[#31a24c] rounded-full border-2 border-background-primary">
      </div>
    </div>

    <!-- Conteúdo principal -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center justify-between gap-2">
        <!-- Nome do contato -->
        <h3 class="text-base font-medium text-text-primary truncate max-w-[180px]">
          {{ props?.conversation.name }}
        </h3>

        <!--celo de verificacao-->
        <div v-if="conversation?.is_verified" class="shrink-0 flex-1 justify-start">
          <svg class="ml-[-4px]" fill="none" width="14" viewBox="0 0 24 24" height="14">
            <circle cx="12" cy="12" r="11.5" fill="#0F73FF"></circle>
            <path fill="#fff" fill-rule="evenodd" clip-rule="evenodd"
              d="M17.659 8.175a1.361 1.361 0 0 1 0 1.925l-6.224 6.223a1.361 1.361 0 0 1-1.925 0L6.4 13.212a1.361 1.361 0 0 1 1.925-1.925l2.149 2.148 5.26-5.26a1.361 1.361 0 0 1 1.925 0Z">
            </path>
          </svg>
        </div>


        <!-- Horário da última mensagem -->
        <span v-show="!conversation?.is_typing" :class="['text-xs flex-shrink-0',
          props?.conversation.unread_count ? 'text-text-primary' : 'text-text-secondary']">
          {{ formatMessageTime(props?.conversation?.last_message?.created_at, new Date(currentTime)) }}
        </span>
      </div>

      <div class="flex items-center text-sm justify-between gap-3">
        <!-- Última mensagem + ícone de check se for enviada por você -->
        <p v-if="conversation?.is_typing" class="mt-[2.5px] text-green-400 truncate max-w-[220px]">
          Escrevendo...
        </p>
        <!-- Última mensagem + ícone de check se for enviada por você -->
        <p v-else-if="props.conversation?.last_message?.content" class="mt-[2.5px] truncate max-w-[220px]"
          :class="[props?.conversation.unread_count ? 'text-text-primary' : 'text-text-secondary']">

          {{ previewText }}
        </p>

        <!-- Badge de não lidas (igual Telegram) -->
        <div v-if="props?.conversation?.unread_count && !conversation?.is_typing" class="flex-shrink-0">
          <span
            class="flex items-center justify-center min-w-5 h-5 px-1.5 text-[11px] font-semibold mt-0.5 text-white bg-primary rounded-full shadow-sm">
            {{ props?.conversation.unread_count > 99 ? '99+' : props?.conversation.unread_count }}
          </span>
        </div>
        <div v-else-if="readBy.length > 0 && conversation.type == 'direct'">
          {{ readBy.length }}
        </div>

        <!-- Mute icon (opcional, se tiver silenciado) -->
        <svg v-if="props?.conversation?.muted"
          class="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary flex-shrink-0" fill="none"
          stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7v-3H3v-4h6V5z" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import Avatar from '@/components/Utils/Avatar.vue'
import { formatMessageTime } from '@/utils/format-message-time'
import { computed, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps({
  conversation: { type: Object, required: true },
  isActive: { type: Boolean, default: false },
  source: { type: String, default: 'active' },
  userId: { type: String, required: true } // ← adicione isso se ainda não tiver
})

// Variável reativa para o tempo atual
const currentTime = ref(Date.now())

const readBy = computed(() => {
  if (!props?.conversation?._id) return []
  else return props?.conversation?.read_by.filter(i => i.user?._id !== props.userId) || []
})

const previewText = computed(() => {

  const messageType = props?.conversation?.last_message?.message_type
  const emoji = props?.conversation?.last_message?.reaction
  const senderId = props?.conversation?.last_message?.sender?._id
  const userId = props?.userId

  const itsMe = senderId === userId

  switch (messageType) {
    case 'text':
      return `${itsMe ? 'Tu: ' : ''} ${props?.conversation?.last_message?.content}` 
    case 'reaction_message':
      return `${itsMe ? 'Reagiste' : 'Reagiu'} com ${emoji} a uma mensagem`
    default:
      return props?.conversation?.last_message?.content
  }
})

defineEmits(['click', 'more-options'])

onMounted(() => {
  // Atualiza o tempo atual a cada minuto
  const interval = setInterval(() => {
    currentTime.value = Date.now()
  }, 60000)

  onUnmounted(() => {
    clearInterval(interval)
  })
})
</script>