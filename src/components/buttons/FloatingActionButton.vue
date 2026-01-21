<template>
  <!-- Botão Flutuante do Telegram -->
  <transition enter-active-class="transition ease-out duration-300"
    enter-from-class="transform translate-y-16 opacity-0 scale-75"
    enter-to-class="transform translate-y-0 opacity-100 scale-100" leave-active-class="transition ease-in duration-200"
    leave-from-class="transform translate-y-0 opacity-100 scale-100"
    leave-to-class="transform translate-y-16 opacity-0 scale-75">
    <button v-if="showFab" 
      @click="$emit('new-chat')" 
      class="fixed bottom-6 right-6 z-50 flex items-center justify-center
             w-16 h-16 
             text-white rounded-full 
             focus:outline-none"
             style="background-image: linear-gradient(135deg, rgb(90, 113, 250), rgb(0, 133, 255));
"
             >
      <!-- Ícone de lápis (exato do Telegram) -->
      <slot name="icon"></slot>
    </button>
  </transition>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

defineEmits(['new-chat'])

const showFab = ref(true)
let scrollContainer = null

const handleScroll = () => {
  if (!scrollContainer) return
  const scrolled = scrollContainer.scrollTop > 100
  showFab.value = !scrolled
}

onMounted(() => {
  // Detecta automaticamente o container com rolagem (DynamicScroller, div com overflow, etc.)
  scrollContainer = document.querySelector('.scroller')
    || document.querySelector('.vue-recycle-scroller')
    || document.querySelector('[class*="overflow"]')
    || window

  if (scrollContainer && scrollContainer !== window) {
    scrollContainer.addEventListener('scroll', handleScroll)
  } else {
    window.addEventListener('scroll', handleScroll)
  }

  // Valor inicial
  handleScroll()
})

onUnmounted(() => {
  if (scrollContainer && scrollContainer !== window) {
    scrollContainer.removeEventListener('scroll', handleScroll)
  } else {
    window.removeEventListener('scroll', handleScroll)
  }
})
</script>