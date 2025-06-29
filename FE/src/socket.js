import io from "socket.io-client";

const socket = io("/", {
  transport: ["websocket"],
  autoConnect: false,
});

export default socket;