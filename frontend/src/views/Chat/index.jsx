import { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import { socket } from "../../socket/socket";
import { httpCommon } from "../../httpCommon";
import {
    Box,
    Typography,
    IconButton,
    Paper,
    Avatar,
    Divider,
    InputBase,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Tooltip,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import LogoutIcon from "@mui/icons-material/Logout";

const Chat = () => {
    const { user, setUser, setToken } = useContext(AuthContext);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [usersList, setUsersList] = useState([]); // All users
    const [onlineUsers, setOnlineUsers] = useState([]); // Array of online IDs
    const [selectedContact, setSelectedContact] = useState(null); // Current chat target
    const [isReceiverTyping, setIsReceiverTyping] = useState(false); // Typing status
    const scrollRef = useRef();
    const typingTimeoutRef = useRef(null);

    // Fetch all users on mount
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await httpCommon.get("/auth/users");
                // Exclude current user from the list
                const filteredUsers = res.data.filter(u => u.id !== user?.id);
                setUsersList(filteredUsers);
                // Select first user by default if available
                if (filteredUsers.length > 0) {
                    setSelectedContact(filteredUsers[0]);
                }
            } catch (err) {
                console.error("Failed to fetch users:", err);
            }
        };
        if (user) fetchUsers();
    }, [user]);

    // Fetch messages history when switching contact
    useEffect(() => {
        const fetchHistory = async () => {
            if (!selectedContact?.id) return;
            try {
                const res = await httpCommon.get("/chat/messages/" + selectedContact.id);
                setMessages(res.data);

            } catch (err) {
                console.error("Failed to fetch message history:", err);
                setMessages([]);
            }
        };

        if (selectedContact) {
            fetchHistory();
        } else {
            setMessages([]);
        }
        setIsReceiverTyping(false);
    }, [selectedContact?.id]);



    // Messaging & Status Listeners
    useEffect(() => {
        if (!user) return;

        const handleReceive = (data) => {



            // Ensure type-safe ID comparison (Number == Number)
            const senderId = Number(data.senderId);
            const currentContactId = Number(selectedContact?.id);

            if (senderId === currentContactId) {
                setMessages((prev) => [...prev, data]);
            } else {

            }
        };


        const handleTyping = (data) => {
            if (Number(data.senderId) === Number(selectedContact?.id)) {
                setIsReceiverTyping(true);
            }
        };

        const handleStopTyping = (data) => {
            if (Number(data.senderId) === Number(selectedContact?.id)) {
                setIsReceiverTyping(false);
            }
        };

        const handleOnlineUsers = (users) => {
            setOnlineUsers(users);
        };


        // 1. Attach listeners FIRST
        socket.on("receiveMessage", handleReceive);
        socket.on("typing", handleTyping);
        socket.on("stopTyping", handleStopTyping);
        socket.on("getOnlineUsers", handleOnlineUsers);

        // 2. ONLY THEN send the "join" signal to trigger the "Welcome" status list
        if (user?.id) {
            socket.emit("join", user.id);
        }


        return () => {
            socket.off("receiveMessage", handleReceive);
            socket.off("typing", handleTyping);
            socket.off("stopTyping", handleStopTyping);
            socket.off("getOnlineUsers", handleOnlineUsers);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, [user, selectedContact?.id]); // Re-subscribe when contact changes to ensure closure has the right contact ID


    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = () => {
        if (!message.trim() || !selectedContact) return;

        const msgData = {
            senderId: user.id,
            receiverId: Number(selectedContact.id),
            message
        };

        socket.emit("sendMessage", msgData);

        // Also stop typing immediately
        socket.emit("stopTyping", { senderId: user.id, receiverId: selectedContact.id });
        setMessages((prev) => [...prev, msgData]);
        setMessage("");
    }

    const handleTypingInput = (e) => {
        setMessage(e.target.value);
        if (!selectedContact) return;

        // Emit typing event
        socket.emit("typing", { senderId: user.id, receiverId: selectedContact.id });

        // Reset stopTyping timer
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("stopTyping", { senderId: user.id, receiverId: selectedContact.id });
        }, 2000);
    }

    const handleLogout = () => {
        setUser(null);
        setToken(null);
    }

    const isUserOnline = (userId) => {
        return onlineUsers.some(id => Number(id) === Number(userId));
    }

    return (
        <Box
            sx={{
                height: "100vh",
                display: "flex",
                background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
                p: { xs: 0, md: 2 },
            }}
        >
            {/* Sidebar - Dynamic Contacts List */}
            <Box
                sx={{
                    width: { xs: "0", md: "320px" },
                    display: { xs: "none", md: "flex" },
                    flexDirection: "column",
                    background: "rgba(30, 41, 59, 0.5)",
                    backdropFilter: "blur(10px)",
                    borderRight: "1px solid rgba(255, 255, 255, 0.05)",
                    borderRadius: "16px 0 0 16px",
                }}
            >
                <Box sx={{ p: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "#fff" }}>Messages</Typography>
                    <Tooltip title="Logout" placement="bottom" arrow>
                        <IconButton size="small" sx={{ color: "#f43f5e" }} onClick={handleLogout}>
                            <LogoutIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
                <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.05)" }} />

                <List sx={{ px: 1, overflowY: "auto" }}>
                    {usersList.map((contact) => {
                        const online = isUserOnline(contact.id);
                        const typing = selectedContact?.id === contact.id && isReceiverTyping;

                        return (
                            <ListItem
                                key={contact.id}
                                button
                                onClick={() => setSelectedContact(contact)}
                                sx={{
                                    borderRadius: 2,
                                    mb: 1,
                                    bgcolor: selectedContact?.id === contact.id ? "rgba(99, 102, 241, 0.2)" : "transparent",
                                    transition: "all 0.2s",
                                    "&:hover": { bgcolor: "rgba(255, 255, 255, 0.05)" },
                                }}
                            >
                                <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: selectedContact?.id === contact.id ? "#6366f1" : "rgba(255, 255, 255, 0.1)" }}>
                                        {contact.username?.[0]?.toUpperCase() || "?"}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={contact.username}
                                    secondary={typing ? "Typing..." : (online ? "Online" : "Offline")}
                                    primaryTypographyProps={{ color: "#fff", fontWeight: 600 }}
                                    secondaryTypographyProps={{
                                        color: typing || online ? "#4ade80" : "#94a3b8",
                                        sx: { fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 0.5 }
                                    }}
                                />
                                {online && <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "#4ade80", ml: 1 }} />}
                            </ListItem>
                        );
                    })}
                    {usersList.length === 0 && (
                        <Typography variant="body2" sx={{ color: "#94a3b8", textAlign: "center", mt: 4 }}>
                            No other users online.
                        </Typography>
                    )}
                </List>
            </Box>

            {/* Main Chat Area */}
            <Box
                sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    background: "rgba(30, 41, 59, 0.7)",
                    backdropFilter: "blur(12px)",
                    borderRadius: { xs: 0, md: "0 16px 16px 0" },
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                {/* Header */}
                <Box sx={{ p: 2, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255, 255, 255, 0.05)" }}>
                    {selectedContact ? (
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar sx={{ bgcolor: "#6366f1", width: 40, height: 40 }}>{selectedContact.username?.[0]?.toUpperCase() || "?"}</Avatar>
                            <Box sx={{ ml: 2 }}>
                                <Typography variant="body1" sx={{ fontWeight: 600, color: "#fff" }}>{selectedContact.username}</Typography>
                                <Typography variant="caption" sx={{ color: isReceiverTyping || isUserOnline(selectedContact.id) ? "#4ade80" : "#94a3b8" }}>
                                    {isReceiverTyping ? "Typing..." : (isUserOnline(selectedContact.id) ? "● Online" : "● Offline")}
                                </Typography>
                            </Box>
                        </Box>
                    ) : (
                        <Typography variant="body1" sx={{ color: "#94a3b8" }}>Select a contact to start chatting</Typography>
                    )}
                    <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                        Hello, {user?.username}
                    </Typography>
                </Box>

                {/* Messages List Area */}
                <Box sx={{ flex: 1, p: 3, overflowY: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
                    {!selectedContact && (
                        <Box sx={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", opacity: 0.5 }}>
                            <Typography sx={{ color: "#fff" }}>Select a conversation to reveal your history</Typography>
                        </Box>
                    )}
                    {messages.map((m, i) => (
                        <Box
                            key={i}
                            sx={{
                                alignSelf: m.senderId === user.id ? "flex-end" : "flex-start",
                                maxWidth: "70%",
                            }}
                        >
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 1.5,
                                    borderRadius: m.senderId === user.id ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                                    background: m.senderId === user.id ? "linear-gradient(90deg, #6366f1, #4f46e5)" : "rgba(255, 255, 255, 0.05)",
                                    color: "#fff",
                                }}
                            >
                                <Typography variant="body1">{m.message}</Typography>
                            </Paper>
                        </Box>
                    ))}
                    <div ref={scrollRef} />
                </Box>

                {/* Input Area */}
                <Box sx={{ p: 3, background: "rgba(15, 23, 42, 0.3)" }}>
                    <Paper
                        elevation={0}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            p: "4px 12px",
                            borderRadius: "12px",
                            background: selectedContact ? "rgba(255, 255, 255, 0.05)" : "rgba(0,0,0,0.1)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                        }}
                    >
                        <InputBase
                            disabled={!selectedContact}
                            sx={{ ml: 1, flex: 1, color: "#fff" }}
                            placeholder={selectedContact ? "Type a message..." : "Select a contact first"}
                            value={message}
                            onChange={handleTypingInput}
                            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                        />
                        <IconButton sx={{ color: "#6366f1" }} onClick={sendMessage} disabled={!selectedContact}>
                            <SendIcon />
                        </IconButton>
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
}

export default Chat;