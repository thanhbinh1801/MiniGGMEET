<template>
  <div class="dashboard-root">
    <div class="dashboard-center">
      <header class="dashboard-header">
        <div class="logo-meet">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <g>
              <rect width="40" height="40" rx="8" fill="#fff"/>
              <path d="M10 13.5C10 12.1193 11.1193 11 12.5 11H20V17.5C20 18.8807 18.8807 20 17.5 20H10V13.5Z" fill="#34A853"/>
              <path d="M20 11H27.5C28.8807 11 30 12.1193 30 13.5V20H22.5C21.1193 20 20 18.8807 20 17.5V11Z" fill="#4285F4"/>
              <path d="M30 20V26.5C30 27.8807 28.8807 29 27.5 29H20V22.5C20 21.1193 21.1193 20 22.5 20H30Z" fill="#FBBC05"/>
              <path d="M10 26.5C10 27.8807 11.1193 29 12.5 29H20V22.5C20 21.1193 18.8807 20 17.5 20H10V26.5Z" fill="#EA4335"/>
            </g>
          </svg>
          <span class="logo-text">Google <span class="logo-meet-green">Meet</span></span>
        </div>
      </header>
      <main class="dashboard-main">
        <h1 class="main-title">Tính năng họp và gọi video dành cho tất cả mọi người</h1>
        <p class="subtitle">Kết nối, cộng tác và ăn mừng ở mọi nơi với Google Meet</p>
        <div class="action-row">
          <button class="new-meeting-btn" @click="startNewMeeting">
            <span class="btn-icon">+</span>
            Cuộc họp mới
          </button>
          <div class="input-join-group">
            <span class="input-icon">#</span>
            <input 
              type="text" 
              class="meeting-input" 
              placeholder="Nhập mã phòng"
              v-model="meetingCode"
              @keyup.enter="joinMeeting"
            />
            <button class="join-btn" @click="joinMeeting" :disabled="!meetingCode.trim()">
              Tham gia
            </button>
          </div>
        </div>
      </main>
    </div>
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
    socket.connect();
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        socket.emit("register-user", { uid: user.uid });
        console.log(`User ${user.name} registered with socket`);
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
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
        const response = await axios.get(`/api/v1/room/${this.meetingCode}`);
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
        alert("Không thể tham gia phòng.");
      }
    },
  },
};
</script>

<style scoped>
.dashboard-root {
  min-height: 100vh;
  width: 100vw;
  background: #fff;
  font-family: 'Google Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dashboard-center {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.dashboard-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: transparent;
  min-height: 80px;
}
.dashboard-main {
  max-width: 700px;
  margin: 0 auto;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-meet {
  display: flex;
  align-items: center;
  gap: 10px;
}
.logo-text {
  font-size: 24px;
  font-weight: 500;
  color: #5f6368;
  letter-spacing: 0.5px;
}
.logo-meet-green {
  color: #34a853;
}

.main-title {
  font-size: 48px;
  font-weight: 400;
  color: #202124;
  margin-bottom: 16px;
  line-height: 1.15;
  text-align: center;
  word-break: break-word;
  hyphens: auto;
}
.subtitle {
  font-size: 20px;
  color: #5f6368;
  margin-bottom: 40px;
}

.action-row {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 32px;
}

.new-meeting-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  height: 48px;
  padding: 0 24px;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 500;
  white-space: nowrap;
  background: #1a73e8;
  color: #fff;
  border: none;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(26,115,232,0.08);
  transition: background 0.2s, box-shadow 0.2s;
}
.new-meeting-btn:hover {
  background: #1765c1;
}
.btn-icon {
  font-size: 20px;
}

.input-join-group {
  display: flex;
  align-items: center;
  border: 1.5px solid #dadce0;
  border-radius: 24px;
  height: 48px;
  background: #fff;
  padding: 0 0 0 12px;
}
.input-icon {
  font-size: 18px;
  color: #5f6368;
  margin-right: 4px;
}
.meeting-input {
  border: none;
  outline: none;
  font-size: 16px;
  background: transparent;
  padding: 0 8px;
  height: 100%;
  width: 180px;
}
.meeting-input::placeholder {
  color: #5f6368;
  opacity: 0.8;
}
.join-btn {
  background: none;
  border: none;
  color: #b0b0b0;
  font-size: 16px;
  font-weight: 500;
  height: 100%;
  padding: 0 18px;
  border-radius: 0 24px 24px 0;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s, color 0.2s;
}
.join-btn:enabled {
  color: #1967d2;
  background: #e8f0fe;
}
.input-join-group:focus-within {
  border-color: #1a73e8;
}

.learn-more-row {
  margin-top: 32px;
  width: 100%;
}
.learn-more-link {
  color: #5f6368;
  font-size: 15px;
  text-decoration: underline;
  transition: color 0.2s;
}
.learn-more-link:hover {
  color: #1a73e8;
}

@media (max-width: 600px) {
  .action-row {
    flex-direction: column;
    gap: 12px;
    align-items: center;
  }
  .new-meeting-btn, .input-join-group {
    width: 100%;
    max-width: 340px;
    min-width: 0;
    margin: 0 auto;
    box-sizing: border-box;
  }
  .meeting-input {
    width: 100px;
    min-width: 60px;
  }
}
</style>