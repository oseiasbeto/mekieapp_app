<template>
    <div @click="$emit('on-press')" class="text-text-secondary text-base bg-background-secondary rounded-[30px] py-2.5 px-5">
        <p>{{ placeholder }}</p>
    </div>
</template>

<script setup>

defineProps({
    placeholder: {
        type: String,
        required: false,
        default: 'Pesquisar'
    }
})


defineEmits(['on-press'])
</script>