<template>
  <div class="dashboard-container">
    <!-- Header với logo và navigation -->
    <header class="header">
      <div class="header-content">
        <div class="logo-section">
          <div class="logo">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" fill="#1a73e8"/>
            </svg>
            <span class="logo-text">Meet</span>
          </div>
        </div>
        <nav class="nav-links">
          <a href="#" class="nav-link">Trang chủ</a>
          <a href="#" class="nav-link">Cuộc họp của tôi</a>
        </nav>
      </div>
    </header>

    <!-- Main content -->
    <main class="main-content">
      <div class="content-wrapper">
        <!-- Left section -->
        <div class="left-section">
          <div class="hero-content">
            <h1 class="main-title">
              Tính năng họp video an toàn và dễ sử dụng
            </h1>
            <p class="subtitle">
              Kết nối, cộng tác và tổ chức cuộc họp từ mọi nơi
            </p>
            
            <!-- Action buttons -->
            <div class="action-section">
              <button class="new-meeting-btn" @click="startNewMeeting">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="btn-icon">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
                </svg>
                Cuộc họp mới
              </button>
              
              <div class="join-section">
                <div class="input-group">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="input-icon">
                    <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z" fill="currentColor"/>
                  </svg>
                  <input 
                    type="text" 
                    class="meeting-input" 
                    placeholder="Nhập mã cuộc họp hoặc liên kết" 
                    v-model="meetingCode"
                    @keyup.enter="joinMeeting"
                  />
                </div>
                <button class="join-btn" @click="joinMeeting" :disabled="!meetingCode.trim()">
                  Tham gia
                </button>
              </div>
            </div>

            <!-- Features -->
            <div class="features">
              <div class="feature-item">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#34a853"/>
                </svg>
                <span>Bảo mật cao</span>
              </div>
              <div class="feature-item">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#fbbc04"/>
                </svg>
                <span>Chất lượng HD</span>
              </div>
              <div class="feature-item">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#ea4335"/>
                </svg>
                <span>Miễn phí sử dụng</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right section - Illustration -->
        <div class="right-section">
          <div class="illustration">
            <div class="video-grid">
              <div class="video-tile active">
                <div class="avatar">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#ffffff"/>
                  </svg>
                </div>
                <span class="participant-name">Bạn</span>
              </div>
              <div class="video-tile">
                <div class="avatar">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#ffffff"/>
                  </svg>
                </div>
                <span class="participant-name">Thành viên 1</span>
              </div>
              <div class="video-tile">
                <div class="avatar">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#ffffff"/>
                  </svg>
                </div>
                <span class="participant-name">Thành viên 2</span>
              </div>
              <div class="video-tile">
                <div class="avatar">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#ffffff"/>
                  </svg>
                </div>
                <span class="participant-name">+2</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
import axios from "axios";
import socket from "../socket";
import generateMeetingId from "../utils/genMeetingId.js";

export default {
  name: "Dashboard",
  data() {
    return {
      meetingCode: "",
    };
  },
  mounted() {
    // Kết nối socket và đăng ký user
    socket.connect();
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        socket.emit("register-user", { uid: user.uid });
        console.log(`User ${user.name} registered with socket`);
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
        // Không redirect vì user có thể chưa login
      }
    }
  },
  methods: {
    async startNewMeeting() {
      const user = JSON.parse(localStorage.getItem("user"));
      
      const IdRoom = generateMeetingId();
      
      const response = await axios.post("/api/v1/room/", {
        roomId: IdRoom,
        hostUid: user.uid,
        hostName: user.name,
      });
      
      if (response.status === 201) {
        console.log("Room created successfully");
        console.log("User after creating room:", JSON.parse(localStorage.getItem("user")));
        
        this.$router.push({
          name: "Meeting",
          params: {
            roomId: response.data.metadata.room.roomId,
          },
        });
      }
    },
    async joinMeeting() {
      if (this.meetingCode.trim() === "") {
        alert("Vui lòng nhập mã hoặc đường link cuộc họp!");
        return;
      }
      try {
        console.log(`Attempting to join room: ${this.meetingCode}`);
        const response = await axios.get(`/api/v1/room/${this.meetingCode}`);
        console.log(`Room response:`, response.data);
        
        if (response.status === 200) {
          this.$router.push({
            name: "Waiting",
            params: {
              roomName: response.data.metadata.room.hostName + "'s Room",
              roomId: this.meetingCode
            },
          });
        } else {
          alert("Không tìm thấy phòng. Vui lòng kiểm tra lại mã phòng!");
        }
      } catch (error) {
        console.error("Lỗi khi tham gia phòng:", error);
        alert("Không thể tham gia phòng.");
      }
    },
  },
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.dashboard-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: 'Google Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* Header */
.header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.logo-section {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-text {
  font-size: 22px;
  font-weight: 500;
  color: #1a73e8;
}

.nav-links {
  display: flex;
  gap: 32px;
}

.nav-link {
  color: #5f6368;
  text-decoration: none;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.nav-link:hover {
  background-color: #f8f9fa;
  color: #1a73e8;
}

/* Main Content */
.main-content {
  padding: 80px 24px;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: center;
}

/* Left Section */
.left-section {
  color: white;
}

.main-title {
  font-size: 48px;
  font-weight: 400;
  line-height: 1.2;
  margin: 0 0 16px 0;
  background: linear-gradient(45deg, #ffffff, #f0f8ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 48px 0;
  line-height: 1.4;
}

.action-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 48px;
}

.new-meeting-btn {
  background: #1a73e8;
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(26, 115, 232, 0.3);
  align-self: flex-start;
}

.new-meeting-btn:hover {
  background: #1557b0;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(26, 115, 232, 0.4);
}

.join-section {
  display: flex;
  gap: 16px;
  align-items: center;
}

.input-group {
  position: relative;
  flex: 1;
}

.input-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #5f6368;
  z-index: 1;
}

.meeting-input {
  width: 100%;
  padding: 16px 16px 16px 52px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  font-size: 16px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
}

.meeting-input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

.meeting-input:focus {
  outline: none;
  border-color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 255, 255, 0.15);
}

.join-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  padding: 14px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  white-space: nowrap;
}

.join-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
}

.join-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Features */
.features {
  display: flex;
  gap: 32px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.9);
  font-size: 14px;
}

/* Right Section - Illustration */
.illustration {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 32px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.video-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.video-tile {
  background: #1f1f1f;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  position: relative;
  transition: all 0.3s ease;
  min-height: 120px;
  justify-content: center;
}

.video-tile.active {
  background: #0d7377;
  box-shadow: 0 0 20px rgba(13, 115, 119, 0.4);
}

.video-tile:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.avatar {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.participant-name {
  color: white;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
}

/* Responsive */
@media (max-width: 768px) {
  .content-wrapper {
    grid-template-columns: 1fr;
    gap: 48px;
    text-align: center;
  }
  
  .main-title {
    font-size: 36px;
  }
  
  .join-section {
    flex-direction: column;
  }
  
  .meeting-input {
    padding-left: 16px;
  }
  
  .input-icon {
    display: none;
  }
  
  .features {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .nav-links {
    display: none;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 40px 16px;
  }
  
  .header-content {
    padding: 0 16px;
  }
  
  .main-title {
    font-size: 28px;
  }
  
  .subtitle {
    font-size: 18px;
  }
}
</style>