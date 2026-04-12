import { useState, useContext } from "react";
import { Box, TextField, Typography, Button, Paper, Container, Fade, Snackbar, Alert } from "@mui/material";

import { httpCommon } from "../../httpCommon";
import { AuthContext } from "../../context/AuthContext";

export default function AuthPage() {
  const { setUser, setToken } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setLoading(true);

    if (!form.email || !form.password || (!isLogin && !form.username)) {
      setSnackbar({ open: true, message: "Please fill in all fields.", severity: "warning" });
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const res = await httpCommon.post("/auth/login", {
          email: form.email,
          password: form.password,
        });

        if (res.data.token) {
          setToken(res.data.token);
          setUser(res.data.user);
        }
      } else {
        await httpCommon.post("/auth/register", {
          username: form.username,
          email: form.email,
          password: form.password,
        });

        setSnackbar({ open: true, message: "Registered successfully. Please login.", severity: "success" });
        setIsLogin(true);
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "An error occurred. Please check your credentials.",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          width: "300px",
          height: "300px",
          borderRadius: "50%",
          background: "radial-gradient(circle, #6366f1 0%, transparent 70%)",
          top: "-100px",
          right: "-100px",
          opacity: 0.4,
          filter: "blur(60px)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, #ec4899 0%, transparent 70%)",
          bottom: "-150px",
          left: "-150px",
          opacity: 0.3,
          filter: "blur(80px)",
        }}
      />

      <Container maxWidth="xs" sx={{ position: "relative", zIndex: 1 }}>
        <Fade in timeout={800}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              background: "rgba(30, 41, 59, 0.7)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
            }}
          >
            <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4, background: "linear-gradient(90deg, #818cf8, #f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {isLogin ? "Welcome Back" : "Create Account"}
            </Typography>

            <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2.5 }}>
              {!isLogin && (
                <TextField
                  fullWidth
                  name="username"
                  label="Username"
                  variant="outlined"
                  value={form.username}
                  onChange={handleChange}
                  slotProps={{ inputLabel: { sx: { color: "#94a3b8" } } }}
                />
              )}

              <TextField
                fullWidth
                name="email"
                label="Email"
                variant="outlined"
                value={form.email}
                onChange={handleChange}
                slotProps={{ inputLabel: { sx: { color: "#94a3b8" } } }}

              />

              <TextField
                fullWidth
                type="password"
                name="password"
                label="Password"
                variant="outlined"
                value={form.password}
                onChange={handleChange}
                slotProps={{ inputLabel: { sx: { color: "#94a3b8" } } }}

              />

              <Button
                fullWidth
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                sx={{
                  mt: 2,
                  py: 1.5,
                  fontSize: "1rem",
                  background: "linear-gradient(90deg, #6366f1, #4f46e5)",
                  "&:hover": {
                    background: "linear-gradient(90deg, #4f46e5, #4338ca)",
                  },
                }}
              >
                {loading ? "Processing..." : isLogin ? "Login" : "Register"}
              </Button>

              <Typography
                variant="body2"
                align="center"
                sx={{ mt: 2, color: "#94a3b8" }}
              >
                {isLogin ? "New to the platform? " : "Already have an account? "}
                <Box
                  component="span"
                  onClick={() => setIsLogin(!isLogin)}
                  sx={{
                    color: "#818cf8",
                    cursor: "pointer",
                    fontWeight: 600,
                    "&:hover": { color: "#fff", textDecoration: "underline" },
                    transition: "color 0.2s",
                  }}
                >
                  {isLogin ? "Register here" : "Login here"}
                </Box>
              </Typography>

            </Box>
          </Paper>
        </Fade>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >

        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>

  );
}
