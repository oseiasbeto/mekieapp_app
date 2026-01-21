<template>
  <div class="min-h-screen bg-[#fafafa] dark:bg-dark-bg flex flex-col px-6 pt-8 pb-12">
    <!-- Botão Voltar -->
    <button @click="emit('back')" class="mb-10 flex items-center text-telegram-300 font-medium text-lg">
      <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
      </svg>
      Voltar
    </button>

    <!-- Título -->
    <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">
      Digite o código
    </h2>
    <p class="text-lg text-gray-600 dark:text-gray-400 mb-10">
      Enviamos um SMS para<br><span class="font-medium">+244 {{ maskedPhone }}</span>
    </p>

    <!-- INPUT 100% IGUAL AO DO TELEFONE -->
    <div class="mb-10">
      <div class="flex gap-3">
        <!-- Código fixo (opcional, só para manter o padrão visual) -->
        <div class="text-xl font-medium text-gray-700 dark:text-gray-400 select-none">
          Código
        </div>

        <div class="flex-ml-3 flex-1 relative">
          <input
            ref="codeInput"
            v-model="code"
            @focus="focused = true"
            @blur="focused = false"
            @keyup.enter="verify"
            type="text"
            inputmode="numeric"
            maxlength="5"
            placeholder="12345"
            class="w-full text-xl pl-1.5 font-normal tracking-widest text-gray-900 dark:text-white bg-transparent outline-none transition-colors duration-200 pb-4 placeholder-gray-400/70 selection:bg-[#33A8DF]/20"
            :class="focused
              ? 'border-b-2 border-telegram-400'
              : 'border-b-2 border-gray-300 dark:border-gray-700'"
            autocomplete="off"
          />
        </div>
      </div>
    </div>

    <!-- Feedback de erro/sucesso -->
    <div class="h-8 mb-12 text-center">
      <transition name="fade">
        <p v-if="error" class="text-red-500 text-base font-medium">
          {{ errorMessage }}
        </p>
      </transition>
    </div>

    <!-- Botão Continuar -->
    <div class="mt-auto">
      <button
        @click="verify"
        :disabled="code.length !== 5 || loading"
        class="w-full py-5 rounded-2xl text-lg font-bold transition-all duration-200 shadow-xl active:scale-95"
        :class="code.length === 5 && !loading
          ? 'bg-primary text-white hover:bg-telegram-500'
          : 'bg-gray-200 dark:bg-gray-800 text-gray-500 cursor-not-allowed'"
      >
        {{ loading ? 'Verificando...' : 'Enviar' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, computed, watch } from 'vue'
import { useStore } from 'vuex'

const props = defineProps({ phone: String })
const emit = defineEmits(['success', 'back'])

const store = useStore()
const code = ref('')
const loading = ref(false)
const error = ref(false)
const errorMessage = ref("")
const focused = ref(false)
const codeInput = ref(null)

const maskedPhone = computed(() => {
  if (!props.phone) return ''
  return props.phone.slice(-4).padStart(props.phone.length, '*')
})


const verify = async () => {
  if (code.value.length !== 5 || loading.value) return

  loading.value = true
  error.value = false

  try {
    const res = await store.dispatch('verifyCode', {
      phoneNumber: props.phone,
      code: code.value
    })

    emit('success', res)
  } catch (err) {
    console.log("aki")
    error.value = true
    errorMessage.value = 'Código inválido'
    code.value = ''
    nextTick(() => codeInput.value?.focus())

    setTimeout(() => {
      error.value = false
      errorMessage.value = ''
    }, 1000);
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  nextTick(() => codeInput.value?.focus())
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }
</style>