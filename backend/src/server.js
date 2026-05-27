import express from "express";
import cors from "cors";
import "dotenv/config";
import http from "http";
import { Server } from "socket.io";
import authRoute from "./routes/authRoute.js";
import chatRoute from "./routes/chatRoute.js";
import { setupChatSocket } from "./sockets/chatSocket.js";

const app = express();
app.use(express.json());
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

const server = http.createServer(app);

const io = new Server(server, {
  cors: { 
    origin: "*",
    methods: ["GET", "POST"]
  }
})

// Initialize web socket
setupChatSocket(io);

app.use("/api/auth", authRoute);
app.use("/api/chat", chatRoute);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


