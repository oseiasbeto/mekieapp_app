<template>
  <!-- Skeleton (exibir com v-if="loading" ou v-if="!user") -->
  <div class="flex items-center animate-pulse">
    <!-- Avatar Skeleton -->
    <div class="relative flex-shrink-0">
      <div class="w-[40px] h-[40px] bg-background-secondary rounded-full"></div>
    </div>

    <!-- Textos Skeleton -->
    <div class="flex-1 ml-3 space-y-2">
      <div class="flex items-center justify-between gap-3">
        <!-- Nome -->
        <div class="h-3 bg-background-secondary rounded w-[130px]"></div>
        
      </div>

      <!-- Bio / username -->
      <div class="h-3 bg-background-secondary rounded w-[90%]"></div>
    </div>
  </div>
</template>

<script setup>
// Não precisa de nada aqui — é só um componente visual
</script>

<style scoped>
/* Shimmer opcional (mais bonito que o animate-pulse padrão) */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Se quiser shimmer de verdade (tipo Telegram Web) */
.bg-skeleton {
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
</style>