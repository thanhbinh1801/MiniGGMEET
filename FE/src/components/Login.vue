<template>
  <div class="login-container">
    <!-- Background decoration -->
    <div class="background-decoration">
      <div class="floating-shape shape-1"></div>
      <div class="floating-shape shape-2"></div>
      <div class="floating-shape shape-3"></div>
      <div class="floating-shape shape-4"></div>
    </div>

    <!-- Login card -->
    <div class="login-card">
      <!-- Header -->
      <div class="login-header">
        <div class="logo-section">
          <div class="logo">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" fill="#1a73e8"/>
            </svg>
          </div>
          <h1 class="app-title">MiniGGMEET</h1>
        </div>
        <p class="welcome-text">Chào mừng bạn đến với</p>
        <h2 class="main-title">Nền tảng họp video</h2>
        <p class="subtitle">Đăng nhập để bắt đầu cuộc họp của bạn</p>
      </div>

      <!-- Login form -->
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

        <div class="divider">
          <span class="divider-text">hoặc</span>
        </div>

        <div class="alternative-options">
          <p class="help-text">
            Bạn cần hỗ trợ? 
            <a href="#" class="help-link">Liên hệ với chúng tôi</a>
          </p>
        </div>
      </div>

      <!-- Features -->
      <div class="features-section">
        <div class="feature-item">
          <div class="feature-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" fill="#34a853"/>
              <path d="M10 17l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" fill="white"/>
            </svg>
          </div>
          <span>Bảo mật tuyệt đối</span>
        </div>
        <div class="feature-item">
          <div class="feature-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#1a73e8"/>
              <path d="M13 7h-2v5l4.25 2.52.77-1.28L13 11.25V7z" fill="white"/>
            </svg>
          </div>
          <span>Sẵn sàng 24/7</span>
        </div>
        <div class="feature-item">
          <div class="feature-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#fbbc04"/>
            </svg>
          </div>
          <span>Chất lượng cao</span>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="login-footer">
      <p class="footer-text">
        Bằng cách đăng nhập, bạn đồng ý với 
        <a href="#" class="footer-link">Điều khoản dịch vụ</a> và 
        <a href="#" class="footer-link">Chính sách bảo mật</a>
      </p>
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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#34a853"/>
          </svg>
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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#ea4335"/>
          </svg>
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
* {
  box-sizing: border-box;
}

.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Google Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  position: relative;
  overflow: hidden;
  padding: 20px;
}

/* Background Animation */
.background-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
}

.floating-shape {
  position: absolute;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

.shape-1 {
  width: 80px;
  height: 80px;
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}

.shape-2 {
  width: 120px;
  height: 120px;
  top: 60%;
  right: 10%;
  animation-delay: 2s;
}

.shape-3 {
  width: 60px;
  height: 60px;
  bottom: 20%;
  left: 20%;
  animation-delay: 4s;
}

.shape-4 {
  width: 100px;
  height: 100px;
  top: 10%;
  right: 30%;
  animation-delay: 1s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

/* Login Card */
.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 48px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  max-width: 480px;
  width: 100%;
  text-align: center;
  position: relative;
  z-index: 10;
}

/* Header */
.login-header {
  margin-bottom: 40px;
}

.logo-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 24px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #1a73e8, #4285f4);
  border-radius: 16px;
  box-shadow: 0 8px 16px rgba(26, 115, 232, 0.3);
}

.app-title {
  font-size: 28px;
  font-weight: 600;
  color: #1a73e8;
  margin: 0;
}

.welcome-text {
  font-size: 16px;
  color: #5f6368;
  margin: 0 0 8px 0;
}

.main-title {
  font-size: 32px;
  font-weight: 400;
  color: #202124;
  margin: 0 0 16px 0;
  background: linear-gradient(135deg, #1a73e8, #4285f4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 16px;
  color: #5f6368;
  margin: 0;
  line-height: 1.4;
}

/* Login Form */
.login-form {
  margin-bottom: 32px;
}

.google-signin-button {
  width: 100%;
  background: white;
  border: 2px solid #dadce0;
  border-radius: 12px;
  padding: 16px 24px;
  font-size: 16px;
  font-weight: 500;
  color: #3c4043;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.google-signin-button:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #1a73e8;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
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

.google-icon {
  flex-shrink: 0;
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
  border-top: 2px solid #1a73e8;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.divider {
  margin: 32px 0;
  position: relative;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #dadce0;
}

.divider-text {
  background: white;
  padding: 0 16px;
  color: #5f6368;
  font-size: 14px;
  position: relative;
  z-index: 1;
}

.alternative-options {
  margin-top: 24px;
}

.help-text {
  font-size: 14px;
  color: #5f6368;
  margin: 0;
}

.help-link {
  color: #1a73e8;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.help-link:hover {
  color: #1557b0;
  text-decoration: underline;
}

/* Features */
.features-section {
  display: flex;
  justify-content: space-around;
  gap: 24px;
  padding-top: 32px;
  border-top: 1px solid #e8eaed;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.feature-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border: 2px solid #e8eaed;
}

.feature-item span {
  font-size: 12px;
  color: #5f6368;
  font-weight: 500;
}

/* Footer */
.login-footer {
  margin-top: 32px;
  text-align: center;
}

.footer-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
  line-height: 1.4;
}

.footer-link {
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  font-weight: 500;
}

.footer-link:hover {
  text-decoration: underline;
}

/* Notifications */
:global(.success-notification),
:global(.error-notification) {
  position: fixed;
  top: 20px;
  right: 20px;
  background: white;
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

:global(.success-notification) {
  border-left: 4px solid #34a853;
}

:global(.error-notification) {
  border-left: 4px solid #ea4335;
}

:global(.notification-content) {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: 500;
  color: #202124;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .login-card {
    padding: 32px 24px;
    margin: 20px;
  }
  
  .main-title {
    font-size: 28px;
  }
  
  .features-section {
    flex-direction: column;
    gap: 16px;
  }
  
  .feature-item {
    flex-direction: row;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .login-card {
    padding: 24px 20px;
  }
  
  .app-title {
    font-size: 24px;
  }
  
  .main-title {
    font-size: 24px;
  }
  
  .floating-shape {
    display: none;
  }
}
</style>