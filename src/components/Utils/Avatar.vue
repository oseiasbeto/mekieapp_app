<template>
    <div class="bg-background-secondary shrink-0 relative overflow-hidden rounded-full"
        :class="[sizeClasses]" role="img" :aria-label="`Avatar de ${altText || 'nome'}`">
        <img v-lazy="props?.url && props.url" :alt="`Avatar de ${altText || 'nome'}`" class=" w-full h-full object-cover"
            :class="[sizeClasses]" />
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';

// Props
const props = defineProps({
    url: {
        type: String,
        required: true,
        default: '',
    },
    altText: {
        type: String,
        default: 'Usuário',
    },
    size: {
        type: String,
        default: 'md',
        validator: (value) => ['xs', 'big', 'sm', 'md', 'lg'].includes(value),
    },
});

// Classes dinâmicas para tamanhos
const sizeClasses = computed(() => {
    return {
        xs: 'w-6 h-6',
        sm: 'w-8 h-8',
        md: 'w-[38px] h-[38px]',
        lg: 'w-[48px] h-[48px]',
        big: 'w-[90px] h-[90px]'
    }[props.size] || 'w-11 h-11';
});

</script>