<template>
    <div v-if="props.status !== 'online'" :class="['bg-background-primary text-[11px] py-1.5 text-center', props.status == 'offline' ? 'text-danger' : 'text-text-secondary']">
        {{ textContent }}
    </div>
</template>

<script setup>
import { computed } from 'vue';

   const props = defineProps({
        status: {
            type: String,
            default: 'online'
        }
    })

    const textContent = computed(() => {
        if(props?.status === 'offline') return 'Sem ligação à internet'
        else return ''
    })
</script>