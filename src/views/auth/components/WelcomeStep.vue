<!-- components/auth/WelcomeStep.vue -->
<template>
  <div class="min-h-screen w-full px-8 bg-gradient-to-b flex flex-col items-center justify-center">
    <!-- Logo grande do Telegram (mas com nossas cores -->
    <div class="mb-12  relative">
      <div class="w-48 h-48 bg-primary rounded-full flex items-center justify-center shadow-2xl">
        <!-- Ícone do avião de papel (Telegram oficial) -->
        <svg class="w-28 h-28 text-white drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.944 0zm4.962 8.875l-2.23 10.506c-.166.763-.602.94-1.215.577l-3.394-2.502-1.635 1.574c-.181.18-.332.12-.382-.136l-1.162-5.58 4.47-4.046c.194-.176.09-.497-.17-.45l-5.52 1.987c-.76.273-1.12.395-1.536.12l-2.33-.97c-.87-.363-.65-1.44.33-1.44l11.09-.004c.72 0 1.04.324.98.91z"/>
        </svg>
      </div>

      <!-- Anel de brilho sutil (igual Telegram) -->
      <div class="absolute -inset-4 bg-primary rounded-full opacity-20 blur-3xl animate-pulse"></div>
    </div>

    <!-- Título -->
    <h1 class="text-4xl font-extrabold text-white mb-3 tracking-tight">
      MekieApp
    </h1>

    <!-- Subtítulo -->
    <p class="text-lg text-gray-300 mb-12 leading-relaxed max-w-xs">
      O mensageiro mais rápido, seguro e angolano que existe MekieApp
    </p>

    <!-- Botão principal (exatamente como Telegram) -->
    <button
      @click="emit('next')"
      class="w-full max-w-sm bg-primary text-white font-semibold text-lg py-4 rounded-2xl shadow-lg transform transition-all duration-200 active:scale-95 focus:outline-none focus:ring-4"
    >
      Começar a Mensagem
    </button>

    <!-- Texto pequeno no rodapé (opcional, igual Telegram) -->
    <p class="mt-8 text-xs text-gray-500">
      Ao continuar, você aceita nossos
      <span class="text-text-secondary">Termos de Serviço</span>
    </p>
  </div>
</template>

<script setup>
const emit = defineEmits(['next'])
</script>

<style scoped>
/* Animação suave do anel de brilho */
@keyframes pulse {
  0%, 100% { opacity: 0.2; transform: scale(1); }
  50% { opacity: 0.35; transform: scale(1.05); }
}
</style>