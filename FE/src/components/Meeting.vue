<template>
  <div class="meeting-container">
    <div class="video-section">
      <div class="video-wrapper">
        <template v-if="isCameraOn && localStream">
          <video ref="localVideo" autoplay playsinline muted class="video-item local-video"></video>
        </template>
        <template v-else>
          <div class="avatar-placeholder">
            <i class="fas fa-user-circle"></i>
          </div>
        </template>
        <div class="video-label">{{ user?.name || 'Bạn' }}</div>
      </div>
      
      <!-- Hiển thị tất cả remote videos -->
      <div 
        v-for="(participant, socketId) in remoteParticipants" 
        :key="socketId"
        class="video-wrapper"
      >
        <template v-if="participant.isCameraOn">
          <video 
            :ref="`remoteVideo_${socketId}`"
            autoplay 
            playsinline 
            class="video-item remote-video"
          ></video>
        </template>
        <template v-else>
          <div class="avatar-placeholder">
            <i class="fa-solid fa-user"></i>
          </div>
        </template>
        <div class="video-label">{{ participant.name }}</div>
      </div>
    </div>
    
    <!-- Control Bar -->
    <div class="control-bar">
      <button @click="toggleMic" :class="{ active: isMicOn, inactive: !isMicOn }" class="control-btn" :title="isMicOn ? 'Tắt mic' : 'Bật mic'">
        <i :class="isMicOn ? 'fa-solid fa-microphone' : 'fa-solid fa-microphone-slash'"></i>
      </button>
      <button @click="toggleCamera" :class="{ active: isCameraOn, inactive: !isCameraOn }" class="control-btn" :title="isCameraOn ? 'Tắt camera' : 'Bật camera'">
        <i :class="isCameraOn ? 'fa-solid fa-camera' : 'fa-solid fa-camera-slash'"></i>
      </button>
      <button @click="leaveMeeting" class="leave-button" title="Rời phòng">
        <i class="fa-solid fa-phone-slash"></i>
      </button>
    </div>
    
    <!-- Room Info Bottom Left -->
    <div class="room-info">
      <div class="room-id">{{ currentTime }} | <b>{{ roomId }}</b></div>
    </div>

    <!-- Join Popup -->
    <transition name="fade">
      <div v-if="showJoinPopup" class="join-popup">
        <span><b>{{ joinPopupName }}</b> đã tham gia phòng</span>
      </div>
    </transition>

    <!-- Join Requests Section -->
    <div v-if="joinRequests.length > 0" class="requests-section">
      <h3>Yêu cầu tham gia phòng</h3>
      <div v-for="(request, index) in joinRequests" :key="index" class="request-item">
        <div class="request-info">
          <p><strong>{{ request.name }}</strong> muốn tham gia phòng</p>
          <p class="room-id">Room: {{ request.roomId }}</p>
        </div>
        <div class="request-actions">
          <button @click="respondToJoin(request, true)" class="accept-btn">Chấp nhận</button>
          <button @click="respondToJoin(request, false)" class="deny-btn">Từ chối</button>
        </div>
      </div>
    </div>

    <!-- Connection status -->
    <div class="connection-status">
      <p>Trạng thái kết nối: {{ connectionState }}</p>
      <p>Trạng thái ICE: {{ iceConnectionState }}</p>
      <p>Số người tham gia: {{ Object.keys(remoteParticipants).length + 1 }}</p>
    </div>

    <!-- Debug info -->
    <div v-if="showDebug" class="debug-info">
      <h4>Debug Info:</h4>
      <pre>{{ debugInfo }}</pre>
    </div>
  </div>
</template>

<script>
import socket from "../socket";

export default {
  name: "Meeting",
  data() {
    return {
      isMicOn: true,
      isCameraOn: true,
      joinRequests: [],
      user: null,
      roomId: null,
      connectionState: 'disconnected',
      iceConnectionState: 'disconnected',
      remoteParticipants: {},
      localStream: null,
      peerConnections: new Map(),
      remoteStreams: new Map(),
      showDebug: false,
      debugInfo: {},
      showJoinPopup: false,
      joinPopupName: '',
      currentTime: '',
    };
  },
  async mounted() {
    console.log("=== MEETING COMPONENT MOUNTED ===");
    
    try {
      await this.initializeComponent();
    } catch (error) {
      console.error("Error in meeting setup:", error);
      alert("Lỗi khi khởi tạo phòng meeting. Vui lòng thử lại!");
      this.$router.push("/dashboard");
    }

    this.updateTime();
    this.timeInterval = setInterval(this.updateTime, 1000);
  },
  watch: {
    isCameraOn(newVal) {
      if (newVal && this.localStream) {
        this.$nextTick(() => {
          if (this.$refs.localVideo) {
            this.$refs.localVideo.srcObject = this.localStream;
          }
        });
      }
      socket.emit('toggle-camera', { roomId: this.roomId, uid: this.user.uid, isCameraOn: newVal });
    },
    localStream(newStream) {
      this.$nextTick(() => {
        if (this.$refs.localVideo && newStream) {
          this.$refs.localVideo.srcObject = newStream;
        }
      });
    }
  },
  methods: {
    async initializeComponent() {
      // Lấy thông tin user và room
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        throw new Error("User not found in localStorage");
      }

      this.user = JSON.parse(userStr);
      this.roomId = this.$route.params.roomId;
      
      console.log("User info:", this.user);
      console.log("Room ID:", this.roomId);

      // Khởi tạo local stream trước
      await this.initializeLocalStream();
      
      // Kết nối socket
      if (!socket.connected) {
        socket.connect();
      }

      // Thiết lập socket listeners
    this.setupSocketListeners();

// Đảm bảo delay nhỏ để các socket.on() kịp thiết lập
setTimeout(async () => {
  if (socket.connected) {
    await this.joinRoom();
  } else {
    socket.on('connect', async () => {
      await this.joinRoom();
    });
  }
}, 300); // delay 300–500ms






    },

    async initializeLocalStream() {
      try {
        console.log("Initializing local stream...");
        this.localStream = await navigator.mediaDevices.getUserMedia({ 
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

        // Đảm bảo ref đã render xong
        this.$nextTick(() => {
          if (this.$refs.localVideo) {
            this.$refs.localVideo.srcObject = this.localStream;
          }
        });
        console.log("Local stream initialized successfully");
      } catch (error) {
        console.error("Error accessing media devices:", error);
        alert("Không thể truy cập camera/microphone. Vui lòng cho phép quyền truy cập!");
        throw error;
      }
    },

    setupSocketListeners() {
      console.log("=== SETTING UP SOCKET LISTENERS ===");
      
      // Remove existing listeners to prevent duplicates
      socket.off("user-joined");
      socket.off("offer");
      socket.off("answer");
      socket.off("candidate");
      socket.off("room-updated");
      socket.off("user-request-join");
      socket.off("user-left");

      // Set up new listeners
      socket.on("room-members", this.handleRoomMembers);
      socket.on("user-joined", this.handleUserJoined);
      socket.on("offer", this.handleOffer);
      socket.on("answer", this.handleAnswer);
      socket.on("candidate", this.handleCandidate);
      socket.on("room-updated", this.handleRoomUpdated);
      socket.on("user-request-join", this.handleJoinRequest);
      socket.on("user-left", this.handleUserLeft);
      socket.on("toggle-camera", this.handleToggleCamera);
    },

async handleRoomMembers(members) {
  for (const member of members) {
    const sid = member.socketId;
    this.remoteParticipants[sid] = { uid: member.uid, name: member.name, isCameraOn: true };
    setTimeout(async () => {
      const pc = await this.setupPeerConnection(sid, true);
      const offer = await pc.createOffer({ offerToReceiveAudio: true, offerToReceiveVideo: true });
      await pc.setLocalDescription(offer);
      socket.emit('offer', { target: sid, offer, sender: socket.id });
    }, 300);
  }
}
,
    
    async joinRoom() {
      console.log("=== JOINING ROOM ===");
      
      // Đăng ký user với socket
      socket.emit("register-user", { uid: this.user.uid });
      console.log(`User ${this.user.uid} registered with socket`);

      // Join room
      socket.emit("join-room", {
        roomId: this.roomId,
        uid: this.user.uid,
        name: this.user.name
      });
      console.log(`Joined room ${this.roomId}`);
    },

    async handleUserJoined({ socketId, uid, name }) {
      if (socketId === socket.id) {
        console.log("Ignoring self join event");
        return;
      }
      console.log(`User ${name} (${uid}) joined with socket ${socketId}`);
      // Vue 3: gán trực tiếp
      this.remoteParticipants[socketId] = { uid, name, isCameraOn: true };  
      // Đảm bảo cả host và client đều tạo peer connection,
      // chỉ phía có socket.id lớn hơn tạo offer để tránh double-offer
      const isInitiator = socket.id > socketId;
      const pc = await this.setupPeerConnection(socketId, isInitiator);
      if (isInitiator) {
        try {
          console.log(`Creating offer for ${socketId}`);
          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true
          });
          await pc.setLocalDescription(offer);
          console.log(`Sending offer to ${socketId}`);
          socket.emit('offer', {
            target: socketId,
            offer: offer,
            sender: socket.id
          });
        } catch (error) {
          console.error(`Error creating offer for ${socketId}:`, error);
        }
      }

      this.showJoinPopup = true;
      this.joinPopupName = name;
      setTimeout(() => { this.showJoinPopup = false; }, 2500);
    },

    async handleOffer({ sender, offer }) {
      console.log(`Received offer from ${sender}`);
      // Always create peer connection on offer
      const pc = await this.setupPeerConnection(sender, false);
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        console.log(`Set remote description for offer from ${sender}`);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('answer', {
          target: sender,
          answer: answer,
          sender: socket.id
        });
        console.log(`Sent answer to ${sender}`);
      } catch (error) {
        console.error(`Error handling offer from ${sender}:`, error);
      }
    },

    async handleAnswer({ sender, answer }) {
      console.log(`Received answer from ${sender}`);
      const pc = this.peerConnections.get(sender);
      if (!pc) {
        console.error(`No peer connection found for ${sender}`);
        return;
      }
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        console.log(`Set remote description for answer from ${sender}`);
      } catch (error) {
        console.error(`Error handling answer from ${sender}:`, error);
      }
    },

    async handleCandidate({ sender, candidate }) {
      console.log(`Received ICE candidate from ${sender}`);
      let pc = this.peerConnections.get(sender);
      if (!pc) {
        // Nếu chưa có peer connection, tạo mới
        pc = await this.setupPeerConnection(sender, false);
      }
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
        console.log(`Added ICE candidate from ${sender}`);
      } catch (error) {
        console.error(`Error adding ICE candidate from ${sender}:`, error);
      }
    },

    async setupPeerConnection(socketId, isInitiator = false) {
      console.log(`Setting up peer connection with ${socketId}, initiator: ${isInitiator}`);
      // Close existing connection if any
      if (this.peerConnections.has(socketId)) {
        this.peerConnections.get(socketId).close();
      }
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
        iceCandidatePoolSize: 10
      });
      this.peerConnections.set(socketId, pc);
      // Add local tracks
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          console.log(`Adding local track: ${track.kind}`);
          pc.addTrack(track, this.localStream);
        });
      }
      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          console.log(`Sending ICE candidate to ${socketId}`);
          socket.emit('candidate', {
            target: socketId,
            candidate: event.candidate,
            sender: socket.id
          });
        } else {
          console.log(`All ICE candidates sent to ${socketId}`);
        }
      };
      // Handle remote stream
      pc.ontrack = (event) => {
        console.log(`Received remote track from ${socketId}:`, event.track.kind);
        if (!this.remoteStreams.has(socketId)) {
          this.remoteStreams.set(socketId, new MediaStream());
        }
        const remoteStream = this.remoteStreams.get(socketId);
        // Add track to stream if not already added
        if (!remoteStream.getTracks().find(t => t.id === event.track.id)) {
          remoteStream.addTrack(event.track);
          console.log(`Added ${event.track.kind} track to remote stream`);
        }
        // Update video element in next tick
       const trySetVideo = (refName, stream, attempts = 10) => {
  const video = this.$refs[refName];
  if (!video) {
    if (attempts > 0) {
      setTimeout(() => trySetVideo(refName, stream, attempts - 1), 100);
    }
    return;
  }
  
  const el = Array.isArray(video) ? video[0] : video;
  if (el instanceof HTMLVideoElement) {
    el.srcObject = stream;
    console.log(`Set srcObject for ${refName}`);
  }
};

this.$nextTick(() => {
  trySetVideo(`remoteVideo_${socketId}`, remoteStream);
});

      };
      // Connection state changes       
      pc.onconnectionstatechange = () => {
        this.connectionState = pc.connectionState;
        console.log(`Connection state with ${socketId}:`, pc.connectionState);
        if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
          console.log(`Connection failed with ${socketId}, attempting restart`);
          this.restartIce(socketId);
        }
      };
      pc.oniceconnectionstatechange = () => {
        this.iceConnectionState = pc.iceConnectionState;
        console.log(`ICE state with ${socketId}:`, pc.iceConnectionState);
      };
      pc.ondatachannel = (event) => {
        console.log(`Data channel received from ${socketId}`);
      };
      return pc;
    },

    handleRoomUpdated(data) {
      console.log("Room updated:", data);
      this.updateDebugInfo();
    },

    handleJoinRequest({ roomId, uid, name }) {
      console.log(`Join request from ${name} (${uid})`);
      if (roomId !== this.roomId) return;
      
      if (!this.joinRequests.some(req => req.uid === uid)) {
        this.joinRequests.push({ roomId, uid, name });
      }
    },

    handleUserLeft({ socketId, uid, name }) {
      console.log(`User left: ${name} (${socketId})`);
      this.cleanupPeer(socketId);
      delete this.remoteParticipants[socketId];
    },

    cleanupPeer(socketId) {
      console.log(`Cleaning up peer ${socketId}`);
      
      // Close peer connection
      if (this.peerConnections.has(socketId)) {
        this.peerConnections.get(socketId).close();
        this.peerConnections.delete(socketId);
      }
      
      // Stop remote stream
      if (this.remoteStreams.has(socketId)) {
        const stream = this.remoteStreams.get(socketId);
        stream.getTracks().forEach(track => track.stop());
        this.remoteStreams.delete(socketId);
      }
    },

    async restartIce(socketId) {
      console.log(`Restarting ICE for ${socketId}`);
      const pc = this.peerConnections.get(socketId);
      if (pc) {
        try {
          await pc.restartIce();
        } catch (error) {
          console.error(`Error restarting ICE for ${socketId}:`, error);
        }
      }
    },

    respondToJoin(request, accept) {
      console.log(`${accept ? 'Accepting' : 'Rejecting'} join request from ${request.name}`);
      
      socket.emit("host-respond-join", {
        roomId: request.roomId,
        uid: request.uid,
        accept: accept
      }, (ack) => {
        if (ack?.success) {
          this.joinRequests = this.joinRequests.filter(req => req.uid !== request.uid);
        }
      });
    },

    toggleMic() {
      this.isMicOn = !this.isMicOn;
      if (this.localStream) {
        this.localStream.getAudioTracks().forEach(track => {
          track.enabled = this.isMicOn;
        });
      }
      console.log(`Microphone ${this.isMicOn ? 'enabled' : 'disabled'}`);
    },

    toggleCamera() {
      this.isCameraOn = !this.isCameraOn;
      if (this.localStream) {
        this.localStream.getVideoTracks().forEach(track => {
          track.enabled = this.isCameraOn;
        });
      }
      // Gán lại srcObject khi bật lại camera
      if (this.isCameraOn && this.$refs.localVideo) {
        this.$refs.localVideo.srcObject = this.localStream;
      }
      console.log(`Camera ${this.isCameraOn ? 'enabled' : 'disabled'}`);
    },

    updateDebugInfo() {
      this.debugInfo = {
        localStream: !!this.localStream,
        peerConnections: this.peerConnections.size,
        remoteStreams: this.remoteStreams.size,
        remoteParticipants: Object.keys(this.remoteParticipants).length,
        socketConnected: socket.connected,
        socketId: socket.id
      };
    },

    async leaveMeeting() {
      console.log("Leaving meeting...");
      
      // Gửi sự kiện rời phòng
      socket.emit("leave-room", { roomId: this.roomId });
      
      // Dọn dẹp tất cả peer connections
      this.peerConnections.forEach(pc => pc.close());
      this.peerConnections.clear();
      
      // Stop local stream
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => track.stop());
        this.localStream = null;
      }
      
      // Stop remote streams
      this.remoteStreams.forEach(stream => {
        stream.getTracks().forEach(track => track.stop());
      });
      this.remoteStreams.clear();
      
      // Clean up data
      this.remoteParticipants = {};
      
      // Chuyển về dashboard
      this.$router.push("/dashboard");
    },

    updateTime() {
      const now = new Date();
      const h = now.getHours().toString().padStart(2, '0');
      const m = now.getMinutes().toString().padStart(2, '0');
      this.currentTime = `${h}:${m}`;
    },

    handleToggleCamera({ uid, isCameraOn }) {
      // Tìm participant theo uid và cập nhật trạng thái camera
      for (const [socketId, participant] of Object.entries(this.remoteParticipants)) {
        if (participant.uid === uid) {
          this.remoteParticipants[socketId].isCameraOn = isCameraOn;
        }
      }
    },
  },
  beforeUnmount() {
    console.log("Meeting component unmounting");
    this.leaveMeeting();
    
    // Remove socket listeners
    socket.off("user-joined", this.handleUserJoined);
    socket.off("offer", this.handleOffer);
    socket.off("answer", this.handleAnswer);
    socket.off("candidate", this.handleCandidate);
    socket.off("room-updated", this.handleRoomUpdated);
    socket.off("user-request-join", this.handleJoinRequest);
    socket.off("user-left", this.handleUserLeft);
    socket.off("toggle-camera", this.handleToggleCamera);

    clearInterval(this.timeInterval);
  }
};
</script>

<style scoped>
.meeting-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  min-width: 100vw;
  width: 100vw;
  height: 100vh;
  background: #000;
  position: relative;
  padding: 0;
  overflow: hidden;
}

.video-section {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 24px;
  width: 100vw;
  min-height: 80vh;
  margin-top: 24px;
}

.video-wrapper {
  flex: 1 1 320px;
  max-width: 480px;
  min-width: 220px;
  aspect-ratio: 4/3;
  margin: 8px;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  background: #222;
  box-shadow: 0 4px 16px rgba(0,0,0,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-item {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #222;
  display: block;
}

.video-label {
  position: absolute;
  left: 16px;
  bottom: 16px;
  background: rgba(0,0,0,0.7);
  color: #fff;
  padding: 6px 16px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 500;
  pointer-events: none;
}

.avatar-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #3a2352;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  font-size: 110px;
  color: #bdbdbd;
  box-shadow: 0 2px 12px rgba(0,0,0,0.18);
}

.control-bar {
  position: fixed;
  left: 50%;
  bottom: 32px;
  transform: translateX(-50%);
  display: flex;
  gap: 18px;
  background: rgba(24,24,24,0.95);
  border-radius: 32px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.18);
  padding: 10px 32px;
  z-index: 10;
}

.control-btn {
  width: 56px;
  height: 56px;
  border: none;
  border-radius: 50%;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #232323;
  color: #fff;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
}

.control-btn.active {
  background: #28a745;
  color: #fff;
}

.control-btn.inactive {
  background: #dc3545;
  color: #fff;
}

.control-btn:hover {
  background: #444;
}

.leave-button {
  background: #dc3545;
  color: #fff;
  border: none;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 8px;
  transition: background 0.2s;
}

.leave-button:hover {
  background: #b71c1c;
}

.room-info {
  position: fixed;
  left: 32px;
  bottom: 24px;
  color: #fff;
  font-size: 16px;
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.room-id {
  font-family: 'Courier New', monospace;
  font-size: 16px;
  opacity: 0.95;
}

.requests-section {
  position: fixed;
  right: 32px;
  bottom: 32px;
  background: #fff;
  border-radius: 14px;
  padding: 16px 18px 14px 18px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
  max-width: 320px;
  width: 100%;
  min-width: 220px;
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 200;
}

.requests-section h3 {
  margin-top: 0;
  margin-bottom: 18px;
  color: #333;
  text-align: center;
  font-size: 22px;
  font-weight: 600;
}

.request-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  padding: 18px 16px 14px 16px;
  background: #f8f9fa;
  border-radius: 12px;
  margin-bottom: 12px;
  border-left: 4px solid #1a73e8;
  width: 100%;
  box-sizing: border-box;
  box-shadow: 0 2px 8px rgba(26,115,232,0.06);
}

.request-info p {
  margin: 0 0 6px 0;
  font-size: 16px;
  color: #222;
}

.room-id {
  font-size: 13px;
  color: #666;
  margin-top: 2px;
}

.request-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.accept-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  transition: background-color 0.2s;
  box-shadow: 0 2px 8px rgba(40,167,69,0.08);
}
.accept-btn:hover {
  background: #218838;
}

.deny-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  transition: background-color 0.2s;
  box-shadow: 0 2px 8px rgba(220,53,69,0.08);
}
.deny-btn:hover {
  background: #c82333;
}

.connection-status {
  position: fixed;
  bottom: 10px;
  left: 10px;
  background: rgba(0,0,0,0.8);
  color: white;
  padding: 10px;
  border-radius: 5px;
  font-size: 11px;
  max-width: 200px;
}

.debug-info {
  position: fixed;
  bottom: 10px;
  right: 10px;
  background: rgba(0,0,0,0.8);
  color: white;
  padding: 10px;
  border-radius: 5px;
  font-size: 10px;
  max-width: 300px;
  max-height: 200px;
  overflow-y: auto;
}

.debug-info pre {
  margin: 0;
  white-space: pre-wrap;
}

@media (max-width: 768px) {
  .video-section {
    grid-template-columns: 1fr;
  }
  
  .video-item {
    height: 200px;
  }
  
  .request-item {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }
  
  .request-actions {
    justify-content: center;
  }
  
  .connection-status,
  .debug-info {
    position: relative;
    margin-top: 20px;
  }
}

.join-popup {
  position: fixed;
  left: 32px;
  bottom: 100px;
  background: rgba(40, 167, 69, 0.95);
  color: #fff;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  box-shadow: 0 2px 8px rgba(0,0,0,0.18);
  z-index: 100;
  min-width: 0;
  max-width: 320px;
  text-align: left;
  animation: fadeInUp 0.3s;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>