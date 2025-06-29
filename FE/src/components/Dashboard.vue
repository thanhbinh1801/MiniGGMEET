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
import socket from "../socket";

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
      console.log("User before creating room:", user); // Debug
      
      const response = await axios.post("/api/v1/room/", {
        hostUid: user.uid,
        hostName: user.name,
      });
      if (response.status === 201) {
        // Không ghi đè user object, chỉ lưu thông tin phòng nếu cần
        // localStorage.setItem("user", JSON.stringify(response.data.metadata.user));
        
        console.log("Room created successfully"); // Debug
        console.log("User after creating room:", JSON.parse(localStorage.getItem("user"))); // Debug
        
        this.$router.push({
          name: "Meeting",
          params: { 
            roomId: response.data.metadata.room._id
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
        console.log(`Attempting to join room: ${this.meetingCode}`); // Debug
        const response = await axios.get(`/api/v1/room/${this.meetingCode}`);
        console.log(`Room response:`, response.data); // Debug
        
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
.dashboard-container {
  text-align: center;
}
</style>
