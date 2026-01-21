<template>
  <TransitionRoot as="template" :show="isOpen">
    <Dialog as="div" @close="closeModal" class="fixed inset-0 z-10 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen py-4 px-4 text-center sm:block sm:p-0">
        <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
          <DialogOverlay class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
        </TransitionChild>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <TransitionChild as="template" 
        enter="ease-out duration-300" 
        enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" 
        enter-to="opacity-100 translate-y-0 sm:scale-100" 
        leave="ease-in duration-200" 
        leave-from="opacity-100 translate-y-0 sm:scale-100" 
        leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
        
          <div class="inline-block bg-background-secondary rounded-[30px] text-left overflow-hidden shadow-xl transform transition-all">
            <div class="bg-white dark:bg-background-secondary px-6 pt-6 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div>
                  <DialogTitle as="h3" class="text-2xl leading-6 font-medium text-text-primary">{{ title }}</DialogTitle>
                  <div class="mt-3.5">
                    <p class="text-sm text-text-secondary">{{ message }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="px-4 py-3 pb-4 flex items-center justify-end">
              <button type="button" class="inline-flex outline-none justify-center rounded-md border border-transparent px-3 py-1.5 bg-transparent text-sm font-semibold text-link" @click="closeModal">{{ cancelText }}</button>

               <button type="button" class="inline-flex outline-none justify-center rounded-md border border-transparent px-3 py-1.5 bg-transparent text-sm font-semibold text-link" @click="confirm">{{ confirmText }}</button>
            </div>
          </div>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>

<script setup>
import { Dialog, DialogOverlay, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue';

const props = defineProps({
  isOpen: Boolean,
  title: String,
  message: String,
  cancelText: {
    type: String,
    default: 'Cancelar'
  },
  confirmText: {
    type: String,
    default: 'Confirmar'
  }
});

const emit = defineEmits(['close', 'confirm']);

const closeModal = () => {
  emit('close');
};

const confirm = () => {
  emit('confirm');
};
</script>
