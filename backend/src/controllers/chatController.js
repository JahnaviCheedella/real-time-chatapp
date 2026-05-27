import pool from "../config/db.js";

export const getMessages = async (req, res) => {
  const { otherUserId } = req.params;
  const userId = req.user.id;

  // Pagination: default page=1, 30 messages per page
  const page = parseInt(req.query.page) || 1;
  const limit = 30;
  const offset = (page - 1) * limit;

  try {
    const messages = await pool.query(
      `SELECT * FROM messages 
             WHERE (sender_id = $1 AND receiver_id = $2) 
                OR (sender_id = $2 AND receiver_id = $1)
             ORDER BY created_at ASC
             LIMIT $3 OFFSET $4`,
      [userId, otherUserId, limit, offset],
    );
    res.status(200).json(messages.rows);
  } catch (err) {
    console.error("Error fetching messages:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
