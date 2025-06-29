<template>
  <div class="waiting-room-container">
    <div class="video-placeholder">
      <p class="placeholder-text">Máy ảnh đang tắt</p>
    </div>
    <div class="meeting-info">
      <h2 class="meeting-title">{{ roomName }}</h2>
      <p class="meeting-status">Không có người nào khác ở đây</p>
      <button class="join-button" @click="joinNow">Tham gia ngay</button>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "Waiting",
  props: {
    roomName: {
      type: String,
      default: "STUDY WITH ME",
    },
  },
  methods: {
    async joinNow() {
      try {
        const response = await axios.post(`/api/v1/room/${this.$route.params.roomId}/join`);
        if (response.status === 200) {
          this.$router.push({
            name: "Meeting",
            params: { roomId: this.$route.params.roomId },
          });
        } else {
          alert("Không thể tham gia phòng. Hãy thử lại!");
        }
      } catch (error) {
        console.error("Lỗi khi tham gia phòng:", error);
        alert("Không thể tham gia phòng.");
      }
    },
  }
};
</script>
<style scoped>
.waiting-room-container {
  display: flex;
  flex-direction: column;
}
</style>
