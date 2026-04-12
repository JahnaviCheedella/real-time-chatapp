import pool from "../config/db.js";
import generateToken from "../utils/jwt.js";
import bcrypt from "bcrypt";

export const registerUser = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        // Check if user already exists
        const existingUser = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: "User with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
            [username, email, hashedPassword]
        );
        res.status(201).json({ message: "User registered successfully", user: result.rows[0] });
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ message: "Internal server error during registration" });
    }
}

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const userResult = await pool.query("SELECT * FROM users WHERE email=$1", [email]);

        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: "User not found. Please register first." });
        }

        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = generateToken(user);
        res.status(200).json({ token, user: { id: user.id, username: user.username, email: user.email } });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Internal server error during login" });
    }
}

export const getUsers = async (req, res) => {
    try {
        const users = await pool.query("SELECT id, username, email FROM users");
        res.status(200).json(users.rows);
    } catch (err) {
        console.error("Fetch users error:", err);
        res.status(500).json({ message: "Internal server error fetching users" });
    }
}

