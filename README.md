# Real-Time Glassmorphic Chat App

A full-stack real-time messaging platform built with **React**, **Node.js**, and **PostgreSQL**. This application features a modern, glassmorphic UI, persistent chat history, and real-time presence tracking.

## Core Features

- **Real-Time Private Messaging**: Instant message delivery using WebSockets (Socket.io).
- **Presence Tracking**: See who's "Online" or "Offline" in real-time.
- **Typing Indicators**: Visual feedback when someone is actively typing to you.
- **Chat history Persistence**: All messages are saved in PostgreSQL and retrieved when you select a contact.
- **JWT Authentication**: Secure login and registration with token-based authorization.
- **Session Persistence**: Stay logged in even after refreshing the page or closing the browser.
- **Modern UI/UX**: Stunning glassmorphic design using Material UI (MUI) with smooth transitions.

---

## Tech Stack

### Frontend
-   **React.js** (Functional Components & Hooks)
-   **Material UI (MUI)** (For a sleek, modern UI)
-   **Socket.io-client** (Real-time communication)
-   **Axios** (API requests)

### Backend
-   **Node.js & Express**
-   **Socket.io** (WebSocket server)
-   **PostgreSQL** (Relational Database)
-   **JWT (jsonwebtoken)** (Security & Session management)
-   **Denv** (Environment variable management)

---

## Database Schema

Run the following SQL commands in your PostgreSQL environment:

```sql
-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Messages Table (Persistent History)
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INT REFERENCES users(id),
    receiver_id INT REFERENCES users(id),
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Getting Started

### 1. Prerequisites
-   Node.js (v16+) installed.
-   PostgreSQL installed and running.

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` folder:
```env
DB_USER=...
DB_HOST=...
DB_DATABASE=...
DB_PASSWORD=...
DB_PORT=...
SERVER_PORT=...
JWT_SECRET=your_long_random_secret_string
```
Start the server:
```bash
npm start
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```
The app will open automatically at [http://localhost:3000](http://localhost:3000).

---

## Security
-   Passwords are NOT stored in plain text.
-   API endpoints (like history fetching) are protected by JWT Middleware.
-   Socket IDs are managed in-memory (volatile) while User IDs are used for persistent DB logic.