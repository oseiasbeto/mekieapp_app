<template>
  <div v-if="!isDeletedForMe" class="relative">
    <!-- Separador de data -->
    <div v-if="showDateSeparator" class="flex py-4 justify-center">
      <div class="bg-separator bg-opacity-50 px-3 py-1 rounded-full">
        <span class="text-[13px] text-text-secondary font-medium">
          {{ formatDateSeparator(message.created_at) }}
        </span>
      </div>
    </div>

    <div :class="[
      'flex px-4 mb-2',
      isSent ? 'justify-end' : 'justify-start'
    ]">
      <div @contextmenu.prevent="handleMoreOption(message)" :class="[
        'rounded-2xl relative px-[14px] py-2 shadow-sm',
        isSent
          ? 'bg-primary text-white'
          : 'bg-background-secondary text-text-primary',
        // Efeito para mensagens com apenas emojis
        isEmojiOnly
          ? 'bg-transparent shadow-none p-0 rounded-none'
          : 'max-w-[75%]',
        // Bordas para mensagens consecutivas
        message.status === 'sending' ? 'opacity-20 pointer-events-none' : 'opacity-100'
      ]">
        <!-- Conteúdo da mensagem -->
        <p :class="[
          'break-words leading-snug',
          isEmojiOnly ? 'text-4xl' : 'text-[15px]'
        ]">
          {{ message.content }}
        </p>
      </div>
    </div>
  </div>

</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  message: { type: Object, required: true },
  userId: { type: String, required: true },
  previousMessage: Object
})

const emit = defineEmits(['more-option'])

const isSent = computed(() => props.message.sender._id === props.userId)
const isDeletedForMe = computed(() => props.message?.deleted_for?.includes(props.userId) || false)

// Verifica se a mensagem contém apenas emojis (1-3 emojis)
const isEmojiOnly = computed(() => {
  const content = props.message.content.trim()

  // Se contém apenas números, não é emoji
  if (/^\d+$/.test(content)) return false

  // Se contém caracteres alfanuméricos comuns, não é emoji
  if (/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?~ ]+$/.test(content)) return false

  // Regex para detectar apenas emojis reais
  const emojiRegex = /^(?:[\p{Emoji}\u200d\uFE0F]+)+$/gu
  const isOnlyEmojis = emojiRegex.test(content)

  if (!isOnlyEmojis) return false

  // Conta quantos emojis tem
  const emojiCount = (content.match(/[\p{Emoji}]/gu) || []).length

  return emojiCount <= 3 && emojiCount >= 1
})

// Verifica se deve mostrar o separador de data
const showDateSeparator = computed(() => {
  // Se não há mensagem anterior, sempre mostra o separador
  if (!props.previousMessage) return true

  const currentDate = new Date(props.message.created_at)
  const previousDate = new Date(props.previousMessage.created_at)

  // Compara ano, mês e dia (ignora horas, minutos, segundos)
  return (
    currentDate.getFullYear() !== previousDate.getFullYear() ||
    currentDate.getMonth() !== previousDate.getMonth() ||
    currentDate.getDate() !== previousDate.getDate()
  )
})

// Formata o separador de data no estilo Facebook
const formatDateSeparator = (dateString) => {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  // Reseta as horas para comparar apenas a data
  const todayReset = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const yesterdayReset = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())
  const dateReset = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  // Verifica se é hoje
  if (dateReset.getTime() === todayReset.getTime()) {
    return 'Hoje'
  }

  // Verifica se é ontem
  if (dateReset.getTime() === yesterdayReset.getTime()) {
    return 'Ontem'
  }

  // Verifica se é este ano
  if (date.getFullYear() === today.getFullYear()) {
    // Formata como "quarta, 30 de julho"
    const weekdays = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']
    const months = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ]

    const weekday = weekdays[date.getDay()]
    const day = date.getDate()
    const month = months[date.getMonth()]

    return `${weekday}, ${day} de ${month}`
  }

  // Data de outro ano - "quarta, 30 de julho de 2023"
  const weekdays = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']
  const months = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ]

  const weekday = weekdays[date.getDay()]
  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()

  return `${weekday}, ${day} de ${month} de ${year}`
}

const handleMoreOption = (msg) => {
  if(msg.status === 'sending') return
  emit('more-option', msg)
}
</script>