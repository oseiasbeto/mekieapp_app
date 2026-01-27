<template>
  <div class="login-container">
    <button 
      @click="handleGoogleLogin"
      :disabled="loading"
      class="google-login-btn"
    >
      <svg class="google-icon" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      <span>{{ loading ? 'Processando...' : 'Continuar com Google' }}</span>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const loading = ref(false);
const CLIENT_ID = '914842748542-mc9j2ltt0no88mqlu144u1q1hu19lhq1.apps.googleusercontent.com';
const REDIRECT_URI = `${window.location.origin}/auth/google/callback`;

// Detectar WebView
const isWebView = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  return (
    userAgent.includes('wv') || // Android WebView
    userAgent.includes('webview') ||
    /mobile.*safari.*version/i.test(userAgent) ||
    !window.chrome || // WebViews geralmente não têm chrome object
    window.ReactNativeWebView !== undefined
  );
};

// Detectar ambiente
const getEnvironment = () => {
  if (isWebView()) {
    if (/android/i.test(navigator.userAgent)) return 'android_webview';
    if (/iphone|ipad|ipod/i.test(navigator.userAgent)) return 'ios_webview';
    return 'webview';
  }
  return 'browser';
};

// Handler principal
const handleGoogleLogin = async () => {
  if (loading.value) return;
  
  loading.value = true;
  const env = getEnvironment();
  console.log('Ambiente:', env);
  
  try {
    if (env === 'browser') {
      await handleBrowserLogin();
    } else {
      await handleWebViewLogin();
    }
  } catch (error) {
    console.error('Erro no login:', error);
    loading.value = false;
  }
};

// Login para navegadores normais (com Google Identity Services)
const handleBrowserLogin = () => {
  return new Promise((resolve) => {
    if (!window.google) {
      loadGoogleAPI().then(() => {
        initGoogleIdentity();
        resolve();
      });
      return;
    }
    
    initGoogleIdentity();
    resolve();
  });
};

const initGoogleIdentity = () => {
  // Remove listener anterior se existir
  if (window._googleCallback) {
    window.google.accounts.id.cancel();
  }
  
  window._googleCallback = (response) => {
    handleGoogleResponse(response);
  };
  
  window.google.accounts.id.initialize({
    client_id: CLIENT_ID,
    callback: window._googleCallback,
    auto_select: false,
    cancel_on_tap_outside: true,
    context: 'signin'
  });
  
  // Cria e clica em botão oculto
  const tempDiv = document.createElement('div');
  tempDiv.style.cssText = 'position: absolute; left: -9999px; top: -9999px;';
  document.body.appendChild(tempDiv);
  
  window.google.accounts.id.renderButton(tempDiv, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    text: 'signin_with',
    shape: 'rectangular'
  });
  
  setTimeout(() => {
    const googleBtn = tempDiv.querySelector('div[role="button"]');
    if (googleBtn) {
      googleBtn.click();
    }
    setTimeout(() => document.body.removeChild(tempDiv), 1000);
  }, 100);
};

// Login para WebViews (com OAuth redirect)
const handleWebViewLogin = () => {
  // Para WebView, usamos OAuth com redirecionamento
  const state = generateState();
  const nonce = generateNonce();
  
  // Salva no localStorage para verificação depois
  localStorage.setItem('google_oauth_state', state);
  localStorage.setItem('google_oauth_nonce', nonce);
  
  // URL de autorização do Google
  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  const params = {
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent',
    state: state,
    nonce: nonce
  };
  
  Object.keys(params).forEach(key => 
    authUrl.searchParams.append(key, params[key])
  );
  
  // Em WebViews, redirecionamos diretamente
  window.location.href = authUrl.toString();
};

// Gerar state para segurança
const generateState = () => {
  return btoa(Math.random().toString(36).substring(2) + Date.now().toString(36));
};

// Gerar nonce para segurança
const generateNonce = () => {
  return btoa(Math.random().toString(36).substring(2) + Date.now().toString(36));
};

// Processar resposta do Google
const handleGoogleResponse = async (response) => {
  loading.value = false;
  
  if (response.credential) {
    try {
      const userData = parseJwt(response.credential);
      console.log('Dados do usuário:', userData);
      
      // Salvar token
      localStorage.setItem('google_token', response.credential);
      localStorage.setItem('user_data', JSON.stringify(userData));
      
      // Enviar para backend
      await sendToBackend(userData, response.credential);
      
      // Redirecionar
      router.push('/dashboard');
      
    } catch (error) {
      console.error('Erro ao processar resposta:', error);
      showError('Erro ao fazer login. Tente novamente.');
    }
  }
};

// Decodificar JWT
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
    throw e;
  }
};

// Enviar dados para backend
const sendToBackend = async (userData, token) => {
  try {
    const response = await fetch('/api/auth/google', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });
    
    if (!response.ok) {
      throw new Error('Erro no servidor');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao enviar para backend:', error);
    throw error;
  }
};

// Mostrar erro
const showError = (message) => {
  alert(message); // Ou use um sistema de notificação
};

// Carregar API do Google
const loadGoogleAPI = () => {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    
    document.head.appendChild(script);
  });
};

// Verificar se há token na URL (callback)
const checkUrlForToken = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');
  const error = urlParams.get('error');
  
  if (error) {
    console.error('Erro do Google:', error);
    loading.value = false;
    return;
  }
  
  if (code && state) {
    // Verificar state
    const savedState = localStorage.getItem('google_oauth_state');
    if (state !== savedState) {
      console.error('State inválido');
      return;
    }
    
    loading.value = true;
    exchangeCodeForToken(code);
  }
};

// Trocar code por token
const exchangeCodeForToken = async (code) => {
  try {
    const response = await fetch('/api/auth/google/exchange', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code: code,
        redirect_uri: REDIRECT_URI
      })
    });
    
    if (!response.ok) {
      throw new Error('Erro na troca do token');
    }
    
    const data = await response.json();
    
    // Salvar token e dados
    if (data.token) {
      localStorage.setItem('google_token', data.token);
      localStorage.setItem('user_data', JSON.stringify(data.user));
      
      // Redirecionar para dashboard
      window.location.href = '/dashboard';
    }
  } catch (error) {
    console.error('Erro ao trocar token:', error);
    loading.value = false;
  }
};

// Setup comunicação com WebView
const setupWebViewCommunication = () => {
  if (window.ReactNativeWebView) {
    // React Native WebView
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'webview_ready'
    }));
    
    // Listener para mensagens do app nativo
    window.addEventListener('message', (event) => {
      if (event.data?.type === 'google_token') {
        handleGoogleResponse({ credential: event.data.token });
      }
    });
  }
  
  // Para Android
  if (window.Android) {
    window.Android.googleSignInCallback = (token) => {
      handleGoogleResponse({ credential: token });
    };
  }
};

// Limpeza
onMounted(() => {
  checkUrlForToken();
  setupWebViewCommunication();
});

onUnmounted(() => {
  if (window._googleCallback) {
    window._googleCallback = null;
  }
});
</script>

<style scoped>
.login-container {
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.google-login-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px 24px;
  background: white;
  border: 2px solid #4285F4;
  border-radius: 8px;
  color: #4285F4;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 250px;
}

.google-login-btn:hover:not(:disabled) {
  background: #f8f9fa;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(66, 133, 244, 0.2);
}

.google-login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.google-login-btn:active:not(:disabled) {
  transform: translateY(0);
}

.google-icon {
  width: 20px;
  height: 20px;
}
</style>