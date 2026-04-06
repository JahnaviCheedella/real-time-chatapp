import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getMessages } from "../controllers/chatController.js";

const router = express.Router();

// Fetch message history with a specific user
router.get("/messages/:otherUserId", protect, getMessages);

export default router;
