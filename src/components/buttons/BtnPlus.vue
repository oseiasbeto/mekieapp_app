<template>
    <button
        class="flex fixed bottom-[70px] right-5 rounded-full bg-btn-plus bg-primary items-center justify-center w-[60px] h-[60px]"
        @click="onPress">
        <slot></slot>
    </button>
</template>
<script setup>

const emit = defineEmits(['onPress'])

const onPress = () => {
    emit('onPress')
}

</script>