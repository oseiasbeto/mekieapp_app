<template>
  <div class="min-h-screen bg-[#fafafa] dark:bg-dark-bg flex flex-col px-6 pt-8 pb-12">
    <!-- Botão Voltar (opcional – se quiser manter o fluxo consistente) -->
    <!-- <button @click="$router.back()" class="mb-10 flex items-center text-[#33A8DF] font-medium text-lg">
      <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
      </svg>
      Voltar
    </button> -->

    <!-- Título -->
    <h2 class="text-3xl font-extrabold text-gray-900 dark:text-white mb-3">
      Como você se chama?
    </h2>
    <p class="text-lg text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
      Escolha um nome que aparecerá para seus contatos
    </p>

    <!-- Input EXATAMENTE IGUAL ao PhoneStep.vue -->
    <div class="mb-10">
      <div class="flex gap-3">
        <!-- Ícone de pessoa (opcional, mas fica lindo e consistente) -->
        <div class="text-xl font-medium text-gray-700 dark:text-gray-400 select-none pt-1">
          
        </div>

        <div class="flex-1 relative">
          <input
            v-model="name"
            @focus="focused = true"
            @blur="focused = false"
            @keyup.enter="save"
            type="text"
            placeholder="Seu nome"
            class="w-full text-xl pl-1.5 font-normal tracking-wider text-gray-900 dark:text-white bg-transparent outline-none transition-colors duration-200 pb-4 placeholder-gray-400/70 selection:bg-[#33A8DF]/20"
            :class="focused
              ? 'border-b-2 border-primary'
              : 'border-b-2 border-gray-300 dark:border-gray-700'"
            autocomplete="name"
          />
        </div>
      </div>
    </div>

    <!-- Feedback sutil (opcional) -->
    <div class="h-8 mb-12">
      <p v-if="!name.trim() && name.length > 0" class="text-red-500 text-base">
        O nome não pode estar vazio
      </p>
    </div>

    <!-- Botão Continuar (flutuante, igual às outras telas) -->
    <div class="mt-auto">
      <button
        @click="save"
        :disabled="!name.trim() || loading"
        class="w-full py-5 rounded-2xl text-xl font-bold transition-all duration-200 shadow-xl active:scale-95"
        :class="name.trim()
          ? 'bg-primary text-white'
          : 'bg-gray-200 dark:bg-gray-800 text-gray-500 cursor-not-allowed'"
      >
        Continuar →
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useStore } from 'vuex'

const emit = defineEmits(['done'])
const loading = ref(false)
const name = ref('')
const focused = ref(false)
const store = useStore()

const save = async () => {
  if (!name.value.trim()) return

  try {
    loading.value = true
    await store.dispatch("completeProfile", {
      name: name.value.trim()
    })
    emit('done')
  } catch (err) {
    console.log(err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* Reaproveita a mesma animação de fade das outras telas */
.fade-enter-active,
.fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from,
.fade-leave-to { opacity: 0; }
</style>