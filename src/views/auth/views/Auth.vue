<template>
  <div>
    <!-- Botão personalizado -->
    <button 
      @click="triggerGoogleSignIn"
      :disabled="loading"
      class="custom-google-button"
    >
      <div class="button-content">
        <svg class="google-icon" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        <span>Continuar com Google</span>
      </div>
    </button>

    <!-- Div oculta para o botão do Google -->
    <div ref="googleButtonRef" style="display: none;"></div>
  </div>
</template>

<script setup>
import { onMounted, ref, onUnmounted } from 'vue';

const googleButtonRef = ref(null);
const loading = ref(false);

// Substitua pelo seu ID de cliente do Google
const CLIENT_ID = '914842748542-mc9j2ltt0no88mqlu144u1q1hu19lhq1.apps.googleusercontent.com';

// Função para decodificar o JWT
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

// Função para processar a resposta do Google
const handleGoogleResponse = (response) => {
  const userData = parseJwt(response.credential);
  
  if (userData) {
    console.log('Dados do usuário:', userData);
    
    // Aqui você pode enviar os dados para seu backend
    // Exemplo: await authService.googleLogin(userData);
    
    // Redirecionar ou atualizar estado da aplicação
  }
  
  loading.value = false;
};

// Inicializa o Google Identity Services
const initGoogle = () => {
  if (!window.google?.accounts?.id) return;

  window.google.accounts.id.initialize({
    client_id: CLIENT_ID,
    callback: (response) => {
      handleGoogleResponse(response);
    },
    auto_select: false,
    cancel_on_tap_outside: true
  });
};

// Dispara o login do Google
const triggerGoogleSignIn = () => {
  if (!window.google?.accounts?.id) {
    console.error('Google API não carregada');
    return;
  }

  loading.value = true;
  
  // Usa o prompt do Google
  window.google.accounts.id.prompt((notification) => {
    if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
      // Fallback: mostra o botão nativo
      if (googleButtonRef.value) {
        const googleButton = googleButtonRef.value.querySelector('div[role="button"]');
        if (googleButton) {
          googleButton.click();
        }
      }
    }
  });
};

// Carrega a API do Google
const loadGoogleAPI = () => {
  // Verifica se o script já foi carregado
  if (window.google?.accounts?.id) {
    initGoogle();
    return;
  }

  // Carrega o script da API do Google
  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  script.onload = () => {
    // Aguarda a API estar pronta
    const checkInterval = setInterval(() => {
      if (window.google?.accounts?.id) {
        clearInterval(checkInterval);
        initGoogle();
        
        // Renderiza o botão oculto (para fallback)
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
      }
    }, 100);
  };
  
  document.head.appendChild(script);
};

// Alternativa: usando o botão nativo como gatilho
const triggerGoogleSignInNative = () => {
  if (googleButtonRef.value) {
    const googleButton = googleButtonRef.value.querySelector('div[role="button"]');
    if (googleButton) {
      googleButton.click();
    }
  }
};

onMounted(() => {
  loadGoogleAPI();
});

onUnmounted(() => {
  // Limpeza se necessário
});
</script>

<style scoped>
.custom-google-button {
  width: 100%;
  max-width: 300px;
  padding: 12px 24px;
  background: white;
  border: 1px solid #dadce0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
  color: #3c4043;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.custom-google-button:hover {
  background: #f8f9fa;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.custom-google-button:active {
  background: #f1f3f4;
}

.custom-google-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.google-icon {
  width: 18px;
  height: 18px;
}
</style>