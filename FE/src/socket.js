import io from "socket.io-client";

const socket = io("http://localhost:5000", {
  transport: ["websocket"],
  autoConnect: false,
});

export default socket;