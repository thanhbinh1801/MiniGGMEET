<template>
  <div class="login-container">
    <h1 class="title">Welcome to MiniGGMEET</h1>
    <p class="subtitle">Sign in to continue</p>
    <button class="google-signin-button" @click="signInWithGoogle">
      <img src="/google-logo.png" alt="Google Logo" class="google-logo" />
      Sign in with Google
    </button>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "Login",
  methods: {
    async signInWithGoogle() {
      try {
        const provider = new window.google.accounts.id.IdTokenProvider({
          client_id: "YOUR_GOOGLE_CLIENT_ID",                         // google CLIENT ID .........................................................
        });
        const googleUser = await provider.signIn();
        const idToken = googleUser.getAuthResponse().id_token;
        const response = await axios.post("/api/v1/auth/firebase-login", {}, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        alert("Login Successful!");
        console.log("User Data:", response.data);
        this.$router.push("/dashboard");
      } catch (error) {
        console.error("Error during Google login:", error);
        alert("Failed to sign in. Please try again.");
      }
    },
  },
};
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f9f9f9;
  font-family: Arial, sans-serif;
}
</style>

// Dashboard.vue
<template>
  <div class="dashboard-container">
    <header class="header">
      <h1 class="title">Tính năng họp và gọi video dành cho tất cả mọi người</h1>
    </header>
    <div class="actions">
      <button class="new-meeting-button" @click="startNewMeeting">Cuộc họp mới</button>
      <div class="join-meeting">
        <input type="text" class="meeting-input" placeholder="Nhập mã hoặc đường link" v-model="meetingCode" />
        <button class="join-button" @click="joinMeeting">Tham gia</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "Dashboard",
  data() {
    return {
      meetingCode: "",
    };
  },
  methods: {
    startNewMeeting() {
      alert("Chức năng tạo cuộc họp mới đang phát triển!");
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
            params: { roomName: response.data.roomName, roomId: this.meetingCode },
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
.dashboard-container {
  text-align: center;
}
</style>