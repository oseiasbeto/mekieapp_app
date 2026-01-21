<template>
  <div v-if="!isDeletedForMe" class="relative">
    <!-- Separador de data -->
    <div v-if="showDateSeparator" class="flex py-4 justify-center">
      <div class="bg-separator/50 px-3 py-1 rounded-full">
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
        // Removido overflow-hidden fixo → controlado condicionalmente
        isSent
          ? 'bg-primary text-white'
          : 'bg-background-secondary text-text-primary',
        isEmojiOnly
          ? 'bg-transparent shadow-none p-0 rounded-none'
          : 'max-w-[75%]',
        message.status === 'sending'
          ? 'opacity-20 pointer-events-none'
          : 'opacity-100',
        // Aqui está a correção principal:
        message.reactions?.length > 0 && !isEmojiOnly
          ? 'overflow-visible mb-3'
          : 'overflow-hidden mb-0'
      ]">
        <!-- Quote / Mensagem respondida -->
        <div v-if="message.reply_to && !isEmojiOnly"
          class="mb-1.5 -mx-[14px] px-[14px] pt-1 pb-1.5 border-l-4 text-[13px] leading-tight" :class="[
            isSent
              ? 'border-l-blue-300/80 bg-white/10'
              : 'border-l-blue-600/50 bg-black/5'
          ]">
          <div class="font-semibold truncate opacity-95">
            {{ replySenderName }}
          </div>
          <div class="opacity-80 line-clamp-2">
            {{ replyPreviewText }}
          </div>
        </div>

        <!-- Conteúdo principal da mensagem -->
        <p :class="[
          'break-words leading-snug',
          isEmojiOnly ? 'text-5xl' : 'text-[15px]'
        ]">
          {{ message.content }}
        </p>

        <!-- Reações – estilo Messenger -->
        <div v-if="message.reactions?.length > 0 && !isEmojiOnly"
          class="absolute -bottom-4 flex items-center gap-1 z-10 pointer-events-none"
          :class="isSent ? 'right-3' : 'left-3'">
          <div
            :class="['rounded-full border-[0.1px] border-background-primary bg-background-secondary flex items-center justify-center text-sm relative', message.reactions.length > 1 ? 'w-auto px-1 min-w-[24px]' : 'w-6 h-6']"
            :style="{ zIndex: groupedReactions.length - index }">
            <span v-for="(reaction, index) in groupedReactions" :key="index">{{ reaction.emoji }}</span>

            <div v-if="message.reactions.length > 1"
              class="text-text-secondary text-[13px] px-1">
              {{ message.reactions.length }}
            </div>
          </div>


        </div>
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

const isEmojiOnly = computed(() => {
  const content = props.message.content.trim()
  if (!content || /^\d+$/.test(content)) return false
  if (/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?~ ]+$/.test(content)) return false

  const emojiRegex = /^(?:[\p{Emoji}\u200d\uFE0F]+)+$/gu
  if (!emojiRegex.test(content)) return false

  const count = (content.match(/[\p{Emoji}]/gu) || []).length
  return count >= 1 && count <= 3
})

const showDateSeparator = computed(() => {
  if (!props.previousMessage) return true

  const current = new Date(props.message.created_at)
  const prev = new Date(props.previousMessage.created_at)

  return (
    current.getFullYear() !== prev.getFullYear() ||
    current.getMonth() !== prev.getMonth() ||
    current.getDate() !== prev.getDate()
  )
})

const formatDateSeparator = (dateString) => {
  const date = new Date(dateString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const todayReset = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const yesterdayReset = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())
  const dateReset = new Date(date.getFullYear(), date.getMonth(), date.getDate())

  if (dateReset.getTime() === todayReset.getTime()) return 'Hoje'
  if (dateReset.getTime() === yesterdayReset.getTime()) return 'Ontem'

  const weekdays = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado']
  const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro']

  const weekday = weekdays[date.getDay()]
  const day = date.getDate()
  const month = months[date.getMonth()]

  if (date.getFullYear() === today.getFullYear()) {
    return `${weekday}, ${day} de ${month}`
  }
  return `${weekday}, ${day} de ${month} de ${date.getFullYear()}`
}

const handleMoreOption = (msg) => {
  if (msg.status === 'sending') return
  emit('more-option', msg)
}

const replySenderName = computed(() => {
  if (!props.message.reply_to) return ''
  const sender = props.message.reply_to.sender || {}
  return sender._id === props.userId ? 'Você' : (sender.name || sender.username || 'Alguém')
})

const replyPreviewText = computed(() => {
  if (!props.message.reply_to?.content) return ''
  const text = props.message.reply_to.content.trim()
  return text.length > 90 ? text.substring(0, 87) + '...' : text
})

const groupedReactions = computed(() => {
  if (!props.message.reactions?.length) return []

  const map = new Map()

  props.message.reactions.forEach(r => {
    const emoji = r.emoji
    if (!map.has(emoji)) {
      map.set(emoji, { emoji, count: 0 })
    }
    map.get(emoji).count++
  })

  return Array.from(map.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
})
</script>
