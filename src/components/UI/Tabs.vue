<template>
  <div class="sticky top-0 bg-light-bg dark:bg-dark-bg">
    <div ref="tabsContainer"
      class="flex px-4 border-b gap-4 border-light-border dark:border-dark-border overflow-x-auto scrollbar-hide whitespace-nowrap">
      <div v-for="(tab, index) in tabs" :key="index" class="relative flex-1">
        <button @click="selectTab(index, tab.value)"
          class="py-3 w-full font-semibold text-light-text-secondary dark:text-dark-text-light text-sm"
          :class="{ '!text-light-text-primary dark:!text-dark-text-primary': activeTab === tab.value }">
          {{ tab.label }}
          <!-- Borda estática apenas na tab ativa -->
          <div v-if="activeTab === tab.value" class="absolute bottom-0 left-0 right-0 h-[2px] bg-primary"></div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

const props = defineProps({
  tabs: {
    type: Array,
    required: true,
    validator: (value) => value.every(item => 'label' in item)
  },
  modelValue: {
    type: String,
    default: 'feed'
  }
})

const emit = defineEmits(['update:modelValue'])

const tabsContainer = ref(null)
const activeTab = ref(props.modelValue)

const setTab = (index, value) => {
  activeTab.value = value;
  emit('update:modelValue', value);

  setScrollToTab(index);
};

const selectTab = async (index, value) => {
  activeTab.value = value
  emit('update:modelValue', value)
  await nextTick()
  scrollToTab(index)
}

const setScrollToTab = (index) => {
  if (!tabsContainer.value) return;
  
  const container = tabsContainer.value;
  const tabs = container.querySelectorAll('.relative');
  const selectedTab = tabs[index];
  
  if (!selectedTab) return;
  
  const containerWidth = container.clientWidth;
  const tabLeft = selectedTab.offsetLeft;
  const tabWidth = selectedTab.clientWidth;
  const scrollLeft = tabLeft - (containerWidth / 2) + (tabWidth / 2);
  
  // Scroll imediato sem animação
  container.scrollLeft = scrollLeft;
};

const scrollToTab = (index) => {
  if (!tabsContainer.value) return

  const container = tabsContainer.value
  const tabs = container.querySelectorAll('.relative')
  const selectedTab = tabs[index]

  if (!selectedTab) return

  const containerWidth = container.clientWidth
  const tabLeft = selectedTab.offsetLeft
  const tabWidth = selectedTab.clientWidth
  const scrollLeft = tabLeft - (containerWidth / 2) + (tabWidth / 2)

  container.scrollTo({
    left: scrollLeft,
    behavior: 'smooth'
  })
}

onMounted(() => {
  scrollToTab(0)
})

// Expõe a função para o componente pai
defineExpose({
  setTab
});
</script>

<style>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>