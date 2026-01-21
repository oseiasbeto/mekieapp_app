<template>
    <h1>Recompensas</h1>

    <button :disabled="loading" @click="openRewardsAd">
        {{ loading ? 'Aguarde o anuncio esta carregando...' : 'Obter Recompensas' }}
    </button>
</template>


<script setup>

import { ref } from "vue";
import {
    rewardsAd,
} from "webtonative/AdMob";


const loading = ref(false)

const openRewardsAd = () => {
    loading.value = true
    rewardsAd({
        adId: "ca-app-pub-3940256099942544/5224354917",
        rewardsAdCallback: (value) => {
            
            const status = value.status

            // Trata o status do anúncio de recompensas
            if(status === "success") {
                loading.value = false
            }

            if(status === 'adDismissed') {
                loading.value = false
            }

            if(status === 'adLoadFailure') {
                loading.value = false   
            }
            if(status === 'rewardSuccess') {
                alert("Recompensa concedida!")
                loading.value = false
            }
        }
    })
}
</script>