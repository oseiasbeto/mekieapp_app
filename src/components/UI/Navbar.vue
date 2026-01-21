<template>
    <!-- WhatsApp Android Header - Verde clássico -->
    <header
        :class="['px-4 flex h-[52px] items-center justify-between bg-background-primary', isFixed ? 'fixed top-0 left-0 right-0 z-50' : 'relative']">
        <div class="flex items-center">
            <!-- Botão Voltar -->
            <button @click="$emit('goBack')"
                class="p-1 text-text-secondary hover:bg-background-secondary mr-1 rounded-full transition-colors">
                <svg fill="none" width="24" viewBox="0 0 24 24" height="24">
                    <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
                        d="M3 12a1 1 0 0 1 .293-.707l6-6a1 1 0 0 1 1.414 1.414L6.414 11H20a1 1 0 1 1 0 2H6.414l4.293 4.293a1 1 0 0 1-1.414 1.414l-6-6A1 1 0 0 1 3 12Z">
                    </path>
                </svg>
            </button>

            <!-- Título centralizado -->
            <h1 class="text-lg ml-3 font-bold text-text-primary select-none">
                {{ title }}
            </h1>
        </div>

        <!-- Espaço vazio à direita para balancear (WhatsApp sempre deixa simétrico) -->
        <div>
            <slot name="right"></slot>
        </div>
    </header>
</template>

<script setup>
defineProps({
    title: {
        type: String,
        required: true,
        default: 'Título'
    },
    isFixed: {
        type: Boolean,
        default: true
    }
})

defineEmits(['goBack'])
</script>