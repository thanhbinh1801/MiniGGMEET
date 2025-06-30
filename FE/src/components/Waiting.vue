<template>
  <div class="waiting-room-container">
    <div class="video-placeholder">
      <p class="placeholder-text">Máy ảnh đang tắt</p>
    </div>
    <div class="meeting-info">
      <h2 class="meeting-title">{{ roomName }}</h2>

      <button class="join-button" @click="joinNow">Tham gia ngay</button>
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
      isWaitingForResponse: false
    };
  },
  mounted() {
    // Kết nối socket
    socket.connect();
    
    // Lấy user info từ localStorage
    const userStr = localStorage.getItem("user");
    console.log("User string from localStorage:", userStr); // Debug
    
    if (!userStr) {
      console.error("User not found in localStorage");
      alert("Vui lòng đăng nhập lại!");
      this.$router.push("/");
      return;
    }
    
    try {
      const user = JSON.parse(userStr);
      console.log("Parsed user object:", user); // Debug
      
      if (!user || !user.uid) {
        console.error("User object is invalid or missing uid");
        alert("Thông tin người dùng không hợp lệ. Vui lòng đăng nhập lại!");
        this.$router.push("/");
        return;
      }
      
      // Đăng ký user với server
      socket.emit("register-user", { uid: user.uid });
      console.log("User registered with socket, waiting for connection...");
      
      // Đợi socket kết nối trước khi gửi request
      // if (socket.connected) {
      //   this.autoJoinRoom(user);
      // } else {
      //   socket.on('connect', () => {
      //     console.log("Socket connected, now sending join request");
      //     this.autoJoinRoom(user);
      //   });
      // }
      
      // Test socket connection
      setTimeout(() => {
        console.log("Testing socket connection...");
        socket.emit('test-connection', { message: 'Hello from client' });
      }, 2000);
      
      // Lắng nghe test response
      socket.on('test-response', (data) => {
        console.log("Test response received:", data);
      });
      
      // Lắng nghe phản hồi từ host
      socket.on("join-approved", ({ roomId }) => {
        console.log("Join approved by host");
        this.isWaitingForResponse = false;
        this.$router.push({
          name: "Meeting",
          params: { roomId: roomId },
        });
      });
      
      socket.on("join-denied", ({ roomId }) => {
        console.log("Join denied by host");
        this.isWaitingForResponse = false;
        alert("Chủ phòng đã từ chối yêu cầu của bạn.");
      });
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      alert("Lỗi thông tin người dùng. Vui lòng đăng nhập lại!");
      this.$router.push("/");
    }
  },
  methods: {
    // autoJoinRoom(user) {
    //   const roomId = this.$route.params.roomId;
      
    //   this.isWaitingForResponse = true;
      
    //   console.log(`Socket connected: ${socket.connected}`);
    //   console.log(`Socket id: ${socket.id}`);
    //   console.log(`Room ID from route: ${roomId}`);
    //   console.log(`User UID: ${user.uid}`);
    //   console.log(`User name: ${user.name}`);
      
    //   // Gửi yêu cầu tham gia phòng
    //   const requestData = {
    //     roomId: roomId,
    //     uid: user.uid,
    //     name: user.name
    //   };
      
    //   console.log(`Sending request-join-room with data:`, requestData);
      
    //   socket.emit("request-join-room", requestData);
      
    //   console.log(`Auto requesting to join room ${roomId}`);
      
    //   // Kiểm tra xem event có được gửi không
    //   setTimeout(() => {
    //     console.log(`Socket connected after 1s: ${socket.connected}`);
    //     console.log(`Socket id after 1s: ${socket.id}`);
    //   }, 1000);
    // },
    joinNow() {
      if (this.isWaitingForResponse) {
        alert("Đang chờ phản hồi từ chủ phòng...");
        return;
      }
      
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        alert("Vui lòng đăng nhập lại!");
        this.$router.push("/");
        return;
      }
      
      try {
        const user = JSON.parse(userStr);
        const roomId = this.$route.params.roomId;
        
        this.isWaitingForResponse = true;
        
        // Gửi yêu cầu tham gia phòng
        socket.emit("request-join-room", {
          roomId: roomId,
          uid: user.uid,
          name: user.name
        });
        
        console.log(`Requesting to join room ${roomId}`);
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
        alert("Lỗi thông tin người dùng. Vui lòng đăng nhập lại!");
        this.$router.push("/");
      }
    },
  },
  beforeUnmount() {
    // Xóa event listeners
    socket.off("join-approved");
    socket.off("join-denied");
  }
};
</script>
<style scoped>
.waiting-room-container {
  display: flex;
  flex-direction: column;
}
</style>
