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
