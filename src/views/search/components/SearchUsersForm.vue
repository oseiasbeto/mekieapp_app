<template>
    <div class="w-full z-50 bg-transparent h-10 pb-2">
        <div class="flex items-center h-full px-5 gap-3">
            <div @click="focusInput" class="text-text-secondary">
                <span>Para:</span>
            </div>
            <!-- Campo de busca -->
            <div class="flex-1 relative">
                <input ref="searchInput" v-model="query" type="text" @input="handleSearch" :placeholder="placeholder"
                    class="w-full caret-primary pl-0 bg-transparent text-sm text-text-primary placeholder-text-secondary focus:outline-none"
                    autocomplete="off" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, nextTick, ref } from 'vue';

defineProps({
    placeholder: {
        type: String,
        default: "Procurar nome ou grupo"
    }
})

const emit = defineEmits(['go-back', 'search', 'clear-search'])

const query = ref('')
const searchInput = ref(null)

const handleSearch = () => {
    emit('search', query.value)
}

const clearSearch = () => {
    query.value = ''
    nextTick(() => searchInput.value.focus())
    emit('clear-search')
}

const focusInput = () => searchInput.value.focus()


onMounted(() => {
    focusInput()
})

// Expõe a função para o componente pai
defineExpose({
    clearSearch,
    focusInput
});
</script>