<!-- views/AuthView.vue -->
<template>
  <div class="min-h-screen flex items-center w-screen">
    <div class="w-full">

      <!-- PASSO 0: Boas-vindas (Telegram style) -->
      <WelcomeStep v-if="step === 0" @next="step = 1" />

      <!-- PASSO 1: Telefone com validação angolana -->
      <PhoneStep v-if="step === 1" @next="handlePhone" @back="step = 0" />

      <!-- PASSO 2: Código -->
      <CodeStep v-if="step === 2" :phone="phone" @success="handleCompleteProfile" @back="step = 1" />

      <!-- PASSO 3: Completar perfil -->
      <CompleteProfile v-if="step === 3" @done="goHome" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import WelcomeStep from '../components/WelcomeStep.vue'
import PhoneStep from '../components/PhoneStep.vue'
import CodeStep from '../components/CodeStep.vue'
import CompleteProfile from '../components/CompleteProfile.vue'

const router = useRouter()
const store = useStore()

const step = ref(0)
const phone = ref('')

onMounted(() => {
  if (store.state.token) router.push('/chats')
})

const handlePhone = (phoneNumber) => {
  phone.value = phoneNumber
  step.value = 2
}

const handleCompleteProfile = () => {
  step.value = 3
}

const goHome = () => router.push('/chats')
</script>