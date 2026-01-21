<template>
    <h1>
        {{ conversation?.name }}
    </h1>
</template>


<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';


const store = useStore()
const conversation = computed(() => store.getters.currentConversation)

</script>