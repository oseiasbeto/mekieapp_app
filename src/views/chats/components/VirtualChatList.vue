<template>
  <div class="h-screen flex flex-col">
    <!-- O DynamicScroller PRECISA ser o elemento raiz do scroll -->
    <DynamicScroller 
      :items="conversations" 
      :min-item-size="80" 
      :key="[conversations?.length, conversations?.last_message]"
      :class="!loading ? 'scroller' : 'overflow-hidden'"
      key-field="_id" 
      @scroll="handleScrollEvent" 
      ref="virtualChatListScroller"
      >

      <!-- HEADER FORA do scroll -->
      <template #before>
        <slot name="before-content"></slot>
        <!-- Loading -->
        <div v-if="loading">
          <ChatSkeleton v-for="n in 8" :key="n" />
        </div>
      </template>

      <!-- ITENS -->
      <template #default="{ item, active }">
        <DynamicScrollerItem 
          :item="item" 
          :active="active" 
          class="scroller-item">
          <ChatListItem 
          :conversation="item"
          :user-id="userId" 
          @click="$emit('select', item)" 
          @more-options="handleMoreOptions"
          />
        </DynamicScrollerItem>
      </template>

      <!-- LOAD MORE -->
      <template #after>
        <div ref="loadTrigger" v-if="hasMore || loadingMore" class="load-more-container flex justify-center my-5">
          <SpinnerSmall />
        </div>
      </template>
    </DynamicScroller>

    <!-- BOTÃO FLUTUANTE DO TELEGRAM -->
    <FloatingActionButton v-show="!loading && showBtnFloating" @new-chat="$emit('new-chat')">
      <template #icon>
        <svg fill="none" viewBox="0 0 24 24" width="24" height="24">
          <path fill="#FFFFFF" fill-rule="evenodd" clip-rule="evenodd"
            d="M12 3a1 1 0 0 1 1 1v7h7a1 1 0 1 1 0 2h-7v7a1 1 0 1 1-2 0v-7H4a1 1 0 1 1 0-2h7V4a1 1 0 0 1 1-1Z"></path>
        </svg>
      </template>
    </FloatingActionButton>
  </div>
</template>

<script setup>
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';
import { useIntersectionObserver } from '@vueuse/core';
import ChatListItem from './ChatListItem.vue';
import ChatSkeleton from './ChatSkeleton.vue';
import { ref } from 'vue';
import FloatingActionButton from '@/components/buttons/FloatingActionButton.vue';
import SpinnerSmall from '@/components/UI/SpinnerSmall.vue';

defineProps({
  conversations: Array,
  loading: Boolean,
  loadingMore: Boolean,
  userId: String,
  source: String,
  hasMore: Boolean,
  showBtnFloating: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['select', 'on-scroll', 'more-options', 'new-chat', 'load-more']);

const loadTrigger = ref(null);
const virtualChatListScroller = ref(null);

useIntersectionObserver(
  loadTrigger,
  ([{ isIntersecting }]) => {
    if (isIntersecting) {
      emit('load-more');
    }
  }
);

const setScrollTop = (position) => {
  const scrollElement = virtualChatListScroller.value?.$el;
  if (scrollElement) {

    scrollElement.scrollTop = position;
  }
};


const handleScrollEvent = (event) => {
  const scrollElement = event.target;

  if (scrollElement) {
    emit('on-scroll', scrollElement.scrollTop)
  }
};

const handleMoreOptions = conv => {
  emit('more-options', conv)
}

// Expõe a função para o componente pai
defineExpose({
  setScrollTop
});
</script>