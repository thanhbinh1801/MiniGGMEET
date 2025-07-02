<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <div class="logo-section">
          <div class="logo">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" fill="#1a73e8"/>
            </svg>
          </div>
          <h1 class="app-title">MiniGGMEET</h1>
        </div>
      </div>
      <div class="login-form">
        <button class="google-signin-button" @click="signInWithGoogle" :disabled="isLoading">
          <div class="button-content">
            <svg class="google-icon" width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span class="button-text">
              {{ isLoading ? 'Đang đăng nhập...' : 'Đăng nhập với Google' }}
            </span>
          </div>
          <div class="loading-spinner" v-if="isLoading">
            <div class="spinner"></div>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { auth } from "@/firebase/config";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import axios from "axios";

export default {
  name: "Login",
  data() {
    return {
      isLoading: false,
    };
  },
  methods: {
    async signInWithGoogle() {
      this.isLoading = true;
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const idToken = await result.user.getIdToken();

        const response = await axios.post("/api/v1/auth/firebase-login", {}, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });

        console.log("Server response:", response.data);
        console.log("User object to save:", response.data.metadata.user);

        localStorage.setItem("user", JSON.stringify(response.data.metadata.user));

        // Verify saved user
        const savedUser = localStorage.getItem("user");
        console.log("Saved user in localStorage:", savedUser);

        // Success notification
        this.showSuccessMessage();
        
        // Navigate after a brief delay
        setTimeout(() => {
          this.$router.push("/dashboard");
        }, 1000);

      } catch (error) {
        console.error("Error during Google login:", error);
        this.showErrorMessage();
      } finally {
        this.isLoading = false;
      }
    },
    
    showSuccessMessage() {
      // Replace alert with a more elegant notification
      const notification = document.createElement('div');
      notification.className = 'success-notification';
      notification.innerHTML = `
        <div class="notification-content">
          <span>Đăng nhập thành công!</span>
        </div>
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.remove();
      }, 3000);
    },
    
    showErrorMessage() {
      const notification = document.createElement('div');
      notification.className = 'error-notification';
      notification.innerHTML = `
        <div class="notification-content">
          <span>Đăng nhập thất bại. Vui lòng thử lại!</span>
        </div>
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.remove();
      }, 3000);
    },
  },
};
</script>

<style scoped>
html, body {
  width: 100vw;
  height: 100vh;
  margin: 0;
  padding: 0;
}
.login-container {
  position: fixed;
  left: 0; top: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4285f4 0%, #6a11cb 100%);
  font-family: 'Google Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  margin: 0;
  padding: 0;
  z-index: 1;
}
.login-card {
  background: #fff;
  border-radius: 24px;
  padding: 40px 32px 32px 32px;
  box-shadow: 0 8px 32px rgba(60,64,67,0.18);
  max-width: 350px;
  width: 100%;
  text-align: center;
  position: relative;
  z-index: 10;
  margin: 0 auto;
}
.login-header {
  margin-bottom: 24px;
}
.logo-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}
.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #4285f4, #6a11cb);
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(66,133,244,0.10);
}
.app-title {
  font-size: 20px;
  font-weight: 600;
  color: #4285f4;
  margin: 0;
}
.login-form {
  margin-bottom: 0;
}
.google-signin-button {
  width: 100%;
  background: #fff;
  border: 1.5px solid #dadce0;
  border-radius: 24px;
  padding: 14px 0;
  font-size: 16px;
  font-weight: 500;
  color: #3c4043;
  cursor: pointer;
  transition: box-shadow 0.2s, border-color 0.2s;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(60,64,67,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}
.google-signin-button:hover:not(:disabled) {
  border-color: #4285f4;
  box-shadow: 0 4px 12px rgba(66,133,244,0.15);
}
.google-signin-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}
.button-text {
  font-weight: 500;
}
.loading-spinner {
  position: absolute;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
}
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #4285f4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
@media (max-width: 600px) {
  .login-card {
    padding: 20px 6px 16px 6px;
    max-width: 98vw;
  }
  .app-title {
    font-size: 16px;
  }
}
</style>