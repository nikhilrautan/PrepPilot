import { useContext } from "react";
import { AuthContext } from "../auth.context";
import { login, register, logout } from "../services/auth.api";

export const useAuth = () => {
    const { user, setUser, loading, setLoading } = useContext(AuthContext);

  const handleLogin = async ({ email, password }) => {
    setLoading(true);
    try {
        const data = await login({ email, password });
        setUser(data.user);
        return { success: true };
    } catch (err) {
        const message = err.response?.data?.message || err.message;
        console.error("Login failed:", err.response?.status, message);
        return { success: false, message };
    } finally {
        setLoading(false);
    }
};

 const handleRegister = async ({ email, password }) => {
    setLoading(true);
    try {
        const data = await register({ email, password });
        setUser(data.user);
        return { success: true };
    } catch (err) {
        const message = err.response?.data?.message || err.message;
        console.error("Login failed:", err.response?.status, message);
        return { success: false, message };
    } finally {
        setLoading(false);
    }
};

    const handleLogout = async () => {
        setLoading(true);
        try {
            await logout();
            setUser(null);
        } catch (err) {
            console.error("Logout failed:", err);
        } finally {
            setLoading(false);
        }
    };

    return { user, loading, handleRegister, handleLogin, handleLogout };
};