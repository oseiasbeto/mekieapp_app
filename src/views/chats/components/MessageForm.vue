<template>
  <div class="w-full bg-background-primary">
    <reply-to-message-card 
    v-if="replyTo?.show" 
    :user-id="userId" 
    :message="replyTo?.message"
    @on-close="closeReplyTo"  
    />
    <form @submit.prevent="send" class="px-4 py-2 pb-1 flex items-center gap-3">

      <!-- Textarea compacto e lindo -->
      <div class="flex-1">
        <textarea ref="textareaRef" v-model="inputMessage" @input="autoResize"
          @keydown.enter.exact.prevent="handleEnter" @keydown.enter.shift.exact="allowNewLine" @focus="handleFocus"
          rows="1" placeholder="Mensagem" class="w-full caret-primary resize-none overflow-hidden scroll-pt-4
                 px-4 py-2 bg-background-secondary 
                text-base leading-snug
                 placeholder-text-secondary rounded-[23px] dark:placeholder-dark-text-secondary/70
                focus:outline-none
                 whitespace-pre-wrap break-words
                 min-h-[30px]" style="line-height: 20px;" />
      </div>

      <!-- Botão enviar -->
      <transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0 scale-90"
        enter-to-class="opacity-100 scale-100" leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-90">
        <button v-if="hasContent" type="submit" :disabled="props.disabled" class="p-1.5 bg-primary disabled:opacity-50
                 text-white rounded-full flex-shrink-0
                 transition-all duration-200 mb-1 active:scale-95">
          <svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24" id="send"
            class="icon glyph">
            <path
              d="M21.66,12a2,2,0,0,1-1.14,1.81L5.87,20.75A2.08,2.08,0,0,1,5,21a2,2,0,0,1-1.82-2.82L5.46,13H11a1,1,0,0,0,0-2H5.46L3.18,5.87A2,2,0,0,1,5.86,3.25h0l14.65,6.94A2,2,0,0,1,21.66,12Z"
              style="fill:#fff" />
          </svg>
        </button>
      </transition>
    </form>
  </div>
</template>

<script setup>
import { logger } from '@/utils/logger'
import { ref, computed, nextTick, watch, onMounted, onUnmounted } from 'vue'
import ReplyToMessageCard from './ReplyToMessageCard.vue'

const props = defineProps({
  disabled: { type: Boolean, default: false },
  replyTo: Object,
  userId: String
})

const emit = defineEmits(['message-sent', 'typing-start', 'typing-stop', 'close-reply-to', 'auto-resize', 'focus'])

const inputMessage = ref('')
const textareaRef = ref(null)
const isTyping = ref(false)
let typingTimer = null
let startTypingDebounce = null // ← Novo timer para o debounce do start

const hasContent = computed(() => inputMessage.value.trim().length > 0)

// ALTURA MÁXIMA = 4 LINHAS (≈ 98px com line-height 1.4 + padding)
const MAX_HEIGHT = 98

const autoResize = () => {
  const el = textareaRef.value
  if (!el) return

  el.style.height = 'auto'
  const scrollHeight = el.scrollHeight

  emit('auto-resize')

  if (scrollHeight <= MAX_HEIGHT) {
    el.style.height = `${scrollHeight}px`
    el.style.overflowY = 'hidden'
  } else {
    el.style.height = `${MAX_HEIGHT}px`
    el.style.overflowY = 'auto'
  }

  // DEBOUNCE para iniciar digitação - espera 300ms antes de emitir
  clearTimeout(startTypingDebounce)
  startTypingDebounce = setTimeout(() => {
    // Se tem conteúdo E não está atualmente digitando → inicia digitação
    if (inputMessage.value.trim() && !isTyping.value) {
      isTyping.value = true
      emit('typing-start')
      logger.log('Iniciando digitação...')
    }
  }, 300) // ⏰ Espera 300ms de inatividade antes de emitir typing-start

  // SEMPRE reseta o timer quando digita (isso evita parar após 1 minuto)
  clearTimeout(typingTimer)
  typingTimer = setTimeout(() => {
    // Só para de digitar se estiver atualmente no estado de digitação
    if (isTyping.value) {
      isTyping.value = false
      emit('typing-stop')
      logger.log('Parando digitação (timeout)')
    }
    typingTimer = null
  }, 1000) // 1 segundo sem digitar
}

const stopTyping = () => {
  // Só emite stop se estiver digitando
  if (isTyping.value) {
    isTyping.value = false
    emit('typing-stop')
  }

  if (typingTimer) {
    clearTimeout(typingTimer)
    typingTimer = null
  }
}

const handleEnter = (e) => {
  if (!e.shiftKey) {
    e.preventDefault()
    send()
  }
}

const allowNewLine = () => {
  nextTick(autoResize)
}

const clearInput = () => {
  inputMessage.value = ''
  nextTick(autoResize)
  stopTyping()
}

const closeReplyTo = () => {
  emit('close-reply-to')
}

const send = async () => {
  const content = inputMessage.value.trim()
  if (!content || props.disabled) return

  emit('message-sent', content)
  inputMessage.value = ''
  await nextTick()
  autoResize()
  textareaRef.value?.focus()
  stopTyping() // Para de digitar ao enviar
}
const handleFocus = () => {
  emit('focus')
}

// Expõe as funções pro componente pai
defineExpose({
  clearInput,
  focus: () => textareaRef.value?.focus(), // foco normal (abre teclado)
  blur: () => textareaRef.value?.blur()
})

watch(inputMessage, () => nextTick(autoResize))
onMounted(() => nextTick(autoResize))
onUnmounted(() => {
  if (typingTimer) {
    clearTimeout(typingTimer)
  }
})
</script>