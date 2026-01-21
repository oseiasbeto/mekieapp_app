<template>
    <div class="h-screen flex flex-col">
        <DynamicScroller 
        :items="users" 
        :min-item-size="72" 
        :class="!loading ? 'scroller' : 'overflow-hidden'" 
        :key="ukey || undefined" 
        ref="virtualUsersListScroller"
        key-field="_id"
        >
            <template #before>
                <slot name="before-content"></slot>
                <div v-if="loading" class="px-4 py-3 space-y-3">
                    <UserSkeleton v-for="n in 8" :key="n" />
                </div>
            </template>

            <template #default="{ item, active }">
                <DynamicScrollerItem :item="item" :active="active" :size-dependencies="[item.created_at, item._id]">
                    <UserItem :user="item" @click="$emit('select', item)" />
                </DynamicScrollerItem>
            </template>

            <!-- LOAD MORE -->
            <template #after>
                <div ref="loadTrigger" v-if="hasMore || loadingMore"
                    class="load-more-container flex justify-center my-5">
                    <SpinnerSmall />
                </div>
            </template>
        </DynamicScroller>
    </div>
</template>

<script setup>
import { DynamicScroller, DynamicScrollerItem } from 'vue-virtual-scroller';
import { useIntersectionObserver } from '@vueuse/core';
import { ref } from 'vue';
import UserSkeleton from './UserSkeleton.vue';
import UserItem from './UserItem.vue';
import SpinnerSmall from '@/components/UI/SpinnerSmall.vue';

defineProps({
    users: Array,
    loading: Boolean,
    loadingMore: Boolean,
    hasMore: Boolean,
    ukey: String
});

const emit = defineEmits(['select', 'load-more']);

const loadTrigger = ref(null);
const virtualUsersListScroller = ref(null)


const setScrollTop = (position) => {
  const scrollElement = virtualUsersListScroller.value?.$el;
  if (scrollElement) {

    scrollElement.scrollTop = position;
  }
};

useIntersectionObserver(
    loadTrigger,
    ([{ isIntersecting }]) => {
        if (isIntersecting) {
            emit('load-more');
        }
    }
);

const handleScroll = (event) => {
  const scrollElement = event.target;

  if (scrollElement) {
    emit('on-scroll', scrollElement.virtualUsersListScroller)
  }
};


// Expõe a função para o componente pai
defineExpose({
  setScrollTop
});
</script>