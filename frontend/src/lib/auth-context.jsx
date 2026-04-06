import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authApi, getAccessToken, hadAuthSession, setAccessToken } from "./api";
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        const bootstrap = async () => {
            try {
                if (!getAccessToken()) {
                    if (!hadAuthSession()) {
                        setUser(null);
                        return;
                    }
                    try {
                        const refreshResponse = await authApi.refresh();
                        setAccessToken(refreshResponse.data.data.accessToken);
                    }
                    catch {
                        setAccessToken(null);
                        setUser(null);
                        return;
                    }
                }
                const response = await authApi.me();
                setUser(response.data.data);
            }
            catch {
                setAccessToken(null);
                setUser(null);
            }
            finally {
                setIsLoading(false);
            }
        };
        void bootstrap();
    }, []);
    const value = useMemo(() => ({
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login: async (payload) => {
            const response = await authApi.login(payload);
            const authUser = response.data.data.user;
            setAccessToken(response.data.data.accessToken);
            setUser(authUser);
            return authUser;
        },
        register: async (payload) => {
            const response = await authApi.register(payload);
            return response.data.data;
        },
        logout: async () => {
            try {
                await authApi.logout();
            }
            finally {
                setAccessToken(null);
                setUser(null);
            }
        },
    }), [user, isLoading]);
    return _jsx(AuthContext.Provider, { value: value, children: children });
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth phải được sử dụng trong AuthProvider");
    }
    return context;
};
