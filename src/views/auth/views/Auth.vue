<template>
  <div>
    <!-- Botão personalizado -->
    <button 
      @click="handleCustomButtonClick"
      :disabled="loading"
      class="custom-google-button"
    >
      <svg class="google-icon" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      <span>{{ loading ? 'Entrando...' : 'Continuar com Google' }}</span>
    </button>
    
    <!-- Elemento oculto para o botão nativo do Google -->
    <div ref="googleButtonRef" class="hidden-button"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const googleButtonRef = ref(null);
const loading = ref(false);

// Substitua pelo seu ID de cliente
const CLIENT_ID = '914842748542-mc9j2ltt0no88mqlu144u1q1hu19lhq1.apps.googleusercontent.com';

// Função para decodificar JWT
const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Erro ao decodificar JWT:', e);
    return null;
  }
};

// Handler para a resposta do Google
const handleGoogleResponse = (response) => {
  loading.value = false;
  
  if (response.credential) {
    const userData = parseJwt(response.credential);
    console.log('Dados do usuário:', userData);
    
    // Aqui você envia para seu backend
    // Exemplo: enviarParaBackend(userData);
    
    // Emitir evento se necessário
    // emit('google-auth-success', userData);
  }
};

// Clica programaticamente no botão nativo do Google
const triggerNativeGoogleButton = () => {
  if (!googleButtonRef.value) return false;
  
  // Procura o botão do Google dentro do elemento
  const googleButton = googleButtonRef.value.querySelector('div[role="button"]');
  
  if (googleButton) {
    googleButton.click();
    return true;
  }
  
  return false;
};

// Handler para o botão personalizado
const handleCustomButtonClick = async () => {
  if (loading.value) return;
  
  loading.value = true;
  
  // Tenta clicar no botão nativo do Google
  const success = triggerNativeGoogleButton();
  
  // Se não encontrar o botão, tenta inicializar novamente
  if (!success) {
    console.log('Botão Google não encontrado, inicializando...');
    await initializeGoogleButton();
    
    // Tenta novamente após inicializar
    setTimeout(() => {
      triggerNativeGoogleButton();
    }, 100);
  }
};

// Inicializa o botão do Google (oculto)
const initializeGoogleButton = () => {
  return new Promise((resolve) => {
    if (!window.google?.accounts?.id) {
      console.error('Google API não carregada');
      loading.value = false;
      resolve(false);
      return;
    }

    // Limpa o conteúdo anterior
    if (googleButtonRef.value) {
      googleButtonRef.value.innerHTML = '';
    }

    // Inicializa a API do Google
    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: handleGoogleResponse,
      auto_select: false,
      cancel_on_tap_outside: false,
      prompt_parent_id: null // Não mostra prompt automático
    });

    // Renderiza o botão do Google (oculto)
    window.google.accounts.id.renderButton(
      googleButtonRef.value,
      {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        width: '250',
        locale: 'pt-BR'
      }
    );

    resolve(true);
  });
};

// Carrega a API do Google
const loadGoogleAPI = () => {
  return new Promise((resolve) => {
    // Se já carregou, apenas inicializa
    if (window.google?.accounts?.id) {
      initializeGoogleButton().then(resolve);
      return;
    }

    // Carrega o script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // Espera a API estar disponível
      const checkInterval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(checkInterval);
          initializeGoogleButton().then(resolve);
        }
      }, 100);
    };
    
    script.onerror = () => {
      console.error('Erro ao carregar Google API');
      loading.value = false;
      resolve(false);
    };
    
    document.head.appendChild(script);
  });
};

// Alternativa: Método direto sem botão oculto
const handleGoogleSignInDirect = () => {
  if (!window.google?.accounts?.id) {
    console.error('Google API não carregada');
    return;
  }

  loading.value = true;
  
  // Método direto - abre o popup do Google
  window.google.accounts.id.prompt((notification) => {
    // Esta função é chamada após o prompt ser mostrado
    // Você pode lidar com diferentes cenários aqui
    if (notification.isNotDisplayed()) {
      console.log('Prompt não foi mostrado');
      loading.value = false;
    }
    
    if (notification.isSkippedMoment()) {
      console.log('Usuário pulou o momento');
      loading.value = false;
    }
  });
};

onMounted(() => {
  loadGoogleAPI();
});

onUnmounted(() => {
  // Limpeza
  if (window.google?.accounts?.id) {
    window.google.accounts.id.cancel();
  }
});
</script>

<style scoped>
.custom-google-button {
  width: 100%;
  max-width: 300px;
  padding: 12px 24px;
  background: white;
  border: 1px solid #dadce0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 16px;
  font-weight: 500;
  color: #3c4043;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.custom-google-button:hover:not(:disabled) {
  background: #f8f9fa;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
}

.custom-google-button:active:not(:disabled) {
  background: #f1f3f4;
  transform: translateY(1px);
}

.custom-google-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.google-icon {
  width: 20px;
  height: 20px;
}

/* Botão do Google oculto */
.hidden-button {
  position: absolute;
  opacity: 0;
  pointer-events: none;
  width: 0;
  height: 0;
  overflow: hidden;
}

/* Garante que o botão do Google não seja visível */
.hidden-button > div {
  display: none !important;
}
</style>