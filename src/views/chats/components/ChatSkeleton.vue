<template>
  <div class="flex w-full items-center px-4 py-2 gap-3 animate-pulse">
    <!-- Avatar skeleton -->
    <div class="relative flex-shrink-0">
      <div class="w-[52px] h-[52px] bg-background-secondary rounded-full"></div>
      
    </div>

    <!-- Conteúdo -->
    <div class="flex-1 space-y-2">
      <div class="flex items-center justify-between gap-3">
        <!-- Nome -->
        <div class="h-[14px] w-[120px] bg-background-secondary rounded-lg"></div>
      
      </div>

      <div class="flex items-center justify-between gap-3">
        <!-- Última mensagem -->
        <div class="h-3 w-[80%] bg-background-secondary rounded-lg"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Nada necessário aqui – é 100% estático
</script>

<style scoped>
/* Animação suave do pulse (melhor que a padrão do Tailwind em alguns casos) */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
.animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
</style>