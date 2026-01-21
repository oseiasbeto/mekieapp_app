<script setup>
const props = defineProps({
    title: {
        type: String,
        required: true
    },
    error: {
        show: {
            type: Boolean,
            default: false
        },
        message: {
            type: String,
            default: ""
        }
    },
    label: {
        type: String,
        required: true
    },
    options: {
        type: Array,
        required: true
    }
})

const inputValue = defineModel()
</script>

<template>
    <div class="relative select-none h-14 w-full">
        <!-- Select -->
        <select :id="props.label" v-model="inputValue"
            class="peer w-full h-full pt-3 px-3 text-sm border border-gray-300 rounded-[4px] focus:border-gray-500 focus:border-2 outline-none transition-all text-gray-700 placeholder-transparent pr-10 appearance-none"
            required>
            <option value="" disabled selected hidden>{{ props.title }}</option>
            <option v-for="option in props.options" :key="option" :value="option.value">{{ option.label }}</option>
        </select>

        <!-- Custom Icon for Dropdown -->
        <div class="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg viewBox="0 0 24 24" aria-hidden="true" class="w-5 h-5 text-gray-500 peer-focus:text-gray-500">
                <g>
                    <path fill="currentColor"
                        d="M3.543 8.96l1.414-1.42L12 14.59l7.043-7.05 1.414 1.42L12 17.41 3.543 8.96z"></path>
                </g>
            </svg>
        </div>

        <!-- Label flutuante -->
        <label :for="props.label" class="absolute pointer-events-none left-3 top-4 text-gray-500 text-base transition-all 
            peer-placeholder-shown:top-[14px] peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 
            peer-focus:top-2 peer-focus:text-xs peer-focus:text-gray-500 
            peer-valid:top-2 peer-valid:text-xs peer-valid:text-gray-500">
            {{ props.title }}
        </label>

        <!-- Error message -->
        <div v-if="props.error.show" class="text-red-500 text-sm mt-1">
            {{ props.error.message }}
        </div>
    </div>
</template>
