<template>
  <div class="meeting-container">
    <video ref="localVideo" autoplay playsinline muted class="video-item"></video>
    <video ref="remoteVideo" autoplay playsinline class="video-item"></video>
    <div class="control-bar">
      <button @click="toggleMic" :class="{ active: isMicOn }">{{ isMicOn ? "Tắt Mic" : "Bật Mic" }}</button>
      <button @click="toggleCamera" :class="{ active: isCameraOn }">{{ isCameraOn ? "Tắt Camera" : "Bật Camera" }}</button>
      <button @click="leaveMeeting" class="leave-button">Rời phòng</button>
    </div>
  </div>
</template>

<script>
import socket from "../socket";

let peerConnection = null;
let localStream = null;
let remoteStream = null;

const config = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
};

export default {
  name: "Meeting",
  data() {
    return {
      isMicOn: true,
      isCameraOn: true,
      remoteSocketId: null,
    };
  },
  async mounted() {
    socket.connect();

    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    this.$refs.localVideo.srcObject = localStream;

    // Lấy user info từ localStorage
    const user = JSON.parse(localStorage.getItem("user"));

    socket.emit("join-room", {
      roomId: this.$route.params.roomId,
      uid: user.uid,
      name: user.name
    });

    socket.on("user-joined", ({ socketId }) => {
      this.remoteSocketId = socketId;
      this.createPeerConnection();
      localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
      peerConnection.createOffer().then(offer => {
        peerConnection.setLocalDescription(offer);
        socket.emit("offer", { target: socketId, offer });
      });
    });

    socket.on("offer", async (data) => {
      this.remoteSocketId = data.sender;
      this.createPeerConnection();
      await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
      localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      socket.emit("answer", { target: data.sender, answer });
    });

    socket.on("answer", async (data) => {
      await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
    });

    socket.on("candidate", async (data) => {
      if (data.candidate) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
      }
    });
  },
  methods: {
    createPeerConnection() {
      peerConnection = new RTCPeerConnection(config);

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("candidate", {
            target: this.remoteSocketId,
            candidate: event.candidate,
          });
        }
      };

      peerConnection.ontrack = (event) => {
        if (!remoteStream) {
          remoteStream = new MediaStream();
          this.$refs.remoteVideo.srcObject = remoteStream;
        }
        remoteStream.addTrack(event.track);
      };
    },
    toggleMic() {
      this.isMicOn = !this.isMicOn;
      if (localStream) {
        localStream.getAudioTracks().forEach(track => track.enabled = this.isMicOn);
      }
    },
    toggleCamera() {
      this.isCameraOn = !this.isCameraOn;
      if (localStream) {
        localStream.getVideoTracks().forEach(track => track.enabled = this.isCameraOn);
      }
    },
    async leaveMeeting() {
      socket.disconnect();
      if (peerConnection) peerConnection.close();
      this.$router.push("/dashboard");
    }
  },
  beforeUnmount() {
    socket.disconnect();
    if (peerConnection) peerConnection.close();
  }
};
</script>

<style scoped>
.meeting-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.video-item {
  width: 400px;
  height: 300px;
  background: #222;
  margin: 10px;
}
.control-bar {
  margin-top: 20px;
}
.leave-button {
  background: #e74c3c;
  color: #fff;
  margin-left: 10px;
}
</style>
