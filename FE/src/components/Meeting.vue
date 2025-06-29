<template>
  <div class="meeting-container">
    <div class="video-grid">
      <div class="video-item">
        <p v-if="!isCameraOn" class="placeholder-text">Máy ảnh đang tắt</p>
      </div>
    </div>
    <div class="control-bar">
      <button @click="toggleMic" :class="{ active: isMicOn }">{{ isMicOn ? "Tắt Mic" : "Bật Mic" }}</button>
      <button @click="toggleCamera" :class="{ active: isCameraOn }">{{ isCameraOn ? "Tắt Camera" : "Bật Camera" }}</button>
      <button @click="leaveMeeting" class="leave-button">Rời phòng</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "Meeting",
  data() {
    return {
      isMicOn: true,
      isCameraOn: false,
      meetingName: "STUDY WITH ME",
    };
  },
  methods: {
    toggleMic() {
      this.isMicOn = !this.isMicOn;
    },
    toggleCamera() {
      this.isCameraOn = !this.isCameraOn;
    },
    async leaveMeeting() {
      try {
        const response = await axios.post(`/api/v1/room/${this.$route.params.roomId}/leave`);
        if (response.status === 200) {
          alert("Bạn đã rời phòng!");
          this.$router.push("/dashboard");
        } else {
          alert("Không thể rời phòng. Hãy thử lại!");
        }
      } catch (error) {
        console.error("Lỗi khi rời phòng:", error);
        alert("Không thể rời phòng.");
      }
    },
  },
};
</script>

<style scoped>
.meeting-container {
  display: flex;
  flex-direction: column;
}
</style>
