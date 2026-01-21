<template>
  <div @click="$emit('click')" class="flex items-center px-4 py-3.5 cursor-pointer transition-all duration-200
           hover:bg-background-tertiary">
    <!-- Avatar com status online -->
    <div class="relative flex-shrink-0">
      <Avatar :url="user?.profile_image?.url || '/default-avatar.png'" size="md" class="w-12 h-12" alt="" />
    </div>

    <!-- Conteúdo -->
    <div class="flex-1 ml-3 min-w-0">
      <div class="flex items-center w-full gap-[1px]">
        <!-- Nome -->
        <h3 class="text-base font-medium text-text-primary truncate leading-5">
          {{ user.name || user.username }}
        </h3>

        <!--celo de verificacao-->
        <div v-if="user?.is_verified" class="shrink-0 flex-1 justify-start">
          <svg class="ml-[5px] mt-0.5" fill="none" width="14" viewBox="0 0 24 24" height="14">
            <circle cx="12" cy="12" r="11.5" fill="#0F73FF"></circle>
            <path fill="#fff" fill-rule="evenodd" clip-rule="evenodd"
              d="M17.659 8.175a1.361 1.361 0 0 1 0 1.925l-6.224 6.223a1.361 1.361 0 0 1-1.925 0L6.4 13.212a1.361 1.361 0 0 1 1.925-1.925l2.149 2.148 5.26-5.26a1.361 1.361 0 0 1 1.925 0Z">
            </path>
          </svg>
        </div>
      </div>

      <!-- Bio ou username -->
      <span v-if="user?.bio" class="text-xs text-text-secondary whitespace-nowrap">
        @{{ user.bio }}
      </span>
    </div>
  </div>
</template>

<script setup>
//import { computed } from 'vue'
import Avatar from '@/components/Utils/Avatar.vue'

defineEmits(['click'])

const props = defineProps({
  user: {
    type: Object,
    required: true
  }
})
</script>

<style scoped></style>