// test-client.js
const { io } = require("socket.io-client");

// Connect to your backend Socket.IO server URL
const socket = io("http://localhost:5000", {
  transports: ["websocket", "polling"], // allow fallback
});

socket.on("connect", () => {
  console.log("Connected to server with id:", socket.id);

  // Request all notifications
  socket.emit("notifications:fetchAll");
});

socket.on("notifications:all", (notifications) => {
  console.log("Received notifications:", notifications);

  // Close connection after receiving data
  socket.disconnect();
});

socket.on("notifications:error", (err) => {
  console.error("Error fetching notifications:", err);
  socket.disconnect();
});

socket.on("disconnect", () => {
  console.log("Disconnected from server");
});

socket.on("connect_error", (err) => {
  console.error("Connection error:", err.message);
});
