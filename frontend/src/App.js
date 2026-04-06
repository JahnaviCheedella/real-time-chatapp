import { Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import AuthPage from "./views/AuthPage";
import Chat from "./views/Chat";
import { AuthContext } from "./context/AuthContext";

function App() {
  const { user } = useContext(AuthContext);

  return (
    <Routes>
      <Route
        path="/"
        element={user ? <Navigate to="/chat" /> : <AuthPage />}
      />
      <Route
        path="/chat"
        element={user ? <Chat /> : <Navigate to="/" />}
      />
    </Routes>
  );
}

export default App;

