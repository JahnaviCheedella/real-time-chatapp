import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#6366f1",
      light: "#818cf8",
      dark: "#4f46e5",
    },
    secondary: {
      main: "#ec4899",
    },
    background: {
      default: "#0f172a",
      paper: "rgba(30, 41, 59, 0.7)",
    },
    text: {
      primary: "#f8fafc",
      secondary: "#94a3b8",
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
    h5: {
      fontWeight: 700,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 8,
          padding: "10px 24px",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(255, 255, 255, 0.3)",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(255, 255, 255, 0.5)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#fff",
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          color: "#fff",
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#94a3b8",
          "&.Mui-focused": {
            color: "#fff",
          },
        },
      },
    },
  },
});


export default theme;
