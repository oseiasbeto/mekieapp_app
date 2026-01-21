<template>
  <div :class="[
    'fixed inset-0 z-50',
    isOpen ? 'block bg-opacity-50' : 'hidden bg-opacity-0',
    overlayClass,
  ]" @click.self="close">
    <div ref="DrawerRef" :class="[
      'absolute bottom-0 left-0 right-0 bg-background-secondary rounded-tr-2xl rounded-tl-2xl',
      costumClass,
      isOpen ? 'animate-slide-up' : 'animate-slide-down',
    ]" :style="{
        transform: `translateY(${translateY}px)`,
        transition: isDragging ? 'none' : 'transform 0.3s ease-in-out',
      }" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
      <div class="flex justify-center pt-3 py-2">
        <div class="w-12 h-1.5 bg-background-tertiary rounded-full"></div>
      </div>
      <div class="relative">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  isOpen: Boolean,
  overlayClass: {
    type: String,
    default: "bg-black transition-bg-opacity duration-300"
  },
  costumClass: String,
})

const emit = defineEmits(['close'])

const DrawerRef = ref(null)
const isDragging = ref(false)
const startY = ref(0)
const translateY = ref(0)
const maxTranslateY = ref(0)

const handleTouchStart = (e) => {
  isDragging.value = true
  startY.value = e.touches[0].clientY
  maxTranslateY.value = DrawerRef.value.offsetHeight
}

const handleTouchMove = (e) => {
  if (isDragging.value) {
    const deltaY = e.touches[0].clientY - startY.value
    translateY.value = Math.max(0, Math.min(deltaY, maxTranslateY.value))
  }
}

const handleTouchEnd = (e) => {
  isDragging.value = false
  if (translateY.value > maxTranslateY.value / 2) {
    close()
  } else {
    translateY.value = 0
  }
}

const close = () => {
  emit('close')
  translateY.value = 0
}
</script>

<style>
.animate-slide-up {
  animation: slide-up 0.3s ease-in-out;
}

.animate-slide-down {
  animation: slide-down 0.3s ease-in-out;
}

@keyframes slide-up {
  from {
    transform: translateY(100%);
  }

  to {
    transform: translateY(0);
  }
}

@keyframes slide-down {
  from {
    transform: translateY(0);
  }

  to {
    transform: translateY(100%);
  }
}
</style>
