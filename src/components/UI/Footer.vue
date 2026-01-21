<template>
    <ul class="flex items-center gap-2 w-full border-t border-border-primary h-14 text-text-primary fixed bottom-0 overflow-hidden"
        :class="{ 'pointer-events-none': isDisabled, '!border-border-primary': route.name === 'Post details' }">
        <li class="flex-1 h-full">
            <router-link class="flex items-center h-full" to="/feed">
                <svg v-if="route.name === 'Feed'" fill="none" class="mx-auto" width="27" viewBox="0 0 24 24" height="27"
                    aria-hidden="true">
                    <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
                        d="M12.63 1.724a1 1 0 0 0-1.26 0l-8 6.5A1 1 0 0 0 3 9v11a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-6h4v6a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V9a1 1 0 0 0-.37-.776l-8-6.5Z">
                    </path>
                </svg>
                <svg v-else fill="none" width="27" viewBox="0 0 24 24" height="27" aria-hidden="true" class="mx-auto">
                    <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
                        d="M11.37 1.724a1 1 0 0 1 1.26 0l8 6.5A1 1 0 0 1 21 9v11a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1v-5h-2v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 .37-.776l8-6.5ZM5 9.476V19h4v-5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5h4V9.476l-7-5.688-7 5.688Z">
                    </path>
                </svg>

            </router-link>
        </li>
        <li class="flex-1 h-full">
            <button @click="goToNotification" class="flex relative items-center w-full h-full">
                <svg v-if="route.name === 'Notifications'" fill="none" width="26" viewBox="0 0 24 24" height="26"
                    aria-hidden="true" class="mx-auto">
                    <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
                        d="M12 2a7.853 7.853 0 0 0-7.784 6.815l-1.207 9.053A1 1 0 0 0 4 19h3.354c.904 1.748 2.607 3 4.646 3 2.039 0 3.742-1.252 4.646-3H20a1 1 0 0 0 .991-1.132l-1.207-9.053A7.853 7.853 0 0 0 12 2Zm2.222 17H9.778c.61.637 1.399 1 2.222 1s1.613-.363 2.222-1Z">
                    </path>
                </svg>
                <svg v-else fill="none" class="mx-auto" width="26" viewBox="0 0 24 24" height="26" aria-hidden="true">
                    <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
                        d="M4.216 8.815a7.853 7.853 0 0 1 15.568 0l1.207 9.053A1 1 0 0 1 20 19h-3.354c-.904 1.748-2.607 3-4.646 3-2.039 0-3.742-1.252-4.646-3H4a1 1 0 0 1-.991-1.132l1.207-9.053ZM9.778 19c.61.637 1.399 1 2.222 1s1.613-.363 2.222-1H9.778ZM12 4a5.853 5.853 0 0 0-5.802 5.08L5.142 17h13.716l-1.056-7.92A5.853 5.853 0 0 0 12 4Z">
                    </path>
                </svg>
                <span v-show="unreadNotificationsCount > 0"
                    class="min-w-4 h-4 text-[10px] p-0.5 flex items-center justify-center rounded-3xl font-bold absolute top-[10px] right-[16px] bg-primary text-[#fff]">
                    {{ unreadNotificationsCount }}
                </span>
            </button>
        </li>
        
        <li class="flex-1 h-full">
            <router-link class="flex items-center h-full" to="/composer">
                <svg fill="none" v-if="route.name === 'Composer'" width="28" viewBox="0 0 24 24" height="28"
                    aria-hidden="true" class="mx-auto">
                    <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
                        d="M5 11a6 6 0 1 1 12 0 6 6 0 0 1-12 0Zm6-8a8 8 0 1 0 4.906 14.32l3.387 3.387a1 1 0 0 0 1.414-1.414l-3.387-3.387A8 8 0 0 0 11 3Zm4 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z">
                    </path>
                </svg>
                <svg v-else fill="none" class="mx-auto" width="28" viewBox="0 0 24 24" height="28" aria-hidden="true">
                    <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
                        d="M11 5a6 6 0 1 0 0 12 6 6 0 0 0 0-12Zm-8 6a8 8 0 1 1 14.32 4.906l3.387 3.387a1 1 0 0 1-1.414 1.414l-3.387-3.387A8 8 0 0 1 3 11Z">
                    </path>
                </svg>

            </router-link>
        </li>

        <li class="flex-1 h-full">
            <router-link class="flex items-center h-full" to="/chats">
                <svg v-if="route.name === 'Chats'" xmlns="http://www.w3.org/2000/svg" class="mx-auto"
                    fill="currentColor" width="28px" height="28px" viewBox="0 0 24 24">
                    <path
                        d="M12,21a8.937,8.937,0,0,0,4.8-1.4L21,21l-1.4-4.2A8.994,8.994,0,1,0,12,21ZM8,8.5h8a1,1,0,0,1,0,2H8a1,1,0,0,1,0-2Zm0,5h4a1,1,0,0,1,0,2H8a1,1,0,0,1,0-2Z" />
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" v-else class="mx-auto" fill="currentColor" width="25px"
                    height="25px" viewBox="0 0 24 24">
                    <path
                        d="M12,2a10,10,0,1,0,4.924,18.7l3.76,1.253A1.014,1.014,0,0,0,21,22a1,1,0,0,0,.948-1.316L20.7,16.924A9.988,9.988,0,0,0,12,2Zm6.653,15.121.766,2.3-2.3-.766a.994.994,0,0,0-.851.1,8.02,8.02,0,1,1,2.488-2.488A1,1,0,0,0,18.653,17.121ZM17,9.5a1,1,0,0,1-1,1H8a1,1,0,0,1,0-2h8A1,1,0,0,1,17,9.5Zm-4,5a1,1,0,0,1-1,1H8a1,1,0,0,1,0-2h4A1,1,0,0,1,13,14.5Z" />
                </svg>
            </router-link>
        </li>

        <li class="flex-1 h-full">
            <button class="flex items-center w-full h-full" @click="goToProfile(user)">
                <svg v-if="route.name === 'Profile'" fill="none" width="26" viewBox="0 0 24 24" height="26"
                    aria-hidden="true" class="mx-auto">
                    <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
                        d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Zm3-12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-3 10a7.976 7.976 0 0 1-5.714-2.4C7.618 16.004 9.605 15 12 15c2.396 0 4.383 1.005 5.714 2.6A7.976 7.976 0 0 1 12 20Z">
                    </path>
                </svg>
                <svg v-else fill="none" class="mx-auto" width="26" viewBox="0 0 24 24" height="26" aria-hidden="true">
                    <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"
                        d="M12 4a8 8 0 0 0-5.935 13.365C7.56 15.895 9.612 15 12 15c2.388 0 4.44.894 5.935 2.365A8 8 0 0 0 12 4Zm4.412 14.675C15.298 17.636 13.792 17 12 17c-1.791 0-3.298.636-4.412 1.675A7.96 7.96 0 0 0 12 20a7.96 7.96 0 0 0 4.412-1.325ZM2 12C2 6.477 6.477 2 12 2s10 4.477 10 10a9.98 9.98 0 0 1-3.462 7.567A9.965 9.965 0 0 1 12 22a9.965 9.965 0 0 1-6.538-2.433A9.98 9.98 0 0 1 2 12Zm10-4a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm-4 2a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z">
                    </path>
                </svg>
            </button>
        </li>
    </ul>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStore } from 'vuex';

const route = useRoute()
const router = useRouter()
const store = useStore()

const user = computed(() => store.getters.currentUser)
const unreadNotificationsCount = computed(() => store.getters?.unreadNotificationsCount || 0);

defineProps({
    isDisabled: {
        type: Boolean,
        default: false
    }
})

const goToProfile = (user) => {
    store.dispatch("addNewProfileFromProfiles", user)

    if (route?.params?.user_id !== user?._id) {
        router.push(`/profile/${user?._id}`)
    }
}

const goToNotification = () => {
    if (route.name === 'Notification') return
    else {
        if (unreadNotificationsCount.value) {
           // resetUnreadNotificationsCount()
        }
        router.push('/notifications')
    }
}
</script>