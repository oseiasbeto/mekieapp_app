<template>
  <div class="loader border-[2px] border-primary"></div>
</template>

<style scoped>
.loader {
  width: 20px;
  height: 20px;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 0.5s linear infinite;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>