import pool from "../config/db.js";

export const getMessages = async (req, res) => {
    const { otherUserId } = req.params;
    const userId = req.user.id; // From some potential auth middleware

    try {
        const messages = await pool.query(
            `SELECT * FROM messages 
             WHERE (sender_id = $1 AND receiver_id = $2) 
                OR (sender_id = $2 AND receiver_id = $1)
             ORDER BY created_at ASC`,
            [userId, otherUserId]
        );
        res.json(messages.rows);
    } catch (err) {
        console.error("Error fetching messages:", err.message);
        res.status(500).json({ message: "Internal server error" });
    }
};
