<template>
  <header class="flex h-[52px] items-center px-4 bg-background-primary">
    <button @click="$emit('goBack')"
      class="p-1 text-primary hover:bg-background-secondary mr-1 rounded-full transition-colors">
      <svg fill="none" width="24" viewBox="0 0 24 24" height="24">
        <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
          d="M3 12a1 1 0 0 1 .293-.707l6-6a1 1 0 0 1 1.414 1.414L6.414 11H20a1 1 0 1 1 0 2H6.414l4.293 4.293a1 1 0 0 1-1.414 1.414l-6-6A1 1 0 0 1 3 12Z">
        </path>
      </svg>
    </button>

    <!-- Avatar -->
    <Avatar @click="goToConversationDetails(conversation?._id)" :url="loading ? '' : conversation?.avatar || ''"
      size="md" class="flex-shrink-0" />

    <!-- Informações do contato -->
    <div class="ml-3 flex-1 min-w-0">
      <!-- Nome -->
      <div class="w-full flex">
        <h2 class="text-base mb-0.5 font-semibold text-text-primary truncate leading-tight">
          {{ loading ? 'Carregando...' : conversation?.name || 'Chat' }}
        </h2>

        <!--celo de verificacao-->
        <div v-if="conversation?.is_verified" class="shrink-0 flex-1 justify-start">
          <svg class="ml-[5px] mt-0.5" fill="none" width="14" viewBox="0 0 24 24" height="14">
            <circle cx="12" cy="12" r="11.5" fill="#0F73FF"></circle>
            <path fill="#fff" fill-rule="evenodd" clip-rule="evenodd"
              d="M17.659 8.175a1.361 1.361 0 0 1 0 1.925l-6.224 6.223a1.361 1.361 0 0 1-1.925 0L6.4 13.212a1.361 1.361 0 0 1 1.925-1.925l2.149 2.148 5.26-5.26a1.361 1.361 0 0 1 1.925 0Z">
            </path>
          </svg>
        </div>
      </div>


      <!-- Status (online / digitando / visto por último) -->
      <p class="text-sm mt-0.5 text-text-secondary flex items-center gap-1.5 leading-none">
        <!-- Carregando -->
        <span v-if="loading">conectando...</span>

        <!-- Online com bolinha verde piscando (igual Telegram) -->
        <span v-else-if="conversation?.is_online && !conversation?.is_typing" class="flex items-center gap-1.5">
          online
        </span>

        <!-- Digitando com animação de 3 pontinhos -->
        <span v-else-if="conversation?.is_typing" class="flex items-center gap-0.5">
          escrevendo
          <span class="flex ml-1 space-x-0.5">
            <span class="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span class="w-1 h-1 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span class="w-1 h-1 bg-current rounded-full animate-bounce"></span>
          </span>
        </span>

        <!-- Visto por último -->
        <span v-else>
          {{ conversation?.last_seen ? formatLastSeen(conversation.last_seen) : 'visto por último recentemente' }}
        </span>
      </p>
    </div>

    <!-- Botões da direita (busca e menu) -->
    <div class="flex items-center gap-3">
      <!-- Mais opções (3 pontinhos verticais) -->
      <button @click="goToConversationDetails(conversation?._id)" class="p-2 rounded-full text-primary hover:bg-background-secondary transition-colors">
        <svg fill="none" width="18" viewBox="0 0 24 24" height="18">
          <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
            d="M2 12a2 2 0 1 1 4 0 2 2 0 0 1-4 0Zm16 0a2 2 0 1 1 4 0 2 2 0 0 1-4 0Zm-6-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z">
          </path>
        </svg>
      </button>
    </div>
  </header>
</template>

<script setup>
import Avatar from '@/components/Utils/Avatar.vue'
import { useRouter } from 'vue-router'

defineProps({
  conversation: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false }
})

const router = useRouter()


const goToConversationDetails = (id) => {
  router.push('/chat/' + id)
}

defineEmits(['goBack'])

// Formata "visto por último" como no Telegram
const formatLastSeen = (date) => {
  if (!date) return 'visto por último recentemente'
  const diff = Math.floor((Date.now() - new Date(date)) / 60000)
  if (diff < 1) return 'visto agora há pouco'
  if (diff < 60) return `visto há ${diff} min`
  if (diff < 1440) return `visto há ${Math.floor(diff / 60)} h`
  return 'visto por último há muito tempo'
}
</script>