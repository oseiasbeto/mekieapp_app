<template>
    <div class="flex border-t border-border-primary bg-background-primary px-4 py-1.5 justify-between">
        <div class="flex flex-col flex-1">
            <p class="text-xs text-text-primary truncate">Responder {{ isSent ? 'à tua mensagem' : 'a '+ message?.sender?.name }}</p>
            <p class="text-sm text-text-secondary">{{ previewText || '...' }}</p>
        </div>

        <button @click="close">X</button>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    message: {
        type: Object,
        required: true
    },
    userId: String
})

const emit = defineEmits(['on-close'])

const isSent = computed(() => props.message?.sender?._id === props.userId || false)
const previewText = computed(() => {
    switch (props?.message?.message_type) {
        case 'text':
            return props.message.content
        case 'photo':
            return '📷 Foto'
        case 'video':
            return '🎥 Vídeo'
        case 'voice':
            return '🎤 Mensagem de voz'
    }
})

const close = () => {
    emit('on-close')
}
</script>