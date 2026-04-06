import pool from "../config/db.js";

//sender - me, receiver - another person
// 1. The "Phonebook": Maps permanent User IDs (from your DB) to temporary Socket IDs
const activeUsers = {}

// 2. Exporting the function
export const setupChatSocket = (io) => {
    // 3. Listen for any user who connects to the WebSocket server
    io.on("connection", (socket) => {
        // console.log(`New connection established: ${socket.id}`);
        


        // 4. When a user logs in, they send a "join" event with their DB ID
        socket.on("join", (userId) => {
            // Save their permanent ID as the key, and their temporary socket ID as the value
            activeUsers[userId] = socket.id;
            // console.log(`User ${userId} joined with socket ID ${socket.id}`);
            

            
            // Broadcast the updated online users list to EVERYONE
            io.emit("getOnlineUsers", Object.keys(activeUsers));
            
            // Also send DIRECTLY to this socket to ensure they get the "Welcome" state
            socket.emit("getOnlineUsers", Object.keys(activeUsers));
        });


        // 5. When a user wants to send a private message to someone else
        socket.on("sendMessage", async ({ senderId, receiverId, message }) => {
            // 5.0 Persist to Database FIRST
            try {
                await pool.query(
                    "INSERT INTO messages (sender_id, receiver_id, message) VALUES ($1, $2, $3)",
                    [senderId, receiverId, message]
                );
            } catch (err) {
                console.error("Database error while saving message:", err.message);
            }

            // Look up the receiver's temporary socket ID in our phonebook
            const receiverSocketId = activeUsers[receiverId];

            // If the receiver is currently online (exists in the phonebook)
            if (receiverSocketId) {
                // Send the message ONLY down the specific wire connected to the receiver
                io.to(receiverSocketId).emit("receiveMessage", { senderId, message });
            }
        });

        // 5.1 Handle Typing Status

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


        // 6. When a user closes their browser tab or loses internet
        socket.on("disconnect", () => {
            


            // Remove the user from the activeUsers object - once it finds the right user and deletes them, it stops searching so it doesn't waste server CPU power checking the rest of the list.
            for (const userId in activeUsers) {
                if (activeUsers[userId] === socket.id) {
                    

                    delete activeUsers[userId];
                    
                    // Broadcast the updated online users list to EVERYONE
                    io.emit("getOnlineUsers", Object.keys(activeUsers));
                    break; // Stop looping once we find and delete them
                }
            }
        })

    });
}

