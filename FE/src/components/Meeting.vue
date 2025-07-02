<template>
  <div class="meeting-container">
    <div class="video-section">
      <div class="video-wrapper">
        <video ref="localVideo" autoplay playsinline muted class="video-item local-video"></video>
        <div class="video-label">Bạn</div>
      </div>
      
      <!-- Hiển thị tất cả remote videos -->
      <div 
        v-for="(participant, socketId) in remoteParticipants" 
        :key="socketId"
        class="video-wrapper"
      >
        <video 
          :ref="`remoteVideo_${socketId}`"
          autoplay 
          playsinline 
          class="video-item remote-video"
        ></video>
        <div class="video-label">{{ participant.name }}</div>
      </div>
    </div>
    
    <div class="control-bar">
      <button @click="toggleMic" :class="{ active: isMicOn, inactive: !isMicOn }" class="control-btn">
        {{ isMicOn ? "🎤 Mic On" : "🎤 Mic Off" }}
      </button>
      <button @click="toggleCamera" :class="{ active: isCameraOn, inactive: !isCameraOn }" class="control-btn">
        {{ isCameraOn ? "📹 Camera On" : "📹 Camera Off" }}
      </button>
      <button @click="leaveMeeting" class="leave-button">🚪 Rời phòng</button>
    </div>
    
    <!-- Join Requests Section -->
    <div v-if="joinRequests.length > 0" class="requests-section">
      <h3>Yêu cầu tham gia phòng</h3>
      <div v-for="(request, index) in joinRequests" :key="index" class="request-item">
        <div class="request-info">
          <p><strong>{{ request.name }}</strong> muốn tham gia phòng</p>
          <p class="room-id">Room: {{ request.roomId }}</p>
        </div>
        <div class="request-actions">
          <button @click="respondToJoin(request, true)" class="accept-btn">✅ Chấp nhận</button>
          <button @click="respondToJoin(request, false)" class="deny-btn">❌ Từ chối</button>
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
      debugInfo: {}
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

      // Đợi socket kết nối xong rồi mới join room
      if (socket.connected) {
        await this.joinRoom();
      } else {
        socket.on('connect', async () => {
          console.log("Socket connected in meeting!");
          await this.joinRoom();
        });
      }
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
        
        this.$refs.localVideo.srcObject = this.localStream;
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
    },

    async handleRoomMembers(members) {
      for (const member of members) {
        this.remoteParticipants[member.socketId] = { uid: member.uid, name: member.name };
        // Không tạo offer, chỉ setup peer connection (chờ offer từ họ)
        await this.setupPeerConnection(member.socketId, false);
      }
    },
    
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
      this.remoteParticipants[socketId] = { uid, name };  
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
    console.log(`✅ Set srcObject for ${refName}`);
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
    }
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
  }
};
</script>

<style scoped>
.meeting-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  min-height: 100vh;
  background: #f5f5f5;
}

.video-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
  max-width: 1200px;
  width: 100%;
}

.video-wrapper {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.video-item {
  width: 100%;
  height: 250px;
  background: #222;
  object-fit: cover;
  display: block;
}

.local-video {
  border: 3px solid #007bff;
}

.remote-video {
  border: 3px solid #28a745;
}

.video-label {
  position: absolute;
  bottom: 10px;
  left: 10px;
  background: rgba(0,0,0,0.7);
  color: white;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 12px;
  font-weight: 500;
}

.control-bar {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  flex-wrap: wrap;
  justify-content: center;
}

.control-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.control-btn.active {
  background: #28a745;
  color: white;
}

.control-btn.inactive {
  background: #dc3545;
  color: white;
}

.leave-button {
  background: #dc3545;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.leave-button:hover {
  background: #c82333;
}

.requests-section {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  max-width: 600px;
  width: 100%;
  margin-bottom: 20px;
}

.requests-section h3 {
  margin-top: 0;
  margin-bottom: 20px;
  color: #333;
  text-align: center;
}

.request-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 10px;
  border-left: 4px solid #007bff;
}

.request-info p {
  margin: 0;
  margin-bottom: 5px;
}

.room-id {
  font-size: 12px;
  color: #666;
}

.request-actions {
  display: flex;
  gap: 10px;
}

.accept-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.3s;
}

.accept-btn:hover {
  background: #218838;
}

.deny-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.3s;
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
</style>