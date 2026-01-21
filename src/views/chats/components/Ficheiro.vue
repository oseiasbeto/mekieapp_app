<template>
  <div class="p-4 border-b border-gray-200">
    <div class="flex items-center mb-2">
      <img :src="message.sender.avatar" alt="Avatar" class="w-10 h-10 rounded-full mr-2" />
      <span class="text-sm font-medium">{{ message.sender.name }}</span>
    </div>
    <div class="text-gray-700 mb-2">{{ message.text }}</div>
    <div class="flex items-center">
      <button
        v-for="reaction in visibleReactions"
        :key="reaction.emoji"
        @click="react(message._id, reaction.emoji)"
        class="mr-2 px-2 py-1 rounded-full text-sm bg-gray-100 hover:bg-gray-200"
        :class="{ 'bg-blue-500 text-white': isReacted(message._id, reaction.emoji) }"
      >
        {{ reaction.emoji }} {{ reaction.count }}
      </button>
      <button @click="toggleReactionPicker(message._id)" class="text-gray-500 hover:text-gray-700">
        <i class="fas fa-smile"></i>
      </button>
      <div v-if="showReactionPicker === message._id" class="absolute bg-white p-2 rounded-lg shadow-lg">
        <div class="flex flex-wrap">
          <button
            v-for="reaction in allReactions"
            :key="reaction.emoji"
            @click="react(message._id, reaction.emoji)"
            class="mx-1 px-2 py-1 rounded-full text-sm bg-gray-100 hover:bg-gray-200"
          >
            {{ reaction.emoji }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import io from 'socket.io-client';

const props = defineProps({
  message: Object
});

const allReactions = ref([
  { emoji: '👍', count: 0 },
  { emoji: '❤️', count: 0 },
  { emoji: '😂', count: 0 },
  { emoji: '😍', count: 0 },
  { emoji: '😮', count: 0 },
  { emoji: '😠', count: 0 },
  { emoji: '😢', count: 0 },
  { emoji: '😊', count: 0 },
  { emoji: '😎', count: 0 },
  { emoji: '🤔', count: 0 },
  { emoji: '👏', count: 0 },
  { emoji: '🙏', count: 0 }
]);

const visibleReactions = computed(() => {
  return allReactions.value.slice(0, 5);
});

const showReactionPicker = ref(null);

const socket = io('http:                   

const react = (messageId, emoji) => {
  socket.emit('reaction', { messageId, emoji, userId: 'user1' });
};

const isReacted = (messageId, emoji) => {
  return props.message.reactions.find((reaction) => reaction.emoji === emoji && reaction.user === 'user1');
};

const toggleReactionPicker = (messageId) => {
  showReactionPicker.value = showReactionPicker.value === messageId ? null : messageId;
};

onMounted(() => {
  socket.on('reaction', (data) => {
    const message = props.message;
    if (message._id === data.messageId) {
      const existingReaction = message.reactions.find((reaction) => reaction.emoji === data.emoji);
      if (existingReaction) {
        existingReaction.count++;
      } else {
        message.reactions.push({ emoji: data.emoji, count: 1, user: data.userId });
      }
    }
  });
});
</script>
