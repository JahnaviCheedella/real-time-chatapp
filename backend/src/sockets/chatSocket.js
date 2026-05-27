import pool from "../config/db.js";

// In-memory map: userId -> socketId
const activeUsers = {};

export const setupChatSocket = (io) => {
  io.on("connection", (socket) => {
    // 1. When a user logs in, save their socketId in activeUsers
    socket.on("join", (userId) => {
      activeUsers[userId] = socket.id;

      // Broadcast updated online users list to everyone
      io.emit("getOnlineUsers", Object.keys(activeUsers));
      socket.emit("getOnlineUsers", Object.keys(activeUsers));
    });

    // 2. Send private message
    socket.on("sendMessage", async ({ senderId, receiverId, message }) => {
      // 2.1 Save to DB first
      try {
        await pool.query(
          "INSERT INTO messages (sender_id, receiver_id, message) VALUES ($1, $2, $3)",
          [senderId, receiverId, message],
        );
      } catch (err) {
        console.error("DB error saving message:", err.message);
      }

      // 2.2 Deliver to receiver if online
      const receiverSocketId = activeUsers[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", { senderId, message });
      }
    });

    // 3. Typing indicators
    socket.on("typing", ({ senderId, receiverId }) => {
      const receiverSocketId = activeUsers[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("typing", { senderId });
      }
    });

    socket.on("stopTyping", ({ senderId, receiverId }) => {
      const receiverSocketId = activeUsers[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("stopTyping", { senderId });
      }
    });

    // 4. On disconnect - remove from activeUsers
    socket.on("disconnect", () => {
      for (const userId in activeUsers) {
        if (activeUsers[userId] === socket.id) {
          delete activeUsers[userId];
          io.emit("getOnlineUsers", Object.keys(activeUsers));
          break;
        }
      }
    });
  });
};
