<!-- components/auth/PhoneStep.vue -->
<template>
  <div class="min-h-screen bg-[#fafafa] dark:bg-dark-bg flex flex-col px-6 pt-8 pb-12">
    <!-- Botão Voltar -->
    <button @click="emit('back')" class="mb-10 flex items-center text-primary font-medium text-lg">
      <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
      </svg>
      Voltar
    </button>

    <!-- Título e subtítulo -->
    <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">
      Seu número de telefone
    </h2>
    <p class="text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
      Por favor, confirme seu país e insira seu número de telefone.
    </p>

    <!-- Input com +244 fixo ao lado + borda só azul quando focado -->
    <div class="mb-10">
      <div class="flex  gap-3">
        <!-- Código do país fixo -->
        <div class="text-xl mr-1 border-b-2 border-gray-300 dark:border-gray-700 font-medium text-gray-700 dark:text-gray-400 select-none">
          +244
        </div>

        <!-- Input com borda dinâmica (cinza → azul só no foco) -->
        <div class="flex-1 relative">
          <input ref="inputRef" :value="displayValue" @input="handleInput" @focus="focused = true"
            @blur="focused = false" @keydown.enter="trySubmit" @keydown.arrow-right="trySubmit" type="tel"
            inputmode="numeric" maxlength="11" placeholder="923 456 789"
            class="w-full text-xl pl-1.5 font-normal tracking-widest text-gray-900 dark:text-white bg-transparent outline-none transition-colors duration-200 pb-4 placeholder-gray-400/70 selection:bg-[#33A8DF]/20"
            :class="focused
              ? 'border-b-2 border-primary'
              : 'border-b-2 border-gray-300 dark:border-gray-700'" autocomplete="off" />
        </div>
      </div>
    </div>

    <!-- Feedback em tempo real -->
    <div class="h-8 mb-12">
      <transition name="fade">
        <p v-if="error" class="text-red-500 text-lg font-medium animate-pulse">
          {{ error }}
        </p>
        <p v-else-if="rawDigits.length === 9" class="text-green-500 text-lg font-medium">
          Número válido
        </p>
        <p v-else-if="rawDigits.length > 0" class="text-gray-500 text-lg">
          Digite os 9 dígitos do seu número
        </p>
      </transition>
    </div>

    <!-- Botão Continuar -->
    <div class="mt-auto">
      <button @click="sendCode" :disabled="!isValid"
        class="w-full py-5 rounded-2xl  text-lg font-bold transition-all duration-200 shadow-xl" :class="isValid
          ? 'bg-primary text-white active:scale-95'
          : 'bg-gray-200 dark:bg-gray-800 text-gray-500 cursor-not-allowed'">
        Continuar
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { useStore } from 'vuex'

const emit = defineEmits(['next', 'back'])
const inputRef = ref(null)
const store = useStore()
const focused = ref(false)  // controla a cor da borda

const rawDigits = ref('')

// Máscara visual
const displayValue = computed(() => {
  const d = rawDigits.value
  if (!d) return ''
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`
})

const error = ref('')
const validate = () => {
  if (rawDigits.value.length === 0) {
    error.value = ''
    return
  }
  if (rawDigits.value.length !== 9) {
    error.value = rawDigits.value.length < 9 ? '' : 'Número inválido'
    return
  }
  const prefix = rawDigits.value.slice(0, 2)
  const valid = ['91', '92', '93', '94', '95', '96', '97', '98', '99']
  error.value = valid.includes(prefix) ? '' : 'Operadora não suportada'
}

const isValid = computed(() => {
  return rawDigits.value.length === 9 && !error.value
})

const handleInput = (e) => {
  let value = e.target.value.replace(/\D/g, '')
  if (value.startsWith('0')) value = value.substring(1)
  rawDigits.value = value.substring(0, 9)
  validate()
}

const trySubmit = () => {
  if (isValid.value) sendCode()
}

const sendCode = () => {
  if (!isValid.value) return
  store.dispatch("sendPhone", rawDigits.value)
  emit('next', rawDigits.value)
}

onMounted(() => {
  nextTick(() => inputRef.value?.focus())
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>