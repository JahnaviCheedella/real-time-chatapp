import pool from "../config/db";

export const sendMessage = async (req, res) => {
    const { receiver_id, message } = req.body;
    const result = pool.query("INSER INTO messages(sender_id, receiver_id, message) VALUES ($1, $2, $3) RETURNNG *", [req.user.id, receiver_id, message]);
    res.json(result.rows[0])
}

export const getMessages = async (req, res) => {
    const { userId } = req.params;
    const result = pool.query("SELECT * FROM messages WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1) ORDER BY created_at)", [req.user.id, userId]);
    res.json(result.rows)
} 