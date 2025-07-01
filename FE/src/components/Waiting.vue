<template>
  <div class="waiting-room-container">
    <!-- Preview Video Section -->
    <div class="preview-section">
      <div class="video-preview">
        <video 
          ref="previewVideo" 
          autoplay 
          playsinline 
          muted 
          class="preview-video-element"
          v-show="showPreview"
        ></video>
        <div v-if="!showPreview" class="video-placeholder">
          <div class="placeholder-icon">📹</div>
          <p class="placeholder-text">Camera đang tắt</p>
        </div>
        <div class="video-controls">
          <button 
            @click="togglePreviewCamera" 
            :class="{ active: isCameraOn, inactive: !isCameraOn }"
            class="control-btn"
          >
            {{ isCameraOn ? "📹" : "📹" }}
          </button>
          <button 
            @click="togglePreviewMic" 
            :class="{ active: isMicOn, inactive: !isMicOn }"
            class="control-btn"
          >
            {{ isMicOn ? "🎤" : "🎤" }}
          </button>
        </div>
      </div>
    </div>

    <!-- Meeting Info Section -->
    <div class="meeting-info">
      <h2 class="meeting-title">{{ roomName }}</h2>
      <div class="room-id">Room ID: {{ $route.params.roomId }}</div>
      
      <!-- Status Display -->
      <div class="status-section">
        <div v-if="connectionStatus" class="status-item">
          <span class="status-icon" :class="getStatusClass(connectionStatus)">●</span>
          <span class="status-text">{{ getStatusText(connectionStatus) }}</span>
        </div>
        
        <div v-if="isWaitingForResponse" class="waiting-status">
          <div class="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p>Đang chờ phản hồi từ chủ phòng...</p>
          <p class="retry-info" v-if="retryCount > 0">
            Thử lại: {{ retryCount }}/{{ maxRetries }}
          </p>
        </div>
      </div>

      <!-- Action Button -->
      <button 
        class="join-button" 
        @click="requestJoinRoom"
        :disabled="isWaitingForResponse || connectionStatus !== 'connected'"
        :class="{ 
          waiting: isWaitingForResponse,
          disabled: connectionStatus !== 'connected'
        }"
      >
        <span v-if="isWaitingForResponse" class="button-spinner">⏳</span>
        {{ getButtonText() }}
      </button>

      <!-- Error Message -->
      <div v-if="errorMessage" class="error-message">
        <p>{{ errorMessage }}</p>
        <button @click="clearError" class="clear-error-btn">✕</button>
      </div>
    </div>

    <!-- Debug Info (Development) -->
    <div v-if="showDebug" class="debug-info">
      <h4>Debug Info:</h4>
      <div class="debug-item">Socket ID: {{ socketId }}</div>
      <div class="debug-item">User ID: {{ user?.uid }}</div>
      <div class="debug-item">Connection: {{ connectionStatus }}</div>
      <div class="debug-item">Waiting: {{ isWaitingForResponse }}</div>
      <div class="debug-item">Retries: {{ retryCount }}/{{ maxRetries }}</div>
    </div>
  </div>
</template>

<script>
import socket from "../socket";

export default {
  name: "Waiting",
  props: {
    roomName: {
      type: String,
      default: "STUDY WITH ME",
    },
  },
  data() {
    return {
      // User & Room
      user: null,
      roomId: null,
      
      // Connection Status
      connectionStatus: 'disconnected', // disconnected, connecting, connected, error
      socketId: null,
      isWaitingForResponse: false,
      
      // Retry Logic
      retryCount: 0,
      maxRetries: 3,
      requestTimeoutId: null,
      
      // Media Preview
      previewStream: null,
      isCameraOn: true,
      isMicOn: true,
      showPreview: false,
      
      // UI States
      errorMessage: '',
      showDebug: process.env.NODE_ENV === 'development',
      
      // Event Handlers
      boundHandlers: {}
    };
  },
  async mounted() {
    console.log("=== WAITING COMPONENT MOUNTED ===");
    
    try {
      await this.initializeComponent();
    } catch (error) {
      console.error("Failed to initialize waiting room:", error);
      this.setError(error.message || "Lỗi khởi tạo phòng chờ");
    }
  },
  methods: {
    async initializeComponent() {
      // Step 1: Load user data
      await this.loadUserData();
      
      // Step 2: Initialize media preview
      await this.initializeMediaPreview();
      
      // Step 3: Setup socket connection
      await this.setupSocketConnection();
      
      // Step 4: Register user with socket
      await this.registerUserWithSocket();
      
      console.log("Waiting room initialized successfully");
    },

    async loadUserData() {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        throw new Error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
      }

      this.user = JSON.parse(userStr);
      this.roomId = this.$route.params.roomId;
      
      if (!this.user?.uid) {
        throw new Error("Thông tin người dùng không hợp lệ");
      }
      
      if (!this.roomId) {
        throw new Error("Không tìm thấy mã phòng");
      }

      console.log("User data loaded:", { uid: this.user.uid, roomId: this.roomId });
    },

    async initializeMediaPreview() {
      try {
        console.log("Initializing media preview...");
        
        this.previewStream = await navigator.mediaDevices.getUserMedia({
          video: { 
            width: { ideal: 640 },
            height: { ideal: 480 },
            frameRate: { ideal: 30 }
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          }
        });

        if (this.$refs.previewVideo) {
          this.$refs.previewVideo.srcObject = this.previewStream;
          this.showPreview = true;
        }

        console.log("Media preview initialized successfully");
      } catch (error) {
        console.warn("Could not initialize media preview:", error);
        this.showPreview = false;
        // Don't throw error, allow user to continue without preview
      }
    },

    async setupSocketConnection() {
      console.log("Setting up socket connection...");
      
      // Remove any existing listeners to prevent duplicates
      this.cleanupSocketListeners();
      
      // Create bound handlers for proper cleanup
      this.boundHandlers = {
        onConnect: this.handleSocketConnect.bind(this),
        onDisconnect: this.handleSocketDisconnect.bind(this),
        onConnectError: this.handleSocketConnectError.bind(this),
        onJoinApproved: this.handleJoinApproved.bind(this),
        onJoinDenied: this.handleJoinDenied.bind(this)
      };
      
      // Setup socket listeners
      socket.on('connect', this.boundHandlers.onConnect);
      socket.on('disconnect', this.boundHandlers.onDisconnect);
      socket.on('connect_error', this.boundHandlers.onConnectError);
      socket.on('join-approved', this.boundHandlers.onJoinApproved);
      socket.on('join-denied', this.boundHandlers.onJoinDenied);
      
      // Connect if not already connected
      if (!socket.connected) {
        this.connectionStatus = 'connecting';
        socket.connect();
        
        // Wait for connection with timeout
        await this.waitForConnection(10000);
      } else {
        this.connectionStatus = 'connected';
        this.socketId = socket.id;
      }
    },

    waitForConnection(timeout = 10000) {
      return new Promise((resolve, reject) => {
        if (socket.connected) {
          resolve();
          return;
        }

        const timeoutId = setTimeout(() => {
          reject(new Error("Socket connection timeout"));
        }, timeout);

        const onConnect = () => {
          clearTimeout(timeoutId);
          socket.off('connect', onConnect);
          resolve();
        };

        socket.on('connect', onConnect);
      });
    },

    async registerUserWithSocket() {
      if (!socket.connected) {
        throw new Error("Socket not connected");
      }

      console.log(`Registering user ${this.user.uid} with socket...`);
      
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error("User registration timeout"));
        }, 5000);

        socket.emit("register-user", { uid: this.user.uid }, (ack) => {
          clearTimeout(timeoutId);
          
          if (ack?.success !== false) { // Consider no response as success
            console.log(`User ${this.user.uid} registered successfully`);
            resolve();
          } else {
            reject(new Error(ack?.message || "Failed to register user"));
          }
        });
      });
    },

    async requestJoinRoom() {
      if (this.isWaitingForResponse || this.connectionStatus !== 'connected') {
        return;
      }

      console.log(`Requesting to join room ${this.roomId}...`);
      
      this.isWaitingForResponse = true;
      this.retryCount = 0;
      this.clearError();
      
      await this.sendJoinRequest();
    },

    async sendJoinRequest() {
      try {
        console.log(`Sending join request (attempt ${this.retryCount + 1}/${this.maxRetries + 1})`);
        
        // Clear any existing timeout
        if (this.requestTimeoutId) {
          clearTimeout(this.requestTimeoutId);
        }
        
        // Set up request timeout
        this.requestTimeoutId = setTimeout(() => {
          this.handleRequestTimeout();
        }, 30000); // 30 seconds timeout
        
        // Send join request
        const response = await new Promise((resolve) => {
          socket.emit("request-join-room", {
            roomId: this.roomId,
            uid: this.user.uid,
            name: this.user.name || this.user.displayName || 'Anonymous'
          }, resolve);
        });
        
        // Clear timeout since we got a response
        if (this.requestTimeoutId) {
          clearTimeout(this.requestTimeoutId);
          this.requestTimeoutId = null;
        }
        
        if (!response?.success) {
          throw new Error(response?.message || "Join request failed");
        }
        
        console.log("Join request sent successfully, waiting for host response...");
        
      } catch (error) {
        console.error("Join request error:", error);
        this.handleRequestError(error);
      }
    },

    handleRequestTimeout() {
      console.log("Join request timed out");
      this.handleRequestError(new Error("Không nhận được phản hồi từ chủ phòng"));
    },

    handleRequestError(error) {
      console.error("Request error:", error);
      
      // Clear timeout
      if (this.requestTimeoutId) {
        clearTimeout(this.requestTimeoutId);
        this.requestTimeoutId = null;
      }
      
      this.retryCount++;
      
      if (this.retryCount <= this.maxRetries) {
        console.log(`Retrying in 3 seconds... (${this.retryCount}/${this.maxRetries})`);
        
        setTimeout(() => {
          if (this.isWaitingForResponse) {
            this.sendJoinRequest();
          }
        }, 3000);
      } else {
        console.log("Max retries reached, stopping attempts");
        this.isWaitingForResponse = false;
        this.setError(error.message || "Không thể tham gia phòng. Vui lòng thử lại sau.");
      }
    },

    // Socket Event Handlers
    handleSocketConnect() {
      console.log("Socket connected:", socket.id);
      this.connectionStatus = 'connected';
      this.socketId = socket.id;
      this.clearError();
      
      // If we were waiting for a response, resend the request
      if (this.isWaitingForResponse) {
        console.log("Reconnected while waiting, resending join request...");
        this.sendJoinRequest();
      }
    },

    handleSocketDisconnect(reason) {
      console.log("Socket disconnected:", reason);
      this.connectionStatus = 'disconnected';
      this.socketId = null;
      
      if (reason === 'io server disconnect') {
        // Server disconnected us, need to reconnect manually
        socket.connect();
      }
    },

    handleSocketConnectError(error) {
      console.error("Socket connection error:", error);
      this.connectionStatus = 'error';
      this.setError("Không thể kết nối đến server. Vui lòng kiểm tra kết nối internet.");
    },

    handleJoinApproved({ roomId, members }) {
      console.log("Join approved for room:", roomId);
      
      // Clear waiting state
      this.isWaitingForResponse = false;
      if (this.requestTimeoutId) {
        clearTimeout(this.requestTimeoutId);
        this.requestTimeoutId = null;
      }
      
      // Stop preview stream before navigating
      this.stopPreviewStream();
      
      // Navigate to meeting room
      this.$router.push({
        name: "Meeting",
        params: { roomId }
      });
    },

    handleJoinDenied({ roomId, message }) {
      console.log("Join denied for room:", roomId, "Message:", message);
      
      this.isWaitingForResponse = false;
      if (this.requestTimeoutId) {
        clearTimeout(this.requestTimeoutId);
        this.requestTimeoutId = null;
      }
      
      this.setError(message || "Chủ phòng đã từ chối yêu cầu tham gia của bạn");
    },

    // Media Controls
    togglePreviewCamera() {
      this.isCameraOn = !this.isCameraOn;
      
      if (this.previewStream) {
        this.previewStream.getVideoTracks().forEach(track => {
          track.enabled = this.isCameraOn;
        });
      }
      
      this.showPreview = this.isCameraOn;
      console.log(`Preview camera ${this.isCameraOn ? 'enabled' : 'disabled'}`);
    },

    togglePreviewMic() {
      this.isMicOn = !this.isMicOn;
      
      if (this.previewStream) {
        this.previewStream.getAudioTracks().forEach(track => {
          track.enabled = this.isMicOn;
        });
      }
      
      console.log(`Preview microphone ${this.isMicOn ? 'enabled' : 'disabled'}`);
    },

    stopPreviewStream() {
      if (this.previewStream) {
        console.log("Stopping preview stream...");
        this.previewStream.getTracks().forEach(track => {
          track.stop();
        });
        this.previewStream = null;
        this.showPreview = false;
      }
    },

    // Utility Methods
    getStatusClass(status) {
      return {
        'status-connected': status === 'connected',
        'status-connecting': status === 'connecting',
        'status-disconnected': status === 'disconnected',
        'status-error': status === 'error'
      };
    },

    getStatusText(status) {
      const statusMap = {
        'connected': 'Đã kết nối',
        'connecting': 'Đang kết nối...',
        'disconnected': 'Mất kết nối',
        'error': 'Lỗi kết nối'
      };
      return statusMap[status] || status;
    },

    getButtonText() {
      if (this.connectionStatus !== 'connected') {
        return 'Đang kết nối...';
      }
      if (this.isWaitingForResponse) {
        return 'Đang chờ phản hồi...';
      }
      return 'Yêu cầu tham gia';
    },

    setError(message) {
      this.errorMessage = message;
      console.error("Error:", message);
    },

    clearError() {
      this.errorMessage = '';
    },

    cleanupSocketListeners() {
      if (this.boundHandlers) {
        Object.entries(this.boundHandlers).forEach(([event, handler]) => {
          const eventName = event.replace('on', '').toLowerCase().replace('connect', 'connect');
          socket.off(eventName, handler);
        });
      }
      
      // Also remove specific event listeners
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.off('join-approved');
      socket.off('join-denied');
    },

    cleanup() {
      console.log("Cleaning up waiting room...");
      
      // Clear timeouts
      if (this.requestTimeoutId) {
        clearTimeout(this.requestTimeoutId);
        this.requestTimeoutId = null;
      }
      
      // Stop media stream
      this.stopPreviewStream();
      
      // Clean up socket listeners
      this.cleanupSocketListeners();
      
      // Reset state
      this.isWaitingForResponse = false;
      this.connectionStatus = 'disconnected';
      this.retryCount = 0;
    }
  },

  beforeUnmount() {
    console.log("=== WAITING COMPONENT UNMOUNTING ===");
    this.cleanup();
  }
};
</script>

<style scoped>
.waiting-room-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #333;
}

.preview-section {
  margin-bottom: 30px;
}

.video-preview {
  position: relative;
  width: 480px;
  height: 320px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3);
  background: #222;
}

.preview-video-element {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.video-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #222;
  color: #fff;
}

.placeholder-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.7;
}

.placeholder-text {
  font-size: 16px;
  opacity: 0.8;
  margin: 0;
}

.video-controls {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 12px;
}

.control-btn {
  width: 48px;
  height: 48px;
  border: none;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.control-btn.active {
  background: #28a745;
  color: white;
  box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
}

.control-btn.inactive {
  background: #dc3545;
  color: white;
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.4);
}

.control-btn:hover {
  transform: scale(1.1);
}

.meeting-info {
  text-align: center;
  background: rgba(255, 255, 255, 0.95);
  padding: 30px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
  max-width: 480px;
  width: 100%;
}

.meeting-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #2c3e50;
}

.room-id {
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 24px;
  font-family: 'Courier New', monospace;
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
}

.status-section {
  margin-bottom: 24px;
}

.status-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 16px;
}

.status-icon {
  font-size: 12px;
  transition: color 0.3s ease;
}

.status-icon.status-connected {
  color: #28a745;
}

.status-icon.status-connecting {
  color: #ffc107;
  animation: pulse 1.5s infinite;
}

.status-icon.status-disconnected {
  color: #6c757d;
}

.status-icon.status-error {
  color: #dc3545;
}

.status-text {
  font-size: 14px;
  font-weight: 500;
}

.waiting-status {
  padding: 16px;
  background: #e3f2fd;
  border-radius: 8px;
  border-left: 4px solid #2196f3;
}

.waiting-status p {
  margin: 4px 0;
  color: #1976d2;
}

.retry-info {
  font-size: 12px;
  opacity: 0.8;
}

.loading-dots {
  display: flex;
  justify-content: center;
  gap: 4px;
  margin-bottom: 8px;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2196f3;
  animation: loading 1.4s infinite ease-in-out;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }

.join-button {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 200px;
  position: relative;
}

.join-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.join-button:disabled {
  background: #adb5bd;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.join-button.waiting {
  background: #ffc107;
  color: #212529;
}

.button-spinner {
  margin-right: 8px;
  animation: spin 1s linear infinite;
}

.error-message {
  margin-top: 16px;
  padding: 12px 16px;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  color: #721c24;
  position: relative;
}

.error-message p {
  margin: 0;
  font-size: 14px;
}

.clear-error-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  color: #721c24;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.debug-info {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: rgba(0,0,0,0.8);
  color: white;
  padding: 16px;
  border-radius: 8px;
  font-size: 12px;
  min-width: 200px;
}

.debug-info h4 {
  margin: 0 0 8px 0;
  font-size: 14px;
}

.debug-item {
  margin: 4px 0;
  display: flex;
  justify-content: space-between;
}

/* Animations */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes loading {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .waiting-room-container {
    padding: 16px;
  }
  
  .video-preview {
    width: 100%;
    max-width: 400px;
    height: 240px;
  }
  
  .meeting-info {
    padding: 24px 20px;
  }
  
  .meeting-title {
    font-size: 24px;
  }
  
  .join-button {
    padding: 14px 28px;
    font-size: 15px;
    min-width: 180px;
  }
  
  .debug-info {
    position: relative;
    margin-top: 20px;
    right: auto;
    bottom: auto;
  }
}

@media (max-width: 480px) {
  .video-preview {
    height: 200px;
  }
  
  .control-btn {
    width: 44px;
    height: 44px;
    font-size: 18px;
  }
  
  .meeting-title {
    font-size: 22px;
  }
  
  .join-button {
    padding: 12px 24px;
    font-size: 14px;
    min-width: 160px;
  }
}
</style>