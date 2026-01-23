<template>
    <div @click="$emit('on-press')"
        class="text-text-secondary text-lg flex items-center gap-2 bg-background-secondary rounded-[30px] py-2.5 px-5">
        <svg viewBox="6 6 24 24" fill="currentColor" width="18" height="18"
            overflow="visible">
            <path fill-rule="evenodd" clip-rule="evenodd"
                d="M23.522 21.662c-.389-.344-.443-.925-.181-1.373a8.5 8.5 0 1 0-3.051 3.051c.447-.261 1.028-.207 1.372.182l3.608 4.073a1.647 1.647 0 1 0 2.325-2.326l-4.073-3.607zm-3.28-9.905a6 6 0 1 1-8.484 8.486 6 6 0 0 1 8.485-8.486z">
            </path>
        </svg>
        <p>{{ placeholder }}</p>
    </div>
</template>

<script setup>

defineProps({
    placeholder: {
        type: String,
        required: false,
        default: 'Pesquisar no mekieapp'
    }
})


defineEmits(['on-press'])
</script>